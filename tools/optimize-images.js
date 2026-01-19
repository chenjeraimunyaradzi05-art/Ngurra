#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const inputs = [
  'assets/img/hero-aboriginal.jpg',
  'assets/img/hero-study.jpg',
  'assets/img/hero-community.jpg'
];

const sizes = [480, 800, 1200, 1600];

(async () => {
  console.log('Starting image optimization...');

  for (const input of inputs) {
    if (!fs.existsSync(input)) {
      console.warn('Missing file:', input);
      continue;
    }

    const dirname = path.dirname(input);
    const basename = path.basename(input, path.extname(input));

    for (const w of sizes) {
      const outWebp = path.join(dirname, `${basename}-${w}.webp`);
      const outJpg = path.join(dirname, `${basename}-${w}.jpg`);

      console.log(`Generating ${path.basename(outWebp)} and ${path.basename(outJpg)}...`);

      try {
        // WebP - balanced quality and effort
        await sharp(input)
          .resize({ width: w })
          .webp({ quality: 80, effort: 6 })
          .toFile(outWebp);

        // Progressive/optimized JPEG fallback
        await sharp(input)
          .resize({ width: w })
          .jpeg({ quality: 82, chromaSubsampling: '4:2:0', mozjpeg: true })
          .toFile(outJpg);
      } catch (err) {
        console.error('Error processing', input, w, err);
      }
    }
  }

  console.log('\nImage generation complete. Created WebP + resized JPEGs for', inputs.length, 'images.');
})();
