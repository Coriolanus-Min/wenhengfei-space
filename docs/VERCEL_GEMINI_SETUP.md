# Vercel 上麻袋对话 (Gemini) 不生效的排查

网页端用 `/api/chat` 会走到 Vercel 的 serverless 函数 `api/chat.js`，需要 **Vercel 环境变量**里有 `GEMINI_API_KEY`（和本地 `.env` 里同名即可）。

## 1. 在 Vercel 里加上 GEMINI_API_KEY

**方式 A：Dashboard 环境变量（推荐）**

1. 打开 [Vercel Dashboard](https://vercel.com) → 你的项目 → **Settings** → **Environment Variables**
2. **Key**: `GEMINI_API_KEY`（必须一模一样，区分大小写）
3. **Value**: 粘贴你的 Gemini API Key（和本地 `.env` 里同一个）
4. **Environment**: 至少勾选 **Production**；如果预览环境也要用麻袋对话，再勾选 Preview
5. 保存

**方式 B：用 vercel.json 的 Secret 引用**

若 `vercel.json` 里有 `"GEMINI_API_KEY": "@gemini-api-key"`，表示从 Vercel Secret 读值：

- 在项目目录执行：`vercel env add GEMINI_API_KEY`
- 按提示选择 Environment（Production / Preview），再粘贴 Key
- 或是在 Dashboard → Settings → Environment Variables 里添加同名变量，并选 “Encrypted”

## 2. 改完环境变量后必须重新部署

Vercel 只在 **部署时** 把环境变量打进运行环境；只改设置、不重新部署的话，线上还是旧的（没有新 key）。

- 在 **Deployments** 里对最新一次部署点 **Redeploy**，或  
- 随便改一处代码再 **git push**，触发新部署。

## 3. 自查清单

| 检查项 | 说明 |
|--------|------|
| 变量名 | 必须是 `GEMINI_API_KEY`，不能多空格、少字母 |
| 环境 | Production 部署要用，就一定要勾选 Production |
| 已重部署 | 加/改 key 之后做过至少一次新部署 |
| Key 有效 | 和本地能用的 key 一致，未过期、未在 Google 侧停用 |

按上面做完后，网页端再试麻袋对话即可。
