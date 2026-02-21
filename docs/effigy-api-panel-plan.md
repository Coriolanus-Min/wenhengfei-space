# 麻袋 API 面板 — 方案与实现计划

## 一、麻袋是否适合接入 API？

**结论：适合。**

- **隐喻一致**：悬停才显、低语式文案，天然适合「向十字路口的它提问 / 得到回应」的叙事（占卜、记忆、独白）。
- **已有基础**：项目里已有 `/api/chat`（`server.js` + `api/chat.js`），可复用或扩展为「麻袋对话」专用接口。
- **体验可控**：面板仅在悬停时出现，不抢主内容；API 结果以 FIFO 行形式展示，信息量可控。

---

## 二、当前 “... heavy is the damp earth ...” 文字位置

| 项目 | 说明 |
|------|------|
| **DOM** | `div.whisper-box#effigy-whisper`，与 `div.bot-icon`（麻袋）同为 `.bot-icon-container` 的子元素，且在麻袋**之前**（先渲染在上方）。 |
| **定位** | `position: absolute`；`top: 150px`、`right: 70px`（相对于 `position: fixed` 的 container，`top: 0; right: 50px`）。 |
| **视觉** | 在麻袋**左侧偏下**（约在麻袋底部附近），单行、不换行（`white-space: nowrap`），灰字 `#888`、斜体。 |
| **显示逻辑** | 仅当 `.bot-icon-container:hover` 时 `opacity: 1`，否则 `opacity: 0`；内容由 `minipet.js` 在麻袋 `mouseenter` 时从本地 `whispers[]` 随机填入。 |

即：**当前没有 API，文案是静态随机句，位置在麻袋左侧、约 150px 从顶算起。**

---

## 三、目标布局（自上而下）

目标结构（视觉顺序，从上到下）：

```
┌─────────────────────────────────────┐
│  [结果区：多行 FIFO，顶部被遮罩]      │  ← 固定高度，内部可滚动；新行在底部追加，旧行被“挤”到上方遮罩区
│  ... 行 N-2                         │
│  行 N-1                             │
│  行 N（最新）                        │
├─────────────────────────────────────┤
│  “… heavy is the damp earth …”      │  ← 保留：当前一句「低语」/ 状态（可兼作 API 占位或首句）
├─────────────────────────────────────┤
│  [输入框：用户输入并触发 API]         │  ← type 在此，提交后调用 API，结果以新行插入结果区底部
└─────────────────────────────────────┘
         [麻袋] 在右侧不变
```

- **结果区**：多行文本；新回调一行一行在**底部**追加；旧行向上移动，超出**可视区顶部**的部分进入「遮罩区」——用户需在该区域内**滚动**才能看到更早的行（FIFO + 滚动 = 顶部即“消失”进遮罩）。
- **中间一行**：保留现有 whisper 的样式与位置感，可继续做随机句，或改为「最后一条 API 摘要 / 占位提示」。
- **输入区**：在 whisper 之下，用于输入并发送请求。

---

## 四、技术实现要点

### 4.1 DOM 结构建议

- 在 `.bot-icon-container` 内、麻袋左侧，增加一个**面板容器**（例如 `div.effigy-panel`），内部顺序：
  1. **结果区**：`div.effigy-result-list`（固定高度 + `overflow-y: auto` 或 `scroll`），内部 `div.effigy-result-list-inner` 用于追加一行一行的 `div.effigy-result-line`。
  2. **当前句**：保留现有 `div.whisper-box#effigy-whisper`，可改 class 或保持，作为「当前一句」展示位。
  3. **输入区**：`div.effigy-input-wrap` > `input` 或 `textarea` + 可选发送按钮。

- 麻袋 `div.bot-icon#hanging-effigy` 保持不动，仍为悬停触发入口（或改为悬停整个 panel 也显示，依产品偏好）。

### 4.2 结果区 FIFO + “遮罩”行为

- **FIFO**：每次 API 返回一条「行」内容（或按你约定拆成多行），在结果区**底部** `append` 新节点（如 `div.effigy-result-line`）。
- **“消失”**：  
  - 结果区设固定高度（如 `max-height: 120px`）和 `overflow-y: auto`（或 `scroll`）。  
  - 内容从顶部向下排；当行数增多，**顶部行被顶出视口上方**，用户只有**向上滚动**才能再看到——即「该行被挤入遮罩区，需滚动才显现」。
- **可选**：顶部加 `mask-image: linear-gradient(transparent, black 10px)` 或顶部 `box-shadow`，让「被顶上去」的旧行在视觉上更明显地被裁掉，强化「进入遮罩」的感觉。

### 4.3 样式与定位

- 面板相对 container 绝对定位：例如在现有 `right: 70px` 附近，`top` 设一个较小值（如 `20px`），使结果区在视觉上在 whisper 之上。
- 宽度：与现有 whisper 风格统一，可设 `max-width: 200px` 或 240px，避免压住主内容。
- 字体/颜色：与 `.whisper-box` 一致（如 `#888`、Times、斜体），结果行可用同族或略小字号以区分「历史」与「当前一句」。

### 4.4 输出速率控制（“对方实时打印”）

为在有限可见区内保持**完整阅读感**，不在一次渲染整段 API 回复，而是**按速率逐字/逐词反显**，像对方在实时打字。

- **实现**：已提供 `js/typewriterReveal.js`（经典脚本，挂到 `window.revealTextAtRate`）。
- **用法**：拿到 API 的完整 `reply` 后，不直接 `innerText = reply`，而是调用  
  `revealTextAtRate(listInner, reply, options)`，由脚本按 `options` 控制速率写入 `listInner`。
- **参数建议**：
  - `unit: 'char'` 或 `'word'`：按字符或按词揭示。
  - `charsPerSecond: 25–35`：约 25–35 字/秒，阅读舒适（默认 28）。
  - `newlineAsNewLine: true`：遇到 `\n` 新建一行节点，与结果区 FIFO 多行一致。
  - `scrollToBottom`：每次揭示后滚动结果区到底部，保证当前行在可见区内。
- **与 FIFO 结合**：新行在底部追加、旧行被顶入上方遮罩，同一套逻辑；只是每一行或每段的内容是由 `revealTextAtRate` 逐步“打”出来的，而不是整段一次性出现。

### 4.5 交互与 API

- **显示/隐藏**：与现有一致，由 `.bot-icon-container:hover` 控制整块面板（结果区 + whisper + 输入）的显隐；或仅悬停麻袋时显示。
- **输入**：用户输入后 Enter 或点击发送 → 调用现有 `/api/chat` 或新接口 → 取得完整 `reply` 后**不直接整段渲染**，而是调用 `revealTextAtRate(listInner, reply, { ... })` 做速率反显；反显完成后再更新 whisper（若采用方案 B）。
- **当前句**：  
  - 方案 A：保留随机 whisper，与 API 无关。  
  - 方案 B：无请求时显示随机句，有请求后把「最后一条 API 回复的首句或摘要」显示在 whisper 位置。  

### 4.6 需要改动的文件（规划）

| 文件 | 改动 |
|------|------|
| **HTML**（各页） | 在 `bot-icon-container` 内增加 `effigy-panel` 结构：结果区容器 + 保留 whisper-box + 输入区。 |
| **minipet.css** | 面板布局；结果区固定高度、overflow、可选顶部遮罩；输入框样式。 |
| **minipet.js** | 输入提交；调用 API；用 `revealTextAtRate(listInner, reply, …)` 做速率反显而非整段渲染；可选更新 whisper。 |
| **js/typewriterReveal.js** | 已存在：`revealTextAtRate(listInner, text, options)`，按字/词速率反显，支持换行为新行、`scrollToBottom`。 |
| **server.js / api** | 若沿用现有 `/api/chat` 则可不改；若需「麻袋专用」可加路由或参数。 |

---

## 五、实施顺序建议

1. **结构 + 样式**：在单页（如 `index.html`）加 `effigy-panel` DOM 和 CSS，先不接 API，用假数据在结果区底部追加几行，确认 FIFO + 滚动 + 顶部“消失”效果。
2. **输入与 API**：接上输入框和 `/api/chat`；引入 `typewriterReveal.js`，用 `revealTextAtRate` 按速率反显 `reply`，并设 `scrollToBottom` 保持可见区跟随。
3. **当前句逻辑**：决定 whisper 是纯随机还是与最后一条 API 回复联动，再改 `minipet.js`。
4. **同步到其他页**：将同一 DOM/CSS/JS 复用到 `contact.html`、`work.html`、`hobbies.html`、`portfolio.html`。

按此计划即可在「不破坏现有氛围」的前提下，把麻袋做成悬停可见的 API 对话面板，并实现「下方输入、上方多行 FIFO、旧行被挤入遮罩需滚动可见」的行为。
