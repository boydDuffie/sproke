#!/usr/bin/env node
/* Bundle Sproke into one self-contained HTML file: dist/sproke.html
 *
 *   node tools/build.js              a complete page you can open, email or host anywhere
 *   node tools/build.js --fragment   only the page content (no <html>/<head>/<body>), for embedding
 *   node tools/build.js --append x.js   also include an extra script after the app
 */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const extra = args.includes('--append') ? fs.readFileSync(args[args.indexOf('--append') + 1], 'utf8') : '';
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const html = read('index.html');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const css = read('css/app.css');
const fonts = (html.match(/<link rel="stylesheet" href="(https:\/\/fonts[^"]+)">/) || [])[1];
const js = scripts.map((f) => read(f)).concat(extra ? [extra] : []).join('\n').replace(/<\/script/gi, '<\\/script');
const icon = 'data:image/svg+xml;base64,' + Buffer.from(read('icons/icon.svg')).toString('base64');

const head = [
  '<title>Sproke</title>',
  fragment ? '<meta name="claude:viewport-fit-sides" content="cover">' : '',
  fonts ? '<link rel="stylesheet" href="' + fonts + '">' : '',
  '<style>\n' + css + '</style>'
].filter(Boolean).join('\n');
const body = '<div id="app"></div>\n<div id="overlay"></div>\n<script>\n' + js + '\n</script>';

const out = fragment
  ? head + '\n' + body + '\n'
  : '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
    '<meta name="theme-color" content="#3DA35D">\n<link rel="icon" href="' + icon + '">\n' + head + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const file = path.join(root, 'dist', fragment ? 'sproke.fragment.html' : 'sproke.html');
fs.writeFileSync(file, out);
console.log(path.relative(root, file) + '  ' + Math.round(out.length / 1024) + ' KB');
