# 翻译功能快速开始指南

## 🚀 5分钟快速设置

### 选项 1：零配置启动（推荐新手）

**不需要任何配置！** 系统会自动使用免费的 LibreTranslate 服务。

1. 直接部署到 Vercel
2. 翻译功能立即可用

**优点：** 完全免费，无需注册  
**缺点：** 翻译质量一般，速度较慢

---

### 选项 2：使用 DeepL（推荐）

**翻译质量最好！每月 500,000 字符免费额度**

#### 步骤 1：获取 DeepL API Key

1. 访问：https://www.deepl.com/pro-api
2. 点击 "Sign up for free"
3. 填写注册信息（需要信用卡，但不会收费）
4. 激活账户后，进入控制台获取 API Key

#### 步骤 2：在 Vercel 配置环境变量

1. 打开 Vercel 项目：https://vercel.com/dashboard
2. 选择您的项目
3. 点击 "Settings" → "Environment Variables"
4. 添加以下变量：

```
DEEPL_API_KEY = 您的DeepL API Key
DEEPL_FREE_ACCOUNT = true
```

5. 保存并重新部署

#### 步骤 3：验证

打开您的网站，点击语言切换按钮测试翻译。

---

### 选项 3：多服务配置（最佳稳定性）

配置多个翻译服务作为备份：

**Vercel 环境变量：**

```
# DeepL（首选）
DEEPL_API_KEY = 您的DeepL API Key
DEEPL_FREE_ACCOUNT = true

# Google Translate（备选）
GOOGLE_TRANSLATE_API_KEY = 您的Google API Key

# LibreTranslate（免费备选 - 自动启用）
```

系统会按优先级自动选择可用的服务。

---

## 📖 使用说明

### 基本翻译

点击页面顶部的 🌐 语言按钮切换中英文。

### 手动校正翻译

1. 切换到中文模式
2. **双击**任意中文文本
3. 在弹出框中编辑翻译
4. 点击确定保存

**您的校正会：**
- ✅ 立即生效
- ✅ 保存到本地浏览器
- ✅ 同步到云端
- ✅ 在所有设备上共享

---

## 🆘 常见问题

### Q: 完全不想配置，能用吗？

**A:** 能！直接部署就可以使用，系统会自动使用免费的 LibreTranslate。

### Q: DeepL 免费账户够用吗？

**A:** 对于个人网站完全够用！500,000 字符/月 ≈ 翻译 30万个中文字。

### Q: 如何查看剩余额度？

**A:** 登录 DeepL 控制台查看：https://www.deepl.com/account/usage

### Q: 翻译不准确怎么办？

**A:** 双击文本手动校正。您的校正会保存并优先显示。

### Q: 能用其他翻译服务吗？

**A:** 可以！系统支持：
- DeepL（最好）
- Google Translate
- LibreTranslate（免费）
- 可以自己添加其他服务

---

## 🎯 推荐配置

**个人网站（小流量）**
```
选项 1：零配置
或
选项 2：DeepL 免费版
```

**商业网站（中等流量）**
```
DeepL + Google Translate（双保险）
```

**高流量网站**
```
DeepL Pro + Google Translate + LibreTranslate
```

---

## 📞 需要帮助？

1. 查看完整文档：`docs/IMPROVED_TRANSLATION_GUIDE.md`
2. 查看原有文档：`docs/TRANSLATION_SETUP.md`
3. 提交 Issue：https://github.com/your-repo/issues

---

**提示：** 建议先使用选项 1（零配置）测试功能，如果满意再升级到 DeepL 获得更好的翻译质量。
