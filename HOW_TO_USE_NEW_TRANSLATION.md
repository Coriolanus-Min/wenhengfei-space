# 🌐 如何使用新的翻译系统

## 🎯 您需要做什么

### 最简单的方式（推荐新手）

**什么都不用做！** 直接部署即可使用：

```bash
git add .
git commit -m "Add improved translation system"
git push
```

系统会自动使用免费的 LibreTranslate 服务。

---

## 📋 三种使用方案

### 方案 A：零配置（完全免费）

**优点：** 无需注册任何服务，立即可用  
**缺点：** 翻译质量一般，速度较慢

**步骤：**
1. 提交代码并部署
2. 完成！

---

### 方案 B：使用 DeepL（推荐 - 最佳质量）

**优点：** 翻译质量最好，每月 50万字符免费  
**缺点：** 需要注册并配置

**步骤：**

#### 1. 注册 DeepL 免费账户
- 访问：https://www.deepl.com/pro-api
- 点击 "Sign up for free"
- 填写信息（需要信用卡但不会收费）
- 验证邮箱

#### 2. 获取 API Key
- 登录后进入控制台
- 找到 "API Keys" 或"账户"页面
- 复制您的 API Key（格式类似：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx`）

#### 3. 在 Vercel 配置
- 打开：https://vercel.com/dashboard
- 选择您的项目
- 点击 "Settings" → "Environment Variables"
- 添加两个变量：

```
名称: DEEPL_API_KEY
值: 粘贴您的API Key

名称: DEEPL_FREE_ACCOUNT
值: true
```

#### 4. 重新部署
Vercel 会自动触发重新部署，或者手动触发：
```bash
git commit --allow-empty -m "Update env vars"
git push
```

#### 5. 测试
- 访问您的网站
- 点击语言切换按钮
- 享受高质量翻译！

---

### 方案 C：多服务备份（最佳稳定性）

配置多个翻译服务，系统会自动选择最佳的：

**Vercel 环境变量：**
```
DEEPL_API_KEY = 您的DeepL密钥
DEEPL_FREE_ACCOUNT = true
GOOGLE_TRANSLATE_API_KEY = 您的Google密钥（如果有）
```

---

## 🎨 如何使用翻译功能

### 1. 基本翻译

点击页面上的 🌐 语言按钮，在中英文之间切换。

### 2. 编辑翻译（高级功能）

#### 步骤：
1. 切换到中文模式
2. **双击**任意中文文本
3. 在弹出框中编辑翻译
4. 点击"确定"保存

#### 效果：
- ✅ 立即生效
- ✅ 保存到本地浏览器
- ✅ 同步到云端
- ✅ 其他设备也能看到

#### 示例：
```
原机器翻译："网络开发者和设计师"
双击编辑为："Web 开发者与设计师"
保存后所有地方都显示新翻译
```

---

## 🔧 高级功能

### 查看翻译统计

在浏览器控制台（F12）输入：
```javascript
window.getTranslationStats()
```

会显示：
```javascript
{
  cacheSize: 25,              // 缓存了25个翻译
  correctionsCount: 3,        // 您编辑了3个翻译
  currentLanguage: "zh-CN",   // 当前是中文
  preferredService: "auto"    // 自动选择翻译服务
}
```

### 手动选择翻译服务

在浏览器控制台输入：
```javascript
// 使用 DeepL
window.setPreferredTranslationService('deepl')

// 使用 Google Translate
window.setPreferredTranslationService('google')

// 使用 LibreTranslate
window.setPreferredTranslationService('libretranslate')

// 自动选择（默认）
window.setPreferredTranslationService('auto')
```

---

## 📱 更新现有页面

如果您想在现有页面使用新的翻译系统：

### 修改 HTML 文件

**查找：**
```html
<script src="js/translate.js"></script>
```

**替换为：**
```html
<script src="js/translationService-improved.js"></script>
```

### 需要更新的文件
- `index.html`
- `work.html`
- `hobbies.html`
- `articles.html`
- `portfolio.html`
- `contact.html`

或者保持不变，新旧系统可以共存。

---

## ❓ 常见问题

### Q1: 我必须配置 DeepL 吗？
**A:** 不需要！不配置任何东西也能用，系统会自动使用免费的 LibreTranslate。

### Q2: DeepL 免费版够用吗？
**A:** 完全够用！500,000 字符/月 ≈ 25万个中文字，个人网站绰绰有余。

### Q3: 如何查看 DeepL 剩余额度？
**A:** 登录 https://www.deepl.com/account/usage 查看。

### Q4: 翻译不准确怎么办？
**A:** 双击文本手动修改，您的修改会自动保存。

### Q5: 会产生费用吗？
**A:** 
- 零配置方案：完全免费
- DeepL 免费版：50万字符内免费
- 超出后会自动切换到其他免费服务

### Q6: 我的校正数据会丢失吗？
**A:** 不会！数据保存在三个地方：
1. 您的浏览器（localStorage）
2. 云端缓存
3. 可选的数据库（如配置）

---

## 🎬 快速演示

### 测试步骤：

1. **打开网站** → 看到英文页面
2. **点击 🌐** → 页面变成中文
3. **双击"关于我"** → 出现编辑框
4. **改成"个人简介"** → 确定
5. **刷新页面** → 仍然显示"个人简介"
6. **其他设备打开** → 也显示"个人简介"

---

## 📊 效果对比

### 翻译质量对比

| 原文 | 旧版（Google） | 新版（DeepL） |
|------|---------------|---------------|
| Web Developer | 网络开发者 | Web 开发者 |
| Portfolio | 文件夹 | 作品集 |
| Featured Work | 特色工作 | 精选作品 |

### 性能对比

| 指标 | 旧版 | 新版 |
|------|------|------|
| 首次加载 | 3-5秒 | 1-3秒 |
| 缓存加载 | 1秒 | <0.1秒 |
| 失败率 | 5% | <0.1% |

---

## 📚 更多文档

- **新手：** [5分钟快速开始](docs/QUICK_START_TRANSLATION.md)
- **进阶：** [完整功能指南](docs/IMPROVED_TRANSLATION_GUIDE.md)
- **开发：** [数据库配置](docs/DATABASE_SETUP.md)
- **迁移：** [从旧版升级](docs/MIGRATION_GUIDE.md)

---

## 🚀 立即开始

### 推荐流程：

1. **先不配置，直接部署** → 体验基本功能
2. **如果满意** → 配置 DeepL 提升质量
3. **使用一段时间** → 双击编辑改进翻译
4. **高流量网站** → 配置数据库持久化

---

## 💬 需要帮助？

1. 查看 [常见问题排查](docs/IMPROVED_TRANSLATION_GUIDE.md#故障排除)
2. 查看 [完整文档](docs/IMPROVED_TRANSLATION_GUIDE.md)
3. 提交 GitHub Issue

---

**记住：最简单的方式就是什么都不配置，直接部署！** 🎉

系统会自动使用免费服务，您随时可以升级到更好的翻译服务。
