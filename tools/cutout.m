// Subject cutout via Vision, cropped to the subject's alpha bounding box.
// Build:
//   clang -fobjc-arc tools/cutout.m -o tools/cutout \
//     -framework Foundation -framework Vision -framework CoreImage \
//     -framework CoreVideo -framework CoreGraphics
// Usage: cutout [--alpha-only] <in> <out.png> [<in> <out.png> ...]
//   --alpha-only: skip Vision masking (input already has transparency), crop only.
#import <Foundation/Foundation.h>
#import <Vision/Vision.h>
#import <CoreImage/CoreImage.h>

// Render image to RGBA8, scan alpha channel, return content rect in CIImage coords.
static CGRect alphaBBox(CIContext *ctx, CIImage *img) {
    CGImageRef cg = [ctx createCGImage:img fromRect:img.extent];
    if (!cg) return CGRectNull;
    size_t w = CGImageGetWidth(cg), h = CGImageGetHeight(cg);
    uint8_t *buf = calloc(w * h * 4, 1);
    CGColorSpaceRef cs = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
    CGContextRef bctx = CGBitmapContextCreate(buf, w, h, 8, w * 4, cs,
        kCGImageAlphaPremultipliedLast);
    CGColorSpaceRelease(cs);
    CGContextDrawImage(bctx, CGRectMake(0, 0, w, h), cg);
    CGImageRelease(cg);

    size_t minX = w, minY = h, maxX = 0, maxY = 0;
    for (size_t y = 0; y < h; y++) {
        for (size_t x = 0; x < w; x++) {
            if (buf[(y * w + x) * 4 + 3] > 16) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    CGContextRelease(bctx);
    free(buf);
    if (minX >= maxX || minY >= maxY) return CGRectNull;
    // bitmap rows are top-down; CIImage origin is bottom-left
    double bw = (double)(maxX - minX + 1), bh = (double)(maxY - minY + 1);
    double pad = 0.08 * (bw > bh ? bw : bh);
    CGRect r = CGRectMake(img.extent.origin.x + minX - pad,
                          img.extent.origin.y + (h - 1 - maxY) - pad,
                          bw + 2 * pad, bh + 2 * pad);
    return CGRectIntersection(r, img.extent);
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        int argi = 1;
        BOOL alphaOnly = NO;
        // optional pre-crop in source top-left pixel coords: --crop x,y,w,h
        BOOL hasCrop = NO;
        BOOL fullFrame = NO; // keep original canvas size (skip bbox crop)
        double cropX = 0, cropY = 0, cropW = 0, cropH = 0;
        while (argi < argc && strncmp(argv[argi], "--", 2) == 0) {
            if (strcmp(argv[argi], "--alpha-only") == 0) { alphaOnly = YES; argi++; }
            else if (strcmp(argv[argi], "--full") == 0) { fullFrame = YES; argi++; }
            else if (strcmp(argv[argi], "--crop") == 0 && argi + 1 < argc) {
                sscanf(argv[argi + 1], "%lf,%lf,%lf,%lf", &cropX, &cropY, &cropW, &cropH);
                hasCrop = YES; argi += 2;
            } else break;
        }
        if (argc - argi < 2 || (argc - argi) % 2 != 0) {
            fprintf(stderr, "usage: cutout [--alpha-only] [--full] [--crop x,y,w,h] <in> <out.png> [...]\n");
            return 1;
        }
        CIContext *ctx = [CIContext context];
        for (int i = argi; i + 1 < argc; i += 2) {
            NSString *inPath = [NSString stringWithUTF8String:argv[i]];
            NSString *outPath = [NSString stringWithUTF8String:argv[i + 1]];
            CIImage *input = [CIImage imageWithContentsOfURL:[NSURL fileURLWithPath:inPath]];
            if (!input) { printf("FAIL load %s\n", argv[i]); continue; }

            if (hasCrop) {
                // crop rect given in top-left pixel coords; CIImage origin is bottom-left
                CGRect r = CGRectMake(input.extent.origin.x + cropX,
                                      input.extent.origin.y + (input.extent.size.height - cropY - cropH),
                                      cropW, cropH);
                input = [[input imageByCroppingToRect:r]
                         imageByApplyingTransform:CGAffineTransformMakeTranslation(-r.origin.x, -r.origin.y)];
            }

            CIImage *out = input;
            if (!alphaOnly) {
                VNGenerateForegroundInstanceMaskRequest *req =
                    [[VNGenerateForegroundInstanceMaskRequest alloc] init];
                VNImageRequestHandler *handler =
                    [[VNImageRequestHandler alloc] initWithCIImage:input options:@{}];
                NSError *err = nil;
                if (![handler performRequests:@[req] error:&err]) {
                    printf("FAIL perform %s: %s\n", argv[i], err.localizedDescription.UTF8String);
                    continue;
                }
                VNInstanceMaskObservation *obs = req.results.firstObject;
                if (!obs) { printf("FAIL nomask %s\n", argv[i]); continue; }
                CVPixelBufferRef maskBuf =
                    [obs generateScaledMaskForImageForInstances:obs.allInstances
                                             fromRequestHandler:handler
                                                          error:&err];
                if (!maskBuf) {
                    printf("FAIL mask %s: %s\n", argv[i], err.localizedDescription.UTF8String);
                    continue;
                }
                CIImage *mask = [CIImage imageWithCVPixelBuffer:maskBuf];
                CIImage *clear = [[CIImage imageWithColor:[CIColor clearColor]]
                                  imageByCroppingToRect:input.extent];
                CIFilter *blend = [CIFilter filterWithName:@"CIBlendWithMask"];
                [blend setValue:input forKey:kCIInputImageKey];
                [blend setValue:clear forKey:kCIInputBackgroundImageKey];
                [blend setValue:mask forKey:kCIInputMaskImageKey];
                out = blend.outputImage;
                CVPixelBufferRelease(maskBuf);
                if (!out) { printf("FAIL blend %s\n", argv[i]); continue; }
            }

            if (fullFrame) {
                // keep the original canvas so fractional coordinates stay valid
                out = [out imageByCroppingToRect:input.extent];
            } else {
                CGRect bbox = alphaBBox(ctx, out);
                if (!CGRectIsNull(bbox) && !CGRectIsEmpty(bbox)) {
                    out = [out imageByCroppingToRect:bbox];
                }
            }

            NSError *werr = nil;
            CGColorSpaceRef cs = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
            BOOL ok = [ctx writePNGRepresentationOfImage:out
                                                   toURL:[NSURL fileURLWithPath:outPath]
                                                  format:kCIFormatRGBA8
                                              colorSpace:cs
                                                 options:@{}
                                                   error:&werr];
            CGColorSpaceRelease(cs);
            printf("%s %s\n", ok ? "OK" : "FAIL write", outPath.UTF8String);
        }
    }
    return 0;
}
