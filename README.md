# 👾 萌萌打字大冒險 (Cute Typing Adventure)

[![Deploy to GitHub Pages](https://github.com/NerdySan/cute-typing-game/actions/workflows/deploy.yml/badge.svg)](https://github.com/NerdySan/cute-typing-game/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

給小朋友的可愛風格英文打字遊戲：看到怪獸頭上的字母或單字，照著打出來，就能把牠們變成星星！
遊戲由 `index.html` 和狗狗圖片組成，**不需要安裝、不需要建置**，用瀏覽器打開就能玩。

> 🎮 線上玩：`https://nerdysan.github.io/cute-typing-game/`

> **English summary:** a kid-friendly static typing game. Type the letters or words above cute 3D monsters to pop them. Includes a free-typing mode and a bilingual (English / 繁體中文) word library. No build step, no dependencies to install; it is designed to be hosted on GitHub Pages.

## ✨ 特色

- **五種玩法**：
  - 🐙 **單字打怪物**：短單字、長單字，可選難度（簡單／普通／困難）與主題
  - 🐶 **單字圖像大冒險**：打出圖像對應的英文單字陪會搖尾巴的狗狗吃飯，挑戰簡單、普通、困難各兩關
  - 🔤 **ABC 字母打怪物**：一次打一個字母，適合剛開始學的小朋友
  - ⌨️ **自由敲敲樂**：隨便敲鍵盤，畫面只顯示打出來的字，並念出英文字母和數字
  - 📖 **單字字庫**：中英文對照，可依分類與關鍵字查詢，點一下就能聽發音
- **3D 畫面**（Three.js）：圓滾滾的 3D 動物怪獸、爆炸碎片、衝擊波、畫面震動、連擊特效
- **630 個適合小朋友的單字**，每個單字都有對應的圖示與中文
- **主題字庫**：動物、食物、大自然、交通、太空、學校、顏色形狀
- **友善設計**：打錯不扣分（單字要重打）、可調字體大小（大／中／小）、可調速度（慢／正常／快）
- **英文發音**：使用瀏覽器內建語音（優先挑選英文女聲）
- **不收集任何個人資料**：不使用 cookie、不連到任何追蹤服務；最高分、字體大小、3D 開關只存在瀏覽器的 localStorage

## 🕹️ 怎麼玩

1. 打開網頁，在首頁選一種玩法。
2. 看到怪獸頭上或圖像下方的字，用鍵盤打出來。**打到一半打錯，這個字要從頭再打。**
3. 單字打怪物模式中，怪獸掉到地上會少一顆愛心（共 5 顆）；每打倒 5 個升一級，連續打對還有「連擊」加分。
4. 單字圖像大冒險中，每關答對 5 題即可過關，食物會逐漸減少；食物盆依序為青銅、白銀、黃金、白金、鑽石與彩虹。前 5 關過關後食物自動補滿，第 6 關過關後狗狗會開心跳舞。題目不分類。
5. 上方列可以切換：🏠 回首頁、`Aa` 字體大小、🐰 速度、🔊 聲音開關。

## 🚀 在自己的電腦上執行

只要有瀏覽器就可以：

```bash
git clone https://github.com/NerdySan/cute-typing-game.git
cd cute-typing-game
# 方法 1：直接用瀏覽器打開 index.html
# 方法 2：開一個本機伺服器（建議，語音與 3D 比較穩定）
npm start            # Windows 使用 python，macOS/Linux 使用 python3
# 然後開啟 http://localhost:8080
```

啟動本機伺服器需要 Python 3 和 Node.js；也可以直接執行
`python -m http.server 8080`（Windows）或 `python3 -m http.server 8080`（macOS/Linux），不需要 Node.js。

品質檢查（需要 Node.js 18 以上，不需要 `npm install`）：

```bash
npm run check
```

## 📁 專案結構

```
.
├── index.html                  # 整個遊戲（HTML + CSS + JavaScript）
├── assets/                     # 狗狗圖片
├── scripts/check.mjs           # 語法與單字庫檢查
├── scripts/serve.mjs           # 使用 Python 啟動本機伺服器
├── .github/
│   ├── workflows/ci.yml        # Pull Request 自動檢查
│   └── workflows/deploy.yml    # 檢查通過後自動部署到 GitHub Pages
├── docs/
│   ├── GITHUB_PAGES_SETUP.md   # 如何用 GitHub 架設這個遊戲（新手教學）
│   └── CICD.md                 # 如何實作 CI/CD
├── .nojekyll                   # 告訴 GitHub Pages 不要用 Jekyll 處理
├── LICENSE                     # MIT 授權
└── package.json                # 只用來放 npm 指令，沒有任何相依套件
```

## 🛠️ 想改單字？

單字都在 `index.html` 的 `<script>` 裡，搜尋下面這些名稱：

| 名稱 | 內容 |
|---|---|
| `WORDS` | 綜合字庫，分成 `short`（短單字）與 `long`（長單字） |
| `THEMES` | 各主題字庫（動物、食物…），格式同上 |
| `EMO` | 單字對應的圖示（格式：`單字` 緊接著 emoji，例如 `cat🐱`） |
| `ZH` | 單字對應的中文（格式：`單字` 緊接著中文，例如 `cat貓`） |

新增單字的步驟：

1. 把單字（小寫英文）加進想要的字庫陣列，**越簡單的放越前面**（難度是依照順序切分的）。
2. 在 `EMO` 與 `ZH` 兩張對照表各加上一筆，用空白分隔。
3. 執行 `npm run check`，確認每個單字都有圖示和中文。

## 🌐 瀏覽器支援與已知限制

- 建議使用最新版 Chrome、Edge、Safari、Firefox，電腦與手機都可以玩。
- **3D 畫面需要 WebGL**；如果裝置不支援或 3D 出錯，遊戲會自動退回 2D 畫面。也可以在「單字打怪物」設定畫面手動關閉 3D。
- **英文發音使用瀏覽器內建語音**，不同裝置聲音不同；如果裝置沒有英文語音，就不會念。
- 圖示使用 Unicode emoji，樣子依作業系統而不同。
- 3D 函式庫與字型是從網路載入（見下方第三方資源），第一次載入需要連網。

## 📦 第三方資源

| 資源 | 用途 | 授權 |
|---|---|---|
| [three.js](https://threejs.org/) r128（透過 cdnjs 載入） | 3D 畫面 | MIT |
| [Fredoka](https://fonts.google.com/specimen/Fredoka)、[Zen Maru Gothic](https://fonts.google.com/specimen/Zen+Maru+Gothic)（透過 Google Fonts 載入） | 字型 | SIL Open Font License 1.1 |

## 📚 文件

- [如何用 GitHub 架設這個遊戲](docs/GITHUB_PAGES_SETUP.md)
- [如何實作 CI/CD](docs/CICD.md)

## 🤝 貢獻

歡迎開 Issue 或 Pull Request！送出前請先執行 `npm run check`。

## 📄 授權

以 [MIT License](LICENSE) 釋出。使用前請記得把 `LICENSE` 裡的 `<你的名字或組織 / YOUR NAME>` 換成你自己的名字。
