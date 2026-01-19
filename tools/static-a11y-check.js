#!/usr/bin/env node
// Lightweight static accessibility checks for HTML files in project root
// This is a shallow heuristic tool to quickly surface common issues (missing alt, missing labels, empty links)
// Usage: node tools/static-a11y-check.js

const fs = require('fs');
const path = require('path');

function readHtmlFiles(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  return files.map(f => ({ name: f, content: fs.readFileSync(path.join(dir, f),'utf8')}));
}

function check(file) {
  const issues = [];
  const c = file.content;

  // Check for lang attr on <html>
  if(!/\<html[^>]*lang=/i.test(c)) issues.push('Document missing lang attribute on <html>');

  // images missing alt or empty alt
  const imgs = [...c.matchAll(/<img\s+([^>]+)>/ig)];
  imgs.forEach(m => {
    const attrs = m[1];
    if(!/\balt=/i.test(attrs)) issues.push('Image tag missing alt attribute: ' + m[0].slice(0,80));
    else {
      const alt = attrs.match(/\balt=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const value = alt && (alt[1]||alt[2]||alt[3]||'');
      if(value.trim().length === 0) issues.push('Image has empty alt attribute (consider decorative role or descriptive text): ' + m[0].slice(0,80));
    }
  });

  // links with no accessible name or empty href
  const anchors = [...c.matchAll(/<a\s+([^>]+)>([\s\S]*?)<\/a>/ig)];
  anchors.forEach(m => {
    const attrs = m[1];
    if(!/href=/i.test(attrs)) issues.push('Anchor missing href attribute (may not be keyboard accessible): ' + m[0].slice(0,80));
    // check for text content or aria-label
    const inner = m[2].replace(/<[^>]+>/g,'').trim();
    if(!inner && !/aria\-label=/i.test(attrs) && !/title=/i.test(attrs)) issues.push('Anchor has no accessible name (no text, aria-label or title): ' + m[0].slice(0,80));
  });

  // form controls without label
  const inputs = [...c.matchAll(/<(input|select|textarea)\s+([^>]+)>/ig)];
  inputs.forEach(m => {
    const tag = m[1];
    const attrs = m[2];
    if(/type=(?:"hidden"|'hidden'|hidden)/i.test(attrs)) return;
    // if input has id then check for label for that id
    const idm = attrs.match(/id=["']?([^"'\s]+)/i);
    if(idm){
      const id = idm[1];
      const labelRegex = new RegExp(`<label[^>]+for=(?:"${id}"|'${id}'|${id})`, 'i');
      if(!labelRegex.test(c)) issues.push(`${tag}#${id} input/select/textarea missing <label for="${id}">`);
    } else {
      // maybe has aria-label
      if(!/aria\-label=/i.test(attrs) && !/aria\-labelledby=/i.test(attrs)) issues.push(`${tag} missing id or aria-label — provide accessible name`);
    }
  });

  return issues;
}

const root = process.cwd();
const files = readHtmlFiles(root);
const report = {};

files.forEach(f => {
  const issues = check(f);
  report[f.name] = issues;
});

console.log('Static a11y check results (heuristic):');
let total = 0;
Object.keys(report).forEach(k => { const count = report[k].length; total += count; console.log(`- ${k}: ${count} issues`); if(count) console.log(report[k].slice(0,6).map(x=>'  • '+x).join('\n')); });

fs.writeFileSync(path.join(root, 'tools', 'static-a11y-report.json'), JSON.stringify(report, null, 2));
console.log('\nWrote tools/static-a11y-report.json');

if(total === 0) console.log('\nNo obvious heuristic issues found. Follow up with a runtime axe audit for deeper checks.');
else console.log(`\nFound ${total} heuristic issues — review the report and fix as needed.`);

process.exit(0);
