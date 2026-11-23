# 用 GitHub 架設「萌萌打字大冒險」

這份文件教你把遊戲放到 GitHub，並用 **GitHub Pages** 免費變成一個任何人都能打開的網站。
完成後網址會長這樣：

```
https://<你的帳號>.github.io/<倉庫名稱>/
```

> 遊戲只有一個 `index.html`，不需要伺服器、資料庫或建置步驟，所以非常適合 GitHub Pages。

---

## 事前準備

- 一個 GitHub 帳號（到 <https://github.com/signup> 免費註冊）。
- 解壓縮好的專案資料夾（就是你拿到的這份檔案）。
- （可選）安裝 [Git](https://git-scm.com/downloads)。**用方法 A 不需要。**

> ⚠️ 免費帳號的 GitHub Pages 需要 **公開（Public）倉庫**。私人倉庫要付費方案才能用 Pages。

---

## 方法 A：直接在網頁上傳（最簡單，不需要安裝任何東西）

### 1. 建立倉庫

1. 登入 GitHub，點右上角 **+ → New repository**。
2. **Repository name** 取個名字，例如 `cute-typing-game`（這會成為網址的一部分，建議用英文小寫和減號）。
3. 選 **Public**。
4. **不要**勾選「Add a README file」「Add .gitignore」「Choose a license」（專案裡已經有了）。
5. 按 **Create repository**。

### 2. 上傳檔案

1. 在新倉庫頁面點 **uploading an existing file**。
2. 把專案資料夾**裡面的所有檔案和資料夾**拖進去（不是拖資料夾本身）。
3. 往下捲，按 **Commit changes**。

> 📌 **隱藏資料夾要注意**：`.github`（自動部署用）和 `.nojekyll` 是以「.」開頭的隱藏項目。
> - macOS：在 Finder 按 `Cmd + Shift + .` 顯示隱藏檔案。
> - Windows：檔案總管 →「檢視」→ 勾選「隱藏的項目」。
> - 如果網頁上傳漏掉了，改用方法 B，或之後在 GitHub 網頁上按 **Add file → Create new file**，手動貼上內容。

### 3. 開啟 GitHub Pages

1. 進入倉庫的 **Settings → Pages**。
2. **Build and deployment → Source** 選 **Deploy from a branch**。
3. **Branch** 選 `main`，資料夾選 `/ (root)`，按 **Save**。
4. 等 1 到 2 分鐘，重新整理這個頁面，上方會出現：
   **Your site is live at `https://<你的帳號>.github.io/<倉庫名稱>/`** 🎉

> 如果之後想改用自動部署（CI/CD），把 **Source** 改成 **GitHub Actions**，詳見 [CICD.md](CICD.md)。
> 兩種不要同時使用。

---

## 方法 B：用 Git 指令上傳

先在 GitHub 建立一個**空的**倉庫（步驟同方法 A 的「建立倉庫」），然後在專案資料夾裡執行：

```bash
git init -b main
git add .
git commit -m "feat: 第一版萌萌打字大冒險"
git remote add origin https://github.com/<你的帳號>/<倉庫名稱>.git
git push -u origin main
```

第一次推送時，GitHub 會要求登入：

- **最簡單**：安裝 [GitHub CLI](https://cli.github.com/)，執行 `gh auth login`，照指示用瀏覽器登入。
- 或使用 **Personal Access Token**：GitHub → Settings → Developer settings → Personal access tokens，
  建立一個有 `repo` 權限的 token，在要求輸入密碼時貼上 token（**不是**你的登入密碼）。

推送完成後，接著做方法 A 的「**3. 開啟 GitHub Pages**」。

---

## 上傳前請先做的 3 件事

1. **修改授權人名稱**：打開 `LICENSE`，把 `<你的名字或組織 / YOUR NAME>` 換成你的名字。
2. **修改 README 的連結**：把 `README.md` 裡所有的 `<你的帳號>` 與 `<你的倉庫>` 換成真的名稱（建議用編輯器的「取代全部」）。
3. **本機測試一次**：在專案資料夾執行 `npm start`，用瀏覽器開 <http://localhost:8080>，確認遊戲能玩。

---

## 更新遊戲

1. 修改 `index.html`（例如新增單字）。
2. 用 Git：`git add . && git commit -m "新增單字" && git push`；
   或在 GitHub 網頁上打開檔案，按右上角鉛筆圖示直接編輯後 **Commit changes**。
3. 等 1 到 2 分鐘，網站就會更新。
4. 如果打開網頁還是舊的，按 `Ctrl + F5`（Mac：`Cmd + Shift + R`）強制重新整理。

---

## 使用自己的網域（可選）

1. 在網域商那邊新增一筆 DNS 記錄：
   - 子網域（例如 `game.example.com`）：**CNAME** 指向 `<你的帳號>.github.io`
   - 根網域（`example.com`）：新增 **A** 記錄，IP 請以 [GitHub 官方文件](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site) 為準
2. 到 **Settings → Pages → Custom domain** 填入網域，按 **Save**。
3. DNS 生效後，勾選 **Enforce HTTPS**。

---

## 在手機與平板上使用

- 直接用手機瀏覽器開網址即可，點一下畫面會跳出鍵盤。
- iPhone / iPad：Safari → 分享 → **加入主畫面**；Android：Chrome 選單 → **加到主畫面**，之後就像 App 一樣一點就開。

---

## 常見問題

| 狀況 | 原因與解法 |
|---|---|
| 網址顯示 **404** | 剛設定完需要等 1 到 2 分鐘；檢查 Pages 的分支是 `main`、資料夾是 `/ (root)`；確認 `index.html` 在倉庫**最外層**，而且檔名全小寫。 |
| 網頁是空白或沒有反應 | 按 F12 看 Console 的錯誤訊息；確認 `index.html` 完整上傳沒有被截斷。 |
| 看不到 3D，只有 2D 畫面 | 瀏覽器不支援 WebGL，或學校／公司網路擋住了 `cdnjs.cloudflare.com`。遊戲會自動退回 2D，仍然可以玩。 |
| 沒有聲音 | 先確認右上角不是 🔇；瀏覽器通常要先點一下畫面才允許發出聲音；iPhone 請關閉靜音模式。 |
| 英文發音的聲音不好聽 | 發音用的是裝置內建語音，各裝置不同；可以到作業系統設定下載更好的英文語音。 |
| 打字沒反應 | 先點一下遊戲畫面；電腦的輸入法停在中文也可以玩，不需要切換。 |
| 我改了檔案但網站沒變 | 到倉庫的 **Actions** 分頁看有沒有部署失敗；清瀏覽器快取。 |
| 想讓倉庫變私人 | 免費帳號私人倉庫無法使用 Pages；要付費方案，或改用其他免費靜態網站服務。 |

---

## 限制與注意事項

- GitHub Pages 有使用限制（例如網站大小約 1 GB、每月流量約 100 GB 的軟性限制），這個遊戲只有約 70 KB，
  一般使用遠遠不會超過。最新數字請看[官方文件](https://docs.github.com/pages/getting-started-with-github-pages/github-pages-limits)。
- GitHub Pages 是**公開**的，任何人都能看到網頁和原始碼，不要放任何密碼或金鑰。（這個遊戲本來就不需要。）
- **兒童隱私**：遊戲不收集個人資料、不使用 cookie。最高分等設定只存在每個人自己瀏覽器的 localStorage，不會上傳。
- 遊戲會從網路載入 three.js（cdnjs）和字型（Google Fonts），第一次開啟需要連網。
  如果你想完全不依賴外部網站，可以把 three.js 下載後放進倉庫，並修改 `index.html` 裡的 `<script src=...>`。
