#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function existsPublic(rel) { const p = path.resolve(process.cwd(), 'public', rel.replace(/^\//, '')); return fs.existsSync(p); }

const regionsFile = path.resolve(process.cwd(), 'pages/pokemon/regions/[region].tsx');
const mappingFile = path.resolve(process.cwd(), 'utils/scrapedImageMapping.ts');

const regionsSrc = read(regionsFile);
const mappingSrc = read(mappingFile);

function extractArrayBlock(src, key) {
  const re = new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'g');
  const blocks = [];
  let m; while ((m = re.exec(src)) !== null) { blocks.push(m[1]); }
  return blocks;
}
function extractNamesFromObjectsBlock(block) {
  const re = /name:\s*"([^"]+)"/g;
  const names = new Set();
  let m; while ((m = re.exec(block)) !== null) { names.add(m[1]); }
  return names;
}
function extractChampionNames(src) {
  const re = /champion:\s*\{[\s\S]*?name:\s*"([^"]+)"[\s\S]*?\}/g;
  const names = new Set();
  let m; while ((m = re.exec(src)) !== null) { names.add(m[1]); }
  return names;
}

// Region-defined names
const gymLeaderBlocks = extractArrayBlock(regionsSrc, 'gymLeaders');
const eliteFourBlocks = extractArrayBlock(regionsSrc, 'eliteFour');
const gymLeaderNames = new Set();
const eliteFourNames = new Set();

gymLeaderBlocks.forEach(b => extractNamesFromObjectsBlock(b).forEach(n => gymLeaderNames.add(n)));
eliteFourBlocks.forEach(b => extractNamesFromObjectsBlock(b).forEach(n => eliteFourNames.add(n)));
const championNames = extractChampionNames(regionsSrc);

// Mapping-defined keys and first image paths
function extractMapping(name) {
  const startRe = new RegExp(`const\\s+${name}\\s*:\\s*ImageMapping\\s*=\\s*\\{`);
  const startIdx = mappingSrc.search(startRe);
  if (startIdx === -1) return { map: new Map() };
  const rest = mappingSrc.slice(startIdx);
  const endIdx = rest.indexOf('};');
  const body = rest.slice(0, endIdx);
  const entryRe = /'([^']+)'\s*:\s*\[\s*'([^']+)'/g;
  const map = new Map();
  let m; while ((m = entryRe.exec(body)) !== null) { map.set(m[1], m[2]); }
  return { map };
}

const leaderMap = extractMapping('gymLeaderImages').map;
const eliteMap = extractMapping('eliteFourImages').map;
const champMap = extractMapping('championImages').map;

function diffAndCheck(setNames, mapping, label) {
  const missingMapping = [];
  const missingFiles = [];
  for (const name of setNames) {
    const img = mapping.get(name);
    if (!img) { missingMapping.push(name); continue; }
    if (!existsPublic(img)) { missingFiles.push({ name, img }); }
  }
  return { label, missingMapping, missingFiles };
}

const leaderReport = diffAndCheck(gymLeaderNames, leaderMap, 'Gym Leaders');
const eliteReport = diffAndCheck(eliteFourNames, eliteMap, 'Elite Four');
const champReport = diffAndCheck(championNames, champMap, 'Champions');

const result = { leaders: leaderReport, elite: eliteReport, champions: champReport };

const hasIssues = [leaderReport, eliteReport, champReport].some(r => r.missingMapping.length || r.missingFiles.length);

if (!hasIssues) {
  console.log('[OK] All trainer assets found for leaders, elite four, and champions.');
} else {
  console.log('[VALIDATION REPORT]');
  for (const r of [leaderReport, eliteReport, champReport]) {
    console.log(`\n=== ${r.label} ===`);
    if (r.missingMapping.length) {
      console.log('Missing mapping keys:', r.missingMapping.join(', '));
    } else {
      console.log('All names have mappings.');
    }
    if (r.missingFiles.length) {
      console.log('Missing files:');
      r.missingFiles.forEach(x => console.log(` - ${x.name} -> ${x.img}`));
    } else {
      console.log('All mapped files exist.');
    }
  }
}
