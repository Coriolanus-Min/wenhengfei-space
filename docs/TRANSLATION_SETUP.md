# 翻译功能设置指南

## 环境变量配置

为了保护 Microsoft Translator API 的凭据安全，我们使用环境变量来存储敏感信息。请按照以下步骤设置：

1. 在项目根目录创建 `.env` 文件（该文件不会被提交到 Git）
2. 在 `.env` 文件中添加以下内容：
   ```
   TRANSLATOR_API_KEY=your_actual_api_key_here
   TRANSLATOR_LOCATION=your_actual_location_here
   ```
3. 将实际的 API 密钥和位置信息替换到对应的位置

## GitHub Secrets 设置（如果使用 GitHub Actions）

如果您使用 GitHub Actions 进行部署，请按照以下步骤设置 secrets：

1. 转到您的 GitHub 仓库
2. 点击 "Settings" 标签
3. 在左侧菜单中选择 "Secrets and variables" -> "Actions"
4. 点击 "New repository secret"
5. 添加以下 secrets：
   - Name: `TRANSLATOR_API_KEY`
     Value: 您的 Microsoft Translator API 密钥
   - Name: `TRANSLATOR_LOCATION`
     Value: 您的 API 位置

## 本地开发

对于本地开发，您可以：

1. 复制 `.env.example` 文件并重命名为 `.env`
2. 在 `.env` 文件中填入您的实际 API 凭据
3. 确保 `.env` 文件已经添加到 `.gitignore` 中（默认已添加）

## 安全注意事项

- 永远不要将 `.env` 文件提交到版本控制系统
- 定期轮换 API 密钥
- 在生产环境中使用环境变量或安全的密钥管理服务
- 确保 API 密钥具有适当的访问权限和限制

## 故障排除

如果翻译功能不工作：

1. 检查 `.env` 文件是否存在并包含正确的凭据
2. 确保环境变量已正确加载
3. 检查浏览器控制台是否有错误消息
4. 验证 API 密钥是否有效且未过期 