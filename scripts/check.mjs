// 簡單的品質檢查：不需要安裝任何套件，只需要 Node.js 18 以上。
// 1. index.html 內嵌的 JavaScript 語法是否正確
// 2. 每個單字庫裡的單字，是否都有對應的圖示 (EMO) 與中文 (ZH)
// 3. 同一個單字庫裡有沒有重複的單字
// 4. 網頁引用的本機圖片是否存在
import fs from 'node:fs';
import vm from 'node:vm';

const file = new URL('../index.html', import.meta.url);
const html = fs.readFileSync(file, 'utf8');
const errors = [];

// --- 1. 語法檢查 -------------------------------------------------------
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (scripts.length === 0) errors.push('找不到內嵌的 <script>');
const code = scripts.join('\n');
try {
  new vm.Script(code, { filename: 'index.html(inline script)' });
} catch (e) {
  errors.push('JavaScript 語法錯誤：' + e.message);
}
if (!/<title>[^<]+<\/title>/.test(html)) errors.push('缺少 <title>');
if (!/<html[^>]*lang=/.test(html)) errors.push('<html> 缺少 lang 屬性');

// --- 本機圖片 -----------------------------------------------------------
for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
  const src = match[1];
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(src)) continue;
  if (!fs.existsSync(new URL(src, file))) errors.push(`找不到圖片：${src}`);
}

// --- 2. 單字、圖示、中文對照 ---------------------------------------------
function readMap(name) {
  const m = code.match(new RegExp('const ' + name + '=\\{\\};\\n\\(([\\s\\S]*?)\\)\\n\\.split'));
  const set = new Set();
  if (!m) {
    errors.push(`找不到 ${name} 對照表`);
    return set;
  }
  for (const part of m[1].matchAll(/'([^']*)'/g)) {
    for (const token of part[1].split(' ')) {
      const t = token.match(/^([a-z]+)(.+)$/u);
      if (t) set.add(t[1]);
    }
  }
  return set;
}
const emo = readMap('EMO');
const zh = readMap('ZH');

const banks = [...code.matchAll(/(?:short|long):\[([\s\S]*?)\]/g)].map((m) =>
  [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]),
);
const all = new Set();
banks.forEach((bank, i) => {
  const seen = new Set();
  for (const w of bank) {
    if (seen.has(w)) errors.push(`第 ${i + 1} 個單字庫有重複單字：${w}`);
    seen.add(w);
    all.add(w);
  }
});
for (const w of all) {
  if (!emo.has(w)) errors.push(`單字缺少圖示 (EMO)：${w}`);
  if (!zh.has(w)) errors.push(`單字缺少中文 (ZH)：${w}`);
}

// --- 結果 -----------------------------------------------------------------
if (errors.length) {
  console.error('❌ 檢查失敗：');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✅ 檢查通過：${banks.length} 個單字庫，共 ${all.size} 個不同單字，皆有圖示與中文。`);
