// 簡單的品質檢查：不需要安裝任何套件，只需要 Node.js 18 以上。
// 1. 網頁內嵌及本機 JavaScript 語法是否正確
// 2. 每個單字庫裡的單字，是否都有對應的圖示檔案與中文 (ZH)
// 3. 同一個單字庫裡有沒有重複的單字
// 4. 網頁引用的本機圖片是否存在
import fs from 'node:fs';
import vm from 'node:vm';

const file = new URL('../index.html', import.meta.url);
const html = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const errors = [];

// --- 1. 語法檢查 -------------------------------------------------------
const scripts = [];
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  const src = match[1].match(/\bsrc=["']([^"']+)["']/i);
  if (src && /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(src[1])) continue;
  const name = src ? src[1] : 'index.html(inline script)';
  let content = match[2];
  if (src) {
    const path = new URL(src[1], file);
    if (!fs.existsSync(path)) {
      errors.push(`找不到 JavaScript：${src[1]}`);
      continue;
    }
    content = fs.readFileSync(path, 'utf8');
  }
  content = content.replace(/\r\n/g, '\n');
  scripts.push(content);
  try {
    new vm.Script(content, { filename: name });
  } catch (e) {
    errors.push(`${name} JavaScript 語法錯誤：${e.message}`);
  }
}
if (scripts.length === 0) errors.push('找不到本機 JavaScript');
const code = scripts.join('\n');
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
const zh = readMap('ZH');

const imageGroups = code.match(/const WORD_IMAGE_GROUPS=\{([\s\S]*?)\n\};/);
const images = new Set();
if (!imageGroups) {
  errors.push('找不到單字圖片分類');
} else {
  const groups = [...imageGroups[1].matchAll(/^\s*([a-z]+):"([a-z ]+)"[,]?$/gm)];
  if (!groups.length) errors.push('單字圖片分類格式錯誤');
  for (const [, category, words] of groups) {
    for (const word of words.split(' ')) {
      if (images.has(word)) errors.push(`單字圖片重複分類：${word}`);
      images.add(word);
      const src = `assets/words/${category}/${word}.svg`;
      if (!fs.existsSync(new URL(src, file))) errors.push(`找不到單字圖片：${src}`);
    }
  }
}

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
  if (!images.has(w)) errors.push(`單字缺少圖片：${w}`);
  if (!zh.has(w)) errors.push(`單字缺少中文 (ZH)：${w}`);
}

// 迷宮只使用圖像與單字相符的精選題庫。
const mazeMatch = code.match(/const MAZE_WORDS='([^']+)'\.split\(' '\)/);
if (!mazeMatch) {
  errors.push('找不到迷宮精選題庫');
} else {
  const words = mazeMatch[1].split(' ');
  if (words.length <= 12) errors.push('迷宮題庫需要超過 12 個單字');
  if (new Set(words).size !== words.length) errors.push('迷宮題庫有重複單字');
  for (const w of words) {
    if (!images.has(w)) errors.push(`迷宮單字缺少圖片：${w}`);
    if (!zh.has(w)) errors.push(`迷宮單字缺少中文 (ZH)：${w}`);
  }
}

// --- 結果 -----------------------------------------------------------------
if (errors.length) {
  console.error('❌ 檢查失敗：');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✅ 檢查通過：${banks.length} 個單字庫，共 ${all.size} 個不同單字，皆有圖示與中文。`);
