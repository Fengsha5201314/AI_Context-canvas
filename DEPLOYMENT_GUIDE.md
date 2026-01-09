# AI Context Canvas - Vercel部署指南

## 🚀 快速部署(推荐)

### 方案选择
我们选择 **Vercel** 作为部署平台,原因:
- ✅ 国内可直接访问(无需科学上网)
- ✅ 完全免费(个人项目)
- ✅ 无需备案
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自动构建部署
- ✅ 支持自定义域名

---

## 📋 部署前准备

### 1. 注册GitHub账号
如果还没有GitHub账号,请访问: https://github.com/signup

### 2. 注册Vercel账号
访问: https://vercel.com/signup
**建议使用GitHub账号登录**(一键授权,更方便)

---

## 🎯 部署步骤

### 步骤1: 初始化Git仓库

在项目根目录(`ai-context-canvas`)执行:

```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: AI Context Canvas"
```

### 步骤2: 创建GitHub仓库

1. 访问: https://github.com/new
2. 填写仓库信息:
   - **Repository name**: `ai-context-canvas` (或你喜欢的名字)
   - **Description**: AI驱动的内容整理画布
   - **Public/Private**: 选择Public(公开)或Private(私有)都可以
   - **不要勾选** "Initialize this repository with a README"
3. 点击 "Create repository"

### 步骤3: 推送代码到GitHub

复制GitHub页面显示的命令,在项目目录执行:

```bash
# 添加远程仓库(替换YOUR_USERNAME为你的GitHub用户名)
git remote add origin https://github.com/YOUR_USERNAME/ai-context-canvas.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤4: 在Vercel部署

#### 方式A: 通过Vercel网站(推荐)

1. 访问: https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你刚创建的 `ai-context-canvas` 仓库
4. 配置项目:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (保持默认)
   - **Build Command**: `npm run build` (自动识别)
   - **Output Directory**: `dist` (自动识别)
5. 点击 "Deploy"
6. 等待2-3分钟,部署完成!

#### 方式B: 通过Vercel CLI

```bash
# 全局安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署(在项目目录执行)
vercel

# 生产环境部署
vercel --prod
```

---

## 🎉 部署完成

部署成功后,Vercel会提供:
- **预览链接**: `https://your-project-xxx.vercel.app`
- **生产链接**: `https://your-project.vercel.app`

### 访问你的应用
直接访问Vercel提供的链接即可!

### 分享给其他用户
将链接发给其他用户,他们可以直接打开使用,无需安装任何东西!

---

## 🔄 后续更新

每次修改代码后:

```bash
# 提交更改
git add .
git commit -m "描述你的更改"

# 推送到GitHub
git push

# Vercel会自动检测并重新部署!
```

---

## 🌐 自定义域名(可选)

如果你有自己的域名:

1. 在Vercel项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置DNS记录
4. 等待DNS生效(通常几分钟到几小时)

---

## ⚙️ 环境变量配置(可选)

如果需要配置环境变量:

1. 在Vercel项目设置中点击 "Environment Variables"
2. 添加变量(例如API密钥)
3. 重新部署生效

**注意**: 本项目的API密钥由用户在前端配置,无需在Vercel设置环境变量

---

## 🐛 常见问题

### Q1: 部署后页面空白?
**A**: 检查浏览器控制台是否有错误。通常是路径问题,确保 `vite.config.ts` 中的 `base` 配置正确。

### Q2: 国内访问慢?
**A**: Vercel在国内访问速度已经很不错。如果需要更快,可以考虑:
- 使用自定义域名并配置国内DNS
- 或使用阿里云OSS(需要备案)

### Q3: 如何回滚到之前的版本?
**A**: 在Vercel项目的 "Deployments" 页面,找到之前的部署,点击 "Promote to Production"

### Q4: 部署失败怎么办?
**A**: 查看Vercel的构建日志,通常会显示具体错误。常见原因:
- Node版本不兼容(在 `package.json` 中指定 `"engines": {"node": ">=18"}`)
- 依赖安装失败(检查 `package.json`)
- 构建命令错误(检查 `vercel.json`)

---

## 📊 监控和分析

Vercel提供免费的:
- **Analytics**: 访问量统计
- **Speed Insights**: 性能监控
- **Logs**: 运行日志

在项目设置中可以启用这些功能。

---

## 💡 优化建议

### 1. 启用Gzip压缩
Vercel默认启用,无需配置

### 2. 配置缓存策略
在 `vercel.json` 中添加:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. 代码分割优化
当前构建有大文件警告,可以在 `vite.config.ts` 中配置:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'konva-vendor': ['konva', 'react-konva'],
          'ai-vendor': ['@google/generative-ai']
        }
      }
    }
  }
})
```

---

## 🔐 安全建议

1. **不要在代码中硬编码API密钥**
   - 本项目已正确实现:用户在前端配置,存储在localStorage
   
2. **使用HTTPS**
   - Vercel自动提供HTTPS,无需配置

3. **定期更新依赖**
   ```bash
   npm outdated
   npm update
   ```

---

## 📞 获取帮助

- **Vercel文档**: https://vercel.com/docs
- **Vercel社区**: https://github.com/vercel/vercel/discussions
- **项目Issues**: 在你的GitHub仓库创建Issue

---

## 🎊 恭喜!

你的AI Context Canvas已经成功部署上线!
现在可以把链接分享给朋友使用了! 🚀

**示例链接格式**:
- `https://ai-context-canvas.vercel.app`
- `https://your-custom-domain.com`

用户只需:
1. 打开链接
2. 点击设置按钮
3. 配置自己的AI API密钥
4. 开始使用!
