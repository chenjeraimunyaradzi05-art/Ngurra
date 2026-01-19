// Simple contrast checker script for this repo
// Usage: node tools/contrast-check.js
// Reads css/general.css and extracts :root variables then reports contrast ratios

const fs = require('fs');
const path = require('path');

function readCSS() {
  const p = path.join(__dirname, '..', 'css', 'general.css');
  return fs.readFileSync(p, 'utf8');
}

function parseRootVariables(css) {
  const m = css.match(/:root\s*\{([\s\S]*?)\}\s*/);
  if(!m) return {};
  const body = m[1];
  const lines = body.split(/;\s*/).map(l=>l.trim()).filter(Boolean);
  const vars = {};
  lines.forEach(l=>{
    const mm = l.match(/(--[\w-]+)\s*:\s*(.+)$/);
    if(mm){ vars[mm[1]] = mm[2].trim().replace(/\n/g,' '); }
  });
  return vars;
}

function hexToRgb(hex) {
  hex = hex.replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const r = parseInt(hex.slice(0,2),16);
  const g = parseInt(hex.slice(2,4),16);
  const b = parseInt(hex.slice(4,6),16);
  return [r,g,b];
}

function parseColor(s){
  if(!s) return null;
  s = s.trim();
  // hex
  const hexm = s.match(/#([A-Fa-f0-9]{3,6})/);
  if(hexm){ try{ return {type:'rgb', vals: hexToRgb('#'+hexm[1])}; }catch(e){} }
  // rgba or rgb
  const rgbm = s.match(/rgba?\(\s*([0-9.\s,%-]+)\)/);
  if(rgbm){
    const parts = rgbm[1].split(',').map(p=>p.trim());
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    const a = parts[3] !== undefined ? Number(parts[3]) : 1;
    return { type:'rgb', vals:[r,g,b], alpha: a };
  }
  // fallback, unknown
  return null;
}

function blendOver(bgRgb, fgRgb, alpha){
  // composite fg over bg with alpha
  return [
    Math.round((alpha * fgRgb[0]) + ((1-alpha) * bgRgb[0])),
    Math.round((alpha * fgRgb[1]) + ((1-alpha) * bgRgb[1])),
    Math.round((alpha * fgRgb[2]) + ((1-alpha) * bgRgb[2]))
  ];
}

function srgbToLin(v){ v = v/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
function luminance(rgb){ const r = srgbToLin(rgb[0]); const g = srgbToLin(rgb[1]); const b = srgbToLin(rgb[2]); return 0.2126*r + 0.7152*g + 0.0722*b; }
function contrastRatio(rgb1, rgb2){ const L1 = luminance(rgb1); const L2 = luminance(rgb2); const light = Math.max(L1,L2); const dark = Math.min(L1,L2); return +( (light + 0.05) / (dark + 0.05) ).toFixed(2); }

function darkenRgb(rgb, pct){ return rgb.map(v => Math.max(0, Math.round(v * (1 - pct/100)))); }
function lightenRgb(rgb, pct){ return rgb.map(v => Math.min(255, Math.round(v + (255-v) * (pct/100)))); }
function rgbToHex(rgb){ return '#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''); }

// Main
(function main(){
  const css = readCSS();
  const vars = parseRootVariables(css);
  console.log('\nFound', Object.keys(vars).length, 'root variables.\n');

  // helper to pick variable or fallbacks
  const lookup = (name) => vars[name] || null;

  const textMain = parseColor(lookup('--text-main')) || { vals:[15,17,42] };
  const textMuted = parseColor(lookup('--text-muted')) || { vals:[71,85,105] };
  const primary = parseColor(lookup('--primary')) || { vals:[99,102,241] };
  const primaryDark = parseColor(lookup('--primary-dark')) || { vals:[79,70,229] };
  const accent = parseColor(lookup('--accent')) || { vals:[236,72,153] };
  const white = parseColor(lookup('--white')) || { vals:[255,255,255] };
  const sand = parseColor(lookup('--sand')) || { vals:[255,250,252] };

  // header bg vars may be rgba; use those and composite over sand
  const hdrStart = parseColor(lookup('--header-bg-start')) || { vals:[99,102,241], alpha:1 };
  const hdrMid   = parseColor(lookup('--header-bg-mid')) || { vals:[168,85,247], alpha:1 };
  const hdrEnd   = parseColor(lookup('--header-bg-end')) || { vals:[236,72,153], alpha:1 };

  const bgSand = (sand && sand.vals) ? sand.vals : [255,255,255];

  function compositeVar(v){
    if(!v) return null;
    const alpha = v.alpha === undefined ? 1 : Number(v.alpha);
    if(alpha >= 0.999) return v.vals;
    return blendOver(bgSand, v.vals, alpha);
  }

  const headerAvg = [
    Math.round((compositeVar(hdrStart)[0] + compositeVar(hdrMid)[0] + compositeVar(hdrEnd)[0]) / 3),
    Math.round((compositeVar(hdrStart)[1] + compositeVar(hdrMid)[1] + compositeVar(hdrEnd)[1]) / 3),
    Math.round((compositeVar(hdrStart)[2] + compositeVar(hdrMid)[2] + compositeVar(hdrEnd)[2]) / 3)
  ];

  const pairs = [
    { a: textMain.vals, b: sand.vals, name: 'text-main on page background (var(--sand))' },
    { a: textMain.vals, b: white.vals, name: 'text-main on white' },
    { a: primary.vals, b: white.vals, name: 'primary on white' },
    { a: accent.vals, b: white.vals, name: 'accent on white' },
    { a: primary.vals, b: sand.vals, name: 'primary on page background' },
    { a: primaryDark.vals, b: white.vals, name: 'primary-dark on white' },
    { a: [255,255,255], b: headerAvg, name: 'header text (white) on header composite background' },
    { a: textMain.vals, b: headerAvg, name: 'header text (var(--text-main)) on header composite background' },
    { a: textMuted.vals, b: sand.vals, name: 'muted text on page background' }
  ];

  const rules = [ {name:'WCAG AA (normal text)', min:4.5}, {name:'WCAG AA (large text >= 18pt)', min:3}, {name:'WCAG AAA (normal text)', min:7}, {name:'WCAG AAA (large text)', min:4.5} ];

  console.log('Contrast report (lower means failing).\n');
  pairs.forEach(p=>{
    const ratio = contrastRatio(p.a, p.b);
    const note = rules.map(r=> (ratio >= r.min ? '\u2714' : '\u2718') + ' ' + r.name + (ratio >= r.min ? '' : ' (needs >= '+r.min+')') ).join(' | ');
    console.log(`- ${p.name}: ratio ${ratio} — ${note}`);

    // if failing AA normal, suggest a quick darken on foreground
    if(ratio < 4.5){
      let needed = 4.5;
      // try darkening foreground by steps to meet needed
      for(let pct=6; pct<=80; pct+=2){
        const candidate = darkenRgb(p.a, pct);
        const r2 = contrastRatio(candidate, p.b);
        if(r2 >= needed){
          console.log(`  → Suggest darken foreground by ${pct}% to ${rgbToHex(candidate)} (result ratio ${r2})`);
          break;
        }
        if(pct===80) console.log('  → No small darken found; consider stronger change (change background or use darker foreground).');
      }
    }
  });

  console.log('\nNotes & limitations:');
  console.log('- This tool performs static checks of root variables and computes simple blend over the page background for rgba variables.');
  console.log('- Gradients and CSS filters (contrast/saturate) are not simulated exactly here. If you use the theme slider, the effective contrast may change because we apply a filter on the whole page.\n');
})();
