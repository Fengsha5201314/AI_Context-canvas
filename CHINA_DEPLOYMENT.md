# 🇨🇳 国内部署方案指南

## ⚠️ Vercel国内访问问题

**问题**: Vercel在2024年后在国内部分地区被限制访问,需要科学上网才能打开。

**解决方案**: 使用国内云服务商进行部署。

---

## 🎯 推荐方案对比

| 方案 | 国内访问 | 费用 | 备案 | 难度 | 推荐度 |
|------|---------|------|------|------|--------|
| **Cloudflare Pages** | ✅ 可访问 | 免费 | 不需要 | ⭐ 简单 | ⭐⭐⭐⭐⭐ |
| **阿里云OSS+CDN** | ✅ 快速 | 低成本 | 需要 | ⭐⭐ 中等 | ⭐⭐⭐⭐ |
| **腾讯云静态网站** | ✅ 快速 | 低成本 | 需要 | ⭐⭐ 中等 | ⭐⭐⭐⭐ |
| **Netlify** | ⚠️ 不稳定 | 免费 | 不需要 | ⭐ 简单 | ⭐⭐ |
| **GitHub Pages** | ⚠️ 较慢 | 免费 | 不需要 | ⭐ 简单 | ⭐⭐⭐ |

---

## 🌟 方案1: Cloudflare Pages (强烈推荐)

### 优势
- ✅ **国内可访问** (目前稳定)
- ✅ **完全免费** (无限流量)
- ✅ **无需备案**
- ✅ **自动HTTPS**
- ✅ **全球CDN**
- ✅ **自动部署** (连接GitHub)

### 部署步骤

#### 1. 注册Cloudflare账号
访问: https://dash.cloudflare.com/sign-up

#### 2. 创建Pages项目
1. 登录后,点击左侧 "Workers & Pages"
2. 点击 "Create application"
3. 选择 "Pages" 标签
4. 点击 "Connect to Git"

#### 3. 连接GitHub仓库
1. 授权Cloudflare访问GitHub
2. 选择仓库: `Fengsha5201314/AI_Context-canvas`
3. 点击 "Begin setup"

#### 4. 配置构建设置
```
Project name: ai-context-canvas
Production branch: main
Framework preset: None (或选择 Vite)
Build command: npm run build
Build output directory: dist
```

#### 5. 部署
1. 点击 "Save and Deploy"
2. 等待2-3分钟
3. 完成!

#### 6. 获取访问链接
部署成功后会得到:
- `https://ai-context-canvas.pages.dev`
- 或自定义域名

### 后续更新
每次推送到GitHub,Cloudflare会自动重新部署!

---

## 🌟 方案2: 阿里云OSS + CDN (最快速度)

### 优势
- ✅ **国内访问最快**
- ✅ **稳定可靠**
- ✅ **低成本** (约5-10元/月)
- ⚠️ **需要备案** (如果使用自定义域名)

### 部署步骤

#### 1. 开通阿里云OSS
1. 访问: https://oss.console.aliyun.com/
2. 创建Bucket
   - Bucket名称: `ai-context-canvas`
   - 区域: 选择离你最近的
   - 读写权限: **公共读**
   - 其他保持默认

#### 2. 配置静态网站托管
1. 进入Bucket管理页面
2. 点击 "基础设置" → "静态页面"
3. 开启静态网站托管
4. 默认首页: `index.html`
5. 默认404页: `index.html` (用于SPA路由)

#### 3. 上传构建文件
```bash
# 本地构建
cd ai-context-canvas
npm run build

# 上传dist目录下的所有文件到OSS
# 可以使用阿里云OSS控制台上传
# 或使用ossutil工具
```

#### 4. 配置CDN加速(可选但推荐)
1. 访问: https://cdn.console.aliyun.com/
2. 添加域名
3. 源站类型: OSS域名
4. 选择你的Bucket
5. 配置HTTPS证书(免费)

#### 5. 访问
- OSS直接访问: `http://ai-context-canvas.oss-cn-hangzhou.aliyuncs.com`
- CDN加速访问: `https://your-domain.com` (需要自定义域名)

### 自动化部署脚本

创建 `deploy-oss.sh`:
```bash
#!/bin/bash

# 构建
npm run build

# 上传到OSS (需要先安装ossutil)
ossutil cp -r dist/ oss://ai-context-canvas/ --update
```

---

## 🌟 方案3: 腾讯云静态网站托管

### 优势
- ✅ **国内访问快**
- ✅ **有免费额度**
- ✅ **操作简单**
- ⚠️ **需要备案** (使用自定义域名)

### 部署步骤

#### 1. 开通腾讯云静态网站托管
访问: https://console.cloud.tencent.com/tcb

#### 2. 创建环境
1. 点击 "新建"
2. 选择 "按量计费"
3. 环境名称: `ai-context-canvas`

#### 3. 开启静态网站托管
1. 进入环境
2. 点击 "静态网站托管"
3. 开通服务

#### 4. 上传文件
```bash
# 构建
npm run build

# 使用腾讯云CLI上传
tcb hosting deploy dist/ -e your-env-id
```

#### 5. 访问
会得到一个默认域名: `https://your-env-id.tcloudbaseapp.com`

---

## 🌟 方案4: GitHub Pages (备选)

### 优势
- ✅ **完全免费**
- ✅ **无需备案**
- ⚠️ **国内访问较慢**

### 部署步骤

#### 1. 修改vite.config.ts
```typescript
export default defineConfig({
  base: '/AI_Context-canvas/', // 仓库名
  // ... 其他配置
})
```

#### 2. 创建部署脚本
创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 3. 启用GitHub Pages
1. 进入仓库Settings
2. 点击Pages
3. Source选择: `gh-pages` 分支
4. 保存

#### 4. 访问
`https://fengsha5201314.github.io/AI_Context-canvas/`

---

## 📊 方案选择建议

### 如果你想要:
- **最简单 + 国内可访问**: 选择 **Cloudflare Pages** ⭐⭐⭐⭐⭐
- **最快速度 + 愿意付费**: 选择 **阿里云OSS+CDN** ⭐⭐⭐⭐
- **完全免费 + 不介意慢**: 选择 **GitHub Pages** ⭐⭐⭐

### 我的推荐:
**Cloudflare Pages** - 免费、快速、国内可访问、无需备案

---

## 🚀 立即行动: Cloudflare Pages部署

### 快速开始
1. 访问: https://dash.cloudflare.com/sign-up
2. 注册/登录
3. Workers & Pages → Create → Pages → Connect to Git
4. 选择 `Fengsha5201314/AI_Context-canvas`
5. 配置:
   - Build command: `npm run build`
   - Build output: `dist`
6. Deploy!

### 预期结果
- 访问链接: `https://ai-context-canvas.pages.dev`
- 国内可访问: ✅
- 部署时间: 2-3分钟

---

## 🔄 迁移现有Vercel项目

如果你已经在Vercel部署了,迁移到Cloudflare很简单:

1. 代码已经在GitHub,无需修改
2. 在Cloudflare Pages连接同一个仓库
3. 使用相同的构建配置
4. 完成!

两个平台可以同时存在:
- Vercel: 需要科学上网访问
- Cloudflare: 国内直接访问

---

## 📞 获取帮助

- **Cloudflare文档**: https://developers.cloudflare.com/pages/
- **阿里云OSS文档**: https://help.aliyun.com/product/31815.html
- **腾讯云文档**: https://cloud.tencent.com/document/product/876

---

## 🎯 总结

**最佳方案**: Cloudflare Pages
- 免费
- 国内可访问
- 无需备案
- 自动部署
- 全球CDN

**立即部署**: https://dash.cloudflare.com/sign-up

部署完成后,把新的Cloudflare链接分享给朋友,他们就可以在国内直接访问了! 🎉
