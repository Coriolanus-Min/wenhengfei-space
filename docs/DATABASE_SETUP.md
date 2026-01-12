# 翻译缓存数据库设置指南

## 概述

翻译缓存系统支持多种存储方案，从简单的内存存储到完整的数据库解决方案。

---

## 存储方案对比

| 方案 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| **内存存储（默认）** | 无需配置，即开即用 | 服务重启后丢失 | 开发测试 |
| **Vercel KV** | 无服务器，自动扩展 | 需要付费（有免费额度） | 推荐生产环境 |
| **Redis** | 性能好，功能强 | 需要自己维护 | 高流量网站 |
| **MongoDB** | 功能丰富，易查询 | 相对复杂 | 需要复杂查询 |

---

## 方案 1：内存存储（默认）

**无需配置！** 当前实现已包含内存存储。

### 特点
- ✅ 零配置
- ✅ 开发简单
- ⚠️ 服务重启数据丢失
- ⚠️ 不支持多实例

### 适用场景
- 个人网站
- 低流量应用
- 开发测试环境

---

## 方案 2：Vercel KV（推荐生产环境）

Vercel KV 是基于 Redis 的无服务器键值存储。

### 步骤 1：启用 Vercel KV

1. 登录 Vercel Dashboard
2. 选择您的项目
3. 点击 "Storage" → "Create Database"
4. 选择 "KV (Redis)"
5. 创建数据库

### 步骤 2：安装依赖

```bash
npm install @vercel/kv
```

### 步骤 3：创建 KV 存储适配器

创建文件 `api/storage/vercel-kv.js`：

```javascript
import { kv } from '@vercel/kv';

export async function getTranslation(key) {
    return await kv.get(key);
}

export async function saveTranslation(key, value) {
    await kv.set(key, value, { ex: 60 * 60 * 24 * 30 }); // 30天过期
    return { success: true };
}

export async function getUserCorrections() {
    const keys = await kv.keys('correction:*');
    const corrections = [];
    for (const key of keys) {
        const value = await kv.get(key);
        corrections.push({ key: key.replace('correction:', ''), value });
    }
    return corrections;
}

export async function saveUserCorrection(key, value) {
    await kv.set(`correction:${key}`, value);
    return { success: true };
}

export async function getStats() {
    const cacheKeys = await kv.keys('cache:*');
    const correctionKeys = await kv.keys('correction:*');
    return {
        cacheSize: cacheKeys.length,
        userCorrectionsCount: correctionKeys.length,
        totalEntries: cacheKeys.length + correctionKeys.length
    };
}
```

### 步骤 4：更新 translation-cache.js

修改 `api/translation-cache.js` 使用 KV 存储：

```javascript
// 在文件顶部添加
import * as storage from './storage/vercel-kv.js';

// 将所有存储操作替换为 storage 函数调用
```

### 定价
- 免费额度：每月 3,000 次请求
- Pro 计划：$20/月，包含 100,000 次请求

---

## 方案 3：Upstash Redis（免费额度更大）

Upstash 提供无服务器 Redis，免费额度更慷慨。

### 步骤 1：创建 Upstash 数据库

1. 访问 [Upstash Console](https://console.upstash.com/)
2. 注册并创建 Redis 数据库
3. 复制连接信息

### 步骤 2：配置环境变量

```
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 步骤 3：安装依赖

```bash
npm install @upstash/redis
```

### 步骤 4：创建适配器

创建文件 `api/storage/upstash-redis.js`：

```javascript
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getTranslation(key) {
    return await redis.get(key);
}

export async function saveTranslation(key, value) {
    await redis.set(key, value, { ex: 2592000 }); // 30天
    return { success: true };
}

export async function getUserCorrections() {
    const keys = await redis.keys('correction:*');
    const corrections = [];
    for (const key of keys) {
        const value = await redis.get(key);
        corrections.push({ key: key.replace('correction:', ''), value });
    }
    return corrections;
}

export async function saveUserCorrection(key, value) {
    await redis.set(`correction:${key}`, value);
    return { success: true };
}

export async function getStats() {
    const allKeys = await redis.keys('*');
    const cacheKeys = allKeys.filter(k => k.startsWith('cache:'));
    const correctionKeys = allKeys.filter(k => k.startsWith('correction:'));
    return {
        cacheSize: cacheKeys.length,
        userCorrectionsCount: correctionKeys.length,
        totalEntries: allKeys.length
    };
}
```

### 定价
- 免费额度：每月 10,000 次请求
- Pro 计划：$10/月起

---

## 方案 4：MongoDB Atlas（免费）

适合需要复杂查询的场景。

### 步骤 1：创建 MongoDB 数据库

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册并创建免费集群
3. 创建数据库用户
4. 获取连接字符串

### 步骤 2：配置环境变量

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/translations
```

### 步骤 3：安装依赖

```bash
npm install mongodb
```

### 步骤 4：创建适配器

创建文件 `api/storage/mongodb.js`：

```javascript
import { MongoClient } from 'mongodb';

let client = null;
let db = null;

async function getDatabase() {
    if (!db) {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        db = client.db('translations');
    }
    return db;
}

export async function getTranslation(key) {
    const database = await getDatabase();
    const collection = database.collection('cache');
    const doc = await collection.findOne({ _id: key });
    return doc ? doc.value : null;
}

export async function saveTranslation(key, value) {
    const database = await getDatabase();
    const collection = database.collection('cache');
    await collection.updateOne(
        { _id: key },
        { 
            $set: { value, updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
    );
    return { success: true };
}

export async function getUserCorrections() {
    const database = await getDatabase();
    const collection = database.collection('corrections');
    const docs = await collection.find({}).toArray();
    return docs.map(doc => ({ key: doc._id, value: doc.value }));
}

export async function saveUserCorrection(key, value) {
    const database = await getDatabase();
    const collection = database.collection('corrections');
    await collection.updateOne(
        { _id: key },
        { 
            $set: { value, updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
    );
    return { success: true };
}

export async function getStats() {
    const database = await getDatabase();
    const cacheCount = await database.collection('cache').countDocuments();
    const correctionCount = await database.collection('corrections').countDocuments();
    return {
        cacheSize: cacheCount,
        userCorrectionsCount: correctionCount,
        totalEntries: cacheCount + correctionCount
    };
}
```

### 定价
- 免费额度：512MB 存储，无限制

---

## 方案 5：文件系统存储（最简单持久化）

对于小型项目，使用文件系统存储是最简单的持久化方案。

### 创建适配器

创建文件 `api/storage/filesystem.js`：

```javascript
import fs from 'fs/promises';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.translation-cache');
const CACHE_FILE = path.join(STORAGE_DIR, 'cache.json');
const CORRECTIONS_FILE = path.join(STORAGE_DIR, 'corrections.json');

// 确保目录存在
async function ensureDirectory() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (e) {
        // 目录已存在
    }
}

async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

async function writeJSON(filePath, data) {
    await ensureDirectory();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getTranslation(key) {
    const cache = await readJSON(CACHE_FILE);
    return cache[key] || null;
}

export async function saveTranslation(key, value) {
    const cache = await readJSON(CACHE_FILE);
    cache[key] = value;
    await writeJSON(CACHE_FILE, cache);
    return { success: true };
}

export async function getUserCorrections() {
    const corrections = await readJSON(CORRECTIONS_FILE);
    return Object.entries(corrections).map(([key, value]) => ({ key, value }));
}

export async function saveUserCorrection(key, value) {
    const corrections = await readJSON(CORRECTIONS_FILE);
    corrections[key] = value;
    await writeJSON(CORRECTIONS_FILE, corrections);
    return { success: true };
}

export async function getStats() {
    const cache = await readJSON(CACHE_FILE);
    const corrections = await readJSON(CORRECTIONS_FILE);
    return {
        cacheSize: Object.keys(cache).length,
        userCorrectionsCount: Object.keys(corrections).length,
        totalEntries: Object.keys(cache).length + Object.keys(corrections).length
    };
}
```

**注意：** 需要在 `.gitignore` 中添加：
```
.translation-cache/
```

---

## 推荐配置

### 个人网站/博客
```
✅ 内存存储（默认）
或
✅ 文件系统存储
```

### 小型商业网站
```
✅ Upstash Redis（免费额度大）
```

### 中大型网站
```
✅ Vercel KV
或
✅ 自建 Redis
```

### 需要复杂查询
```
✅ MongoDB Atlas
```

---

## 切换存储方案

修改 `api/translation-cache.js` 的导入语句即可：

```javascript
// 使用 Vercel KV
import * as storage from './storage/vercel-kv.js';

// 或使用 Upstash Redis
import * as storage from './storage/upstash-redis.js';

// 或使用 MongoDB
import * as storage from './storage/mongodb.js';

// 或使用文件系统
import * as storage from './storage/filesystem.js';
```

然后在 `translation-cache.js` 中使用统一的接口：

```javascript
const result = await storage.getTranslation(key);
await storage.saveTranslation(key, value);
// ... 等等
```

---

## 性能优化建议

1. **设置合理的过期时间**
   - 机器翻译：30天
   - 用户校正：永久保存

2. **使用批量操作**
   - 批量读取减少网络往返
   - 批量写入提高吞吐量

3. **本地缓存 + 远程存储**
   - 浏览器 localStorage 作为第一级缓存
   - 数据库作为第二级缓存

4. **压缩存储**
   - 长文本使用 gzip 压缩
   - 减少存储空间

---

## 数据迁移

### 从内存迁移到数据库

```javascript
// 导出当前内存数据
const memoryData = /* 当前内存中的数据 */;

// 批量导入到数据库
for (const [key, value] of Object.entries(memoryData)) {
    await storage.saveTranslation(key, value);
}
```

### 数据库之间迁移

```javascript
import * as sourceStorage from './storage/source.js';
import * as targetStorage from './storage/target.js';

// 读取源数据
const data = await sourceStorage.getAllTranslations();

// 写入目标数据库
for (const item of data) {
    await targetStorage.saveTranslation(item.key, item.value);
}
```

---

## 常见问题

### Q: 内存存储够用吗？

**A:** 对于低流量个人网站完全够用。用户的校正会保存在浏览器本地。

### Q: 如何备份数据？

**A:** 使用导出功能定期备份用户校正：
```javascript
fetch('/api/translation-cache', {
    method: 'POST',
    body: JSON.stringify({ action: 'export' })
})
```

### Q: 数据库成本高吗？

**A:** 推荐使用免费方案：
- Upstash Redis: 10,000 请求/月
- MongoDB Atlas: 512MB 免费
- Vercel KV: 3,000 请求/月

---

需要帮助？查看完整文档或提交 Issue。
