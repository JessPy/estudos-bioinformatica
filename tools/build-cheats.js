#!/usr/bin/env node
// Gera data/cheatsheets.js a partir de data/cheatsheets/*.md e confere a cobertura.
// Formato dos .md: cada resumo começa com uma linha "@@ MÓDULO:índice" (índice do tópico, a partir de 0).
// Uso: node tools/build-cheats.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), dir = path.join(root, "data", "cheatsheets");
const out = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md")).sort()) {
  let key = null;
  for (const line of fs.readFileSync(path.join(dir, f), "utf8").split("\n")) {
    const m = line.match(/^@@\s+([A-Z0-9]+:\d+)\s*$/);
    if (m) { key = m[1]; if (out[key] != null) throw new Error(`Chave repetida: ${key} (${f})`); out[key] = ""; continue; }
    if (key) out[key] += line + "\n";
  }
}
Object.keys(out).forEach((k) => { out[k] = out[k].trim(); });
// Validação contra o currículo
global.window = {};
["materials.js", "gogenetic.js", "curriculum.js"].forEach((f) => require(path.join(root, "data", f)));
const want = window.MODULES.flatMap((m) => m.topics.map((_, i) => `${m.id}:${i}`));
const missing = want.filter((k) => !out[k]), extra = Object.keys(out).filter((k) => !want.includes(k));
fs.writeFileSync(path.join(root, "data", "cheatsheets.js"), `// Gerado por tools/build-cheats.js a partir de data/cheatsheets/*.md — não edite à mão.\nwindow.CHEATS = ${JSON.stringify(out, null, 1)};\n`);
console.log(`${Object.keys(out).length} resumos gravados em data/cheatsheets.js`);
if (missing.length) console.log(`Sem resumo (${missing.length}): ${missing.join(" ")}`);
if (extra.length) { console.log(`Chaves que não existem no currículo: ${extra.join(" ")}`); process.exitCode = 1; }
