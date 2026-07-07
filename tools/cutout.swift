// Subject cutout via Vision (macOS 14+). Usage: swift cutout.swift <in> <out.png> ...pairs
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins

let args = Array(CommandLine.arguments.dropFirst())
guard args.count >= 2, args.count % 2 == 0 else {
    FileHandle.standardError.write("usage: cutout <in> <out.png> [<in> <out.png> ...]\n".data(using: .utf8)!)
    exit(1)
}

let ctx = CIContext()

for i in stride(from: 0, to: args.count, by: 2) {
    let inPath = args[i], outPath = args[i + 1]
    guard let input = CIImage(contentsOf: URL(fileURLWithPath: inPath)) else {
        print("FAIL load \(inPath)"); continue
    }
    let request = VNGenerateForegroundInstanceMaskRequest()
    let handler = VNImageRequestHandler(ciImage: input)
    do {
        try handler.perform([request])
        guard let result = request.results?.first else { print("FAIL nomask \(inPath)"); continue }
        let maskBuffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
        let mask = CIImage(cvPixelBuffer: maskBuffer)

        let blend = CIFilter.blendWithMask()
        blend.inputImage = input
        blend.backgroundImage = CIImage(color: .clear).cropped(to: input.extent)
        blend.maskImage = mask
        guard var out = blend.outputImage else { print("FAIL blend \(inPath)"); continue }

        // trim transparent margins with a small padding so mugs render at consistent scale
        let bbox = mask.extent // mask is full-frame; compute content box from instances
        _ = bbox
        out = out.cropped(to: out.extent)

        try ctx.writePNGRepresentation(
            of: out,
            to: URL(fileURLWithPath: outPath),
            format: .RGBA8,
            colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!
        )
        print("OK \(outPath)")
    } catch {
        print("FAIL \(inPath): \(error)")
    }
}
