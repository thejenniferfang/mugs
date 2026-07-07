// Merged from images/manifest-batch1-4. Curated order follows the original brand list.
const MUGS = [
  // Heath Ceramics
  { brand: "Heath Ceramics", name: "Large Mug (Coupe Line)", file: "heath/large-mug.jpg", productUrl: "https://www.heathceramics.com/products/large-mug", price: "$55" },
  { brand: "Heath Ceramics", name: "Studio Mug in Turmeric", file: "heath/studio-mug.jpg", productUrl: "https://www.heathceramics.com/products/studio-mug-turmeric", price: "$72" },
  { brand: "Heath Ceramics", name: "Stack Mug", file: "heath/stack-mug.jpg", productUrl: "https://www.heathceramics.com/products/stack-mug", price: "$60" },

  // Haand
  { brand: "Haand", name: "Diner Mug", file: "haand/diner-mug.jpg", productUrl: "https://haand.us/products/diner-mugs", price: "$45" },
  { brand: "Haand", name: "10oz Tapered Mug", file: "haand/tapered-mug.jpg", productUrl: "https://haand.us/products/10oz-tapered-mug", price: "$50" },
  { brand: "Haand", name: "10oz Short Mug", file: "haand/short-mug.jpg", productUrl: "https://haand.us/products/10oz-short-mug", price: "$48" },

  // Hasami Porcelain
  { brand: "Hasami Porcelain", name: "Mug, Natural (HP020)", file: "hasami/mug-natural.jpg", productUrl: "https://shop.tortoisegeneralstore.com/products/mug-natural-medium", price: "$36" },
  { brand: "Hasami Porcelain", name: "Mug, Black (HPB020)", file: "hasami/mug-black.jpg", productUrl: "https://shop.tortoisegeneralstore.com/products/mug-black-medium", price: "$36" },
  { brand: "Hasami Porcelain", name: "Mug, Gloss Gray (HPM020)", file: "hasami/mug-gloss-gray.jpg", productUrl: "https://shop.tortoisegeneralstore.com/products/mug-gloss-gray-medium", price: "$36" },

  // Kinto
  { brand: "Kinto", name: "SCS-S03 Mug 320ml", file: "kinto/scs-s03-mug-320ml.jpg", productUrl: "https://kinto-usa.com/products/20754", price: "$24" },
  { brand: "Kinto", name: "CLK-151 Large Mug 410ml", file: "kinto/clk-151-large-mug-410ml.jpg", productUrl: "https://kinto-usa.com/products/29517", price: "$25" },
  { brand: "Kinto", name: "SCS Stacking Mug 320ml", file: "kinto/scs-stacking-mug-320ml.jpg", productUrl: "https://kinto-usa.com/products/27657", price: "$14" },

  // CG Ceramics (CGCERAMICS, Christie Goodfellow)
  { brand: "CG Ceramics", name: "Angled Low Mug, Peat", file: "cg-ceramics/angled-low-mug-peat.jpg", productUrl: "https://www.cg-ceramics.com/shop/angled-mug-peat", price: "$54" },
  { brand: "CG Ceramics", name: "Demitasse with Saucer, Peat", file: "cg-ceramics/demitasse-with-saucer-peat.jpg", productUrl: "https://www.cg-ceramics.com/shop/demitasse-saucer-peat", price: "$42" },

  // Erin Louis (Erin Louise Clancy Studio)
  { brand: "Erin Louis", name: "GGF3.26 Mug.1", file: "erin-louis/ggf-3-26-mug-1.webp", productUrl: "https://www.erinlouiseclancy.com/shop/p/ggf1225mug1-8xfgl", price: "$100" },
  { brand: "Erin Louis", name: "GGF3.26 Mug.2", file: "erin-louis/ggf-3-26-mug-2.webp", productUrl: "https://www.erinlouiseclancy.com/shop/p/ggf1225mug1-8xfgl-d833p", price: "$100" },
  { brand: "Erin Louis", name: "GGF3.26 Mug.3", file: "erin-louis/ggf-3-26-mug-3.webp", productUrl: "https://www.erinlouiseclancy.com/shop/p/ggf1225mug1-8xfgl-d833p-rk2bd", price: "$100" },

  // Olivia Ko (Olivia Snow Ceramics)
  { brand: "Olivia Ko", name: "Handmade Angled Mug", file: "olivia-ko/angled-mug.jpg", productUrl: "https://oliviasnowceramics.com/products/handmade-angled-mug", price: "$48" },
  { brand: "Olivia Ko", name: "Everyday Mug, Glossy White", file: "olivia-ko/everyday-glossy-white-mug.jpg", productUrl: "https://oliviasnowceramics.com/products/everyday-mug-in-glossy-white", price: "$40" },
  { brand: "Olivia Ko", name: "Marbled Mug", file: "olivia-ko/marbled-mug.jpg", productUrl: "https://oliviasnowceramics.com/products/marbled-mug", price: "$45" },

  // MK Studios (MK STUDIO, Copenhagen)
  { brand: "MK Studios", name: "Moon Coffee Cup", file: "mk-studios/moon-cup.jpg", productUrl: "https://www.mk-ceramics.com/en-us/products/moon", price: "$38" },
  { brand: "MK Studios", name: "Bubble Blue Cup, Sensory S (290ml)", file: "mk-studios/bubble-blue-cup.jpg", productUrl: "https://www.mk-ceramics.com/en-us/products/bubble-blue?variant=43761287528665", price: "$38" },
  { brand: "MK Studios", name: "Black Splash Cup, Sensory S (290ml)", file: "mk-studios/black-splash-cup.jpg", productUrl: "https://www.mk-ceramics.com/en-us/products/black-splash?variant=47840214188364", price: "$34" },

  // Jars (Jars Ceramistes, France)
  { brand: "Jars", name: "Cantine Mug", file: "jars/cantine-mug.jpg", productUrl: "https://www.jarsusa.com/products/cantine-mug", price: "$50" },
  { brand: "Jars", name: "Tourron Mug, Jade", file: "jars/tourron-mug.jpg", productUrl: "https://www.jarsusa.com/products/tourron-mug", price: "$54" },
  { brand: "Jars", name: "Vuelta Mug", file: "jars/vuelta-mug.jpg", productUrl: "https://www.jarsusa.com/products/vuelta-mug", price: "$44" },

  // K.H. Wurtz (via La Cabra)
  { brand: "K.H. Würtz", name: "Cup, Light (La Cabra)", file: "kh-wurtz/cup-light.png", productUrl: "https://lacabra.com/products/k-h-wurtz-cup-light", price: "~$40" },
  { brand: "K.H. Würtz", name: "Cup, Dark (La Cabra)", file: "kh-wurtz/cup-dark.png", productUrl: "https://lacabra.com/products/kh-wurtz-cup-dark", price: "~$40" },
  { brand: "K.H. Würtz", name: "Espresso Cup (La Cabra)", file: "kh-wurtz/espresso-cup.png", productUrl: "https://lacabra.com/products/kh-wurtz-cup-espresso-dark", price: "~$62" },

  // Jono Pandolfi
  { brand: "Jono Pandolfi", name: "Mug, Coupe Collection", file: "jono-pandolfi/mug.png", productUrl: "https://jonopandolfi.com/products/mug", price: "$48" },
  { brand: "Jono Pandolfi", name: "Coffee Cup", file: "jono-pandolfi/coffee-cup.png", productUrl: "https://jonopandolfi.com/products/coffee-cups", price: "$50" },
  { brand: "Jono Pandolfi", name: "Espresso Cup", file: "jono-pandolfi/espresso-cup.png", productUrl: "https://jonopandolfi.com/products/espresso-cup", price: "$40" },

  // HAY (Barro, by MVS)
  { brand: "HAY", name: "Barro Cup, Off-White", file: "hay/barro-off-white.jpg", productUrl: "https://www.hay.com/hay/accessories/kitchen--dining/drinkware/barro-cup-set-of-2-off-white", price: "$42" },

  // HEM (Bronto, by Ana Kras)
  { brand: "HEM", name: "Bronto Espresso Cup, Sand", file: "hem/bronto-espresso-sand.jpg", productUrl: "https://hem.com/en-us/accessories/tableware/bronto/30683", price: "$45" },

  // ERA Ceramics (Brooklyn)
  { brand: "ERA Ceramics", name: "Honeycomb Mug", file: "era/honeycomb-mug.jpg", productUrl: "https://shop.eraceramics.com/products/honeycomb-mug", price: "$45" },
  { brand: "ERA Ceramics", name: "Skipping Stone Mug", file: "era/skipping-stone-mug.jpg", productUrl: "https://shop.eraceramics.com/products/skipping-stone-mug", price: "$45" },
];
