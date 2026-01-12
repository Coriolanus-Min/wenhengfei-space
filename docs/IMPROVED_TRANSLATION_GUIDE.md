# 改进的翻译功能使用指南

## 🎯 新功能概述

全新的翻译系统提供了以下改进：

### ✨ 核心功能
1. **多翻译源支持** - 自动降级备份机制
   - DeepL API（推荐 - 翻译质量最好）
   - Google Translate API
   - LibreTranslate（开源免费方案）

2. **智能缓存系统**
   - 本地缓存（localStorage）
   - 云端缓存同步
   - 批量翻译优化

3. **用户手动校正**
   - 双击任意翻译文本进行编辑
   - 自动保存到本地和云端
   - 校正优先级高于机器翻译

4. **翻译质量提升**
   - 使用业界最好的翻译服务（DeepL）
   - 多个备选方案确保稳定性
   - 用户反馈改进翻译质量

---

## 📝 配置指南

### 1. 环境变量配置

在 Vercel 或您的部署平台配置以下环境变量：

#### DeepL API（推荐）

**获取 API Key:**
1. 访问 [DeepL API](https://www.deepl.com/pro-api)
2. 注册免费账户（每月 50万字符免费额度）
3. 获取 API Key

**配置环境变量:**
```
DEEPL_API_KEY=your_deepl_api_key_here
DEEPL_FREE_ACCOUNT=true   # 如果使用免费账户设为 true
```

**费用说明:**
- 免费版：500,000 字符/月
- Pro 版：$5.49 起/月

#### Google Translate API（备选）

```
GOOGLE_TRANSLATE_API_KEY=your_google_api_key_here
```

#### LibreTranslate（免费备选）

```
LIBRETRANSLATE_ENDPOINT=https://libretranslate.com/translate
LIBRETRANSLATE_API_KEY=your_api_key_here  # 可选，用于提高速率限制
```

**说明:** LibreTranslate 无需配置即可使用，但速率受限

---

## 🚀 快速开始

### 方案 A：只使用免费服务（无需配置）

不需要任何配置！系统会自动使用 LibreTranslate 免费服务。

### 方案 B：使用 DeepL（推荐）

1. 注册 DeepL 免费账户
2. 在 Vercel 环境变量中配置：
   ```
   DEEPL_API_KEY=你的密钥
   DEEPL_FREE_ACCOUNT=true
   ```
3. 部署更新

### 方案 C：组合使用（最佳稳定性）

配置多个翻译服务，系统会按优先级自动选择：
```
DEEPL_API_KEY=你的DeepL密钥
GOOGLE_TRANSLATE_API_KEY=你的Google密钥
LIBRETRANSLATE_API_KEY=你的LibreTranslate密钥（可选）
```

---

## 🎨 使用方法

### 1. 基本翻译

点击页面上的语言切换按钮（地球图标）即可在中英文间切换。

### 2. 编辑翻译（手动校正）

1. 切换到中文模式
2. 双击任意翻译文本
3. 在弹出的对话框中编辑翻译
4. 确认后自动保存到本地和云端

**提示:** 您的校正会优先于机器翻译显示，并同步到所有设备。

### 3. 查看翻译统计

在浏览器控制台输入：
```javascript
window.getTranslationStats()
```

### 4. 切换翻译服务

在浏览器控制台设置首选服务：
```javascript
window.setPreferredTranslationService('deepl')  // 或 'google', 'libretranslate', 'auto'
```

---

## 🔧 Vercel 部署配置

### 1. 在 Vercel 仪表板添加环境变量

1. 打开您的项目：https://vercel.com/dashboard
2. 点击 "Settings" → "Environment Variables"
3. 添加以下变量（根据需要）：

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DEEPL_API_KEY` | 你的 DeepL API Key | 推荐 |
| `DEEPL_FREE_ACCOUNT` | `true` 或 `false` | 免费账户设为 true |
| `GOOGLE_TRANSLATE_API_KEY` | 你的 Google API Key | 可选备份 |
| `LIBRETRANSLATE_API_KEY` | 你的 LibreTranslate Key | 可选 |

### 2. 重新部署

添加环境变量后，触发重新部署：
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

---

## 📊 翻译服务对比

| 服务 | 翻译质量 | 免费额度 | 速度 | 推荐度 |
|-----|---------|---------|------|--------|
| **DeepL** | ⭐⭐⭐⭐⭐ | 500K字符/月 | 快 | ⭐⭐⭐⭐⭐ |
| **Google Translate** | ⭐⭐⭐⭐ | 需付费 | 很快 | ⭐⭐⭐⭐ |
| **LibreTranslate** | ⭐⭐⭐ | 无限制 | 较慢 | ⭐⭐⭐ |

---

## 🛠️ 技术细节

### 降级机制

系统按以下顺序尝试翻译服务：
1. DeepL（如果配置）
2. Google Translate（如果配置）
3. LibreTranslate（始终可用）

如果某个服务失败，自动切换到下一个。

### 缓存策略

1. **用户校正** - 最高优先级
2. **本地缓存** - localStorage
3. **API 翻译** - 实时调用

### 数据同步

- 本地缓存：存储在 localStorage
- 云端同步：通过 `/api/translation-cache` 端点
- 自动同步：页面加载时自动同步

---

## 🔍 故障排除

### 问题：翻译失败

**解决方案：**
1. 检查环境变量是否正确配置
2. 查看浏览器控制台错误信息
3. 确认 API Key 未过期
4. 检查网络连接

### 问题：翻译质量不佳

**解决方案：**
1. 双击文本手动校正
2. 切换到 DeepL 服务：
   ```javascript
   window.setPreferredTranslationService('deepl')
   ```

### 问题：缓存过大

**解决方案：**
清除本地缓存：
```javascript
localStorage.removeItem('translationCache')
localStorage.removeItem('userCorrections')
location.reload()
```

---

## 📱 API 端点说明

### 1. 翻译 API
```
POST /api/translate-improved
```

**请求体：**
```json
{
  "text": "要翻译的文本",
  "targetLanguage": "zh-CN",
  "preferredService": "deepl"  // 可选
}
```

**响应：**
```json
{
  "translated": "翻译后的文本",
  "service": "deepl",
  "cached": false
}
```

### 2. 缓存 API
```
POST /api/translation-cache
```

**操作：**
- `get` - 获取缓存
- `save` - 保存翻译
- `export` - 导出用户校正
- `import` - 导入用户校正
- `stats` - 获取统计信息

---

## 🎓 最佳实践

1. **优先使用 DeepL**
   - 注册免费账户
   - 配置 API Key
   - 享受最佳翻译质量

2. **手动校正重要翻译**
   - 双击编辑关键术语
   - 建立自己的翻译词库
   - 提高整体翻译一致性

3. **定期备份用户校正**
   ```javascript
   // 导出校正
   fetch('/api/translation-cache', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({action: 'export'})
   }).then(r => r.json()).then(console.log)
   ```

---

## 🤝 协助开发

如果您想协助改进翻译功能：

1. **提供专业翻译**
   - 浏览网站并双击编辑翻译
   - 您的校正会自动保存并同步

2. **反馈问题**
   - 在 GitHub 创建 Issue
   - 提供具体的翻译问题示例

3. **贡献代码**
   - Fork 仓库
   - 改进翻译算法或添加新功能
   - 提交 Pull Request

---

## 📞 获取帮助

需要帮助？请：
1. 查看本文档的故障排除部分
2. 在 GitHub 创建 Issue
3. 联系网站管理员

---

**版本:** 2.0  
**更新日期:** 2026-01-12  
**作者:** Wen Hengfei
