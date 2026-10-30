#!/usr/bin/env node
// node compose.js <type> <theme-dir> [--dry]
// Installs the TECH add-ons data into a theme: writes <theme>/src/assets/js/obsidian/addons-data.js from tech-data.json
// and prints which add-ons the type uses. The logic file (addons.js) ships inside the theme itself.
const fs=require('fs'),p=require('path');
const [type,dst,...fl]=process.argv.slice(2);
const S=JSON.parse(fs.readFileSync(p.join(__dirname,'stores.json'),'utf8'));
const D=JSON.parse(fs.readFileSync(p.join(__dirname,'tech-data.json'),'utf8'));
if(!type||!S.types[type]){console.error('types:',Object.keys(S.types).join(' '));process.exit(1);}
console.log(type+': '+S.types[type].join(', '));
if(!dst)process.exit(0);
const out=p.join(dst,'src','assets','js','obsidian','addons-data.js');
if(fl.includes('--dry')){console.log('[dry] would write',out);process.exit(0);}
fs.mkdirSync(p.dirname(out),{recursive:true});
fs.writeFileSync(out,'/* Generated from tech-data.json */\nexport default '+JSON.stringify(D)+';\n');
console.log('wrote',out);
