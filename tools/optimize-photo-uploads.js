#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const dir = path.join(__dirname, '..', 'assets', 'photo-uploads');
const outDir = path.join(dir, 'generated');
const sizes = [480, 800, 1200];

(async ()=>{
  console.log('Optimizing images in', dir);
  if(!fs.existsSync(dir)){
    console.error('Directory not found:', dir); process.exit(1);
  }
  const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f));
  if(!files.length){ console.warn('No images found in', dir); return; }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for(const f of files){
    const full = path.join(dir, f);
    // Normalise output base name: remove any existing size suffixes like -480, -800, -1200
    const baseRaw = path.basename(f, path.extname(f));
    const base = baseRaw.replace(/-(?:480|800|1200)(?:-(?:480|800|1200))?$/,'');
    for(const w of sizes){
      const outWebp = path.join(outDir, `${base}-${w}.webp`);
      const outJpg = path.join(outDir, `${base}-${w}.jpg`);
      try{
        console.log('Generating', outWebp);
        await sharp(full)
          .resize({ width: w })
          .webp({ quality: 78, effort:6 })
          .toFile(outWebp);
        console.log('Generating', outJpg);
        await sharp(full)
          .resize({ width: w })
          .jpeg({ quality: 82, progressive: true, mozjpeg: true })
          .toFile(outJpg);
      }catch(err){ console.error('Error processing', f, w, err); }
    }
  }

  console.log('Done — generated sizes for', files.length, 'files.');
})();