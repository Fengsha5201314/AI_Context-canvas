# 🚀 Vercel一键部署指南

## ✅ 代码已推送到GitHub
仓库地址: https://github.com/Fengsha5201314/AI_Context-canvas

---

## 📦 立即部署到Vercel

### 方式1: 一键部署(最简单)

点击下面的按钮,一键部署到Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fengsha5201314/AI_Context-canvas)

### 方式2: 手动导入(推荐,更灵活)

1. **访问Vercel**: https://vercel.com/new

2. **登录Vercel**
   - 使用GitHub账号登录(推荐)
   - 或使用GitLab/Bitbucket/Email登录

3. **导入Git仓库**
   - 点击 "Import Git Repository"
   - 选择 `Fengsha5201314/AI_Context-canvas`
   - 如果看不到仓库,点击 "Adjust GitHub App Permissions" 授权

4. **配置项目**
   - **Project Name**: `ai-context-canvas` (或自定义)
   - **Framework Preset**: Vite (自动识别)
   - **Root Directory**: `./` (保持默认)
   - **Build Command**: `npm run build` (自动识别)
   - **Output Directory**: `dist` (自动识别)
   - **Install Command**: `npm install` (自动识别)

5. **点击Deploy**
   - 等待2-3分钟
   - 部署完成!

---

## 🎉 部署完成后

### 获取访问链接
部署成功后,Vercel会提供:
- **生产环境**: `https://ai-context-canvas.vercel.app`
- **预览环境**: `https://ai-context-canvas-xxx.vercel.app`

### 测试应用
1. 打开Vercel提供的链接
2. 点击右上角设置按钮⚙️
3. 选择AI提供商(推荐:硅基流动)
4. 输入API密钥
5. 开始使用!

### 分享给其他用户
直接把链接发给朋友,他们可以:
- 无需安装任何软件
- 直接在浏览器打开使用
- 配置自己的API密钥即可

---

## 🔄 后续更新流程

每次修改代码后:

```bash
# 1. 提交更改
git add .
git commit -m "描述你的更改"

# 2. 推送到GitHub
git push

# 3. Vercel自动检测并重新部署(无需手动操作!)
```

---

## 🌐 自定义域名(可选)

如果你有自己的域名:

1. 在Vercel项目页面,点击 "Settings" → "Domains"
2. 添加你的域名(例如: `ai-canvas.yourdomain.com`)
3. 按照提示配置DNS记录:
   - **类型**: CNAME
   - **名称**: `ai-canvas` (或 `@` 用于根域名)
   - **值**: `cname.vercel-dns.com`
4. 等待DNS生效(通常5-30分钟)
5. 完成!现在可以用自己的域名访问了

---

## 📊 Vercel功能

### 免费版包含:
- ✅ 无限部署
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 自动构建
- ✅ 预览部署(每个PR都有独立预览链接)
- ✅ 100GB带宽/月
- ✅ 基础分析

### 查看部署状态
访问: https://vercel.com/fengsha5201314/ai-context-canvas

可以看到:
- 部署历史
- 构建日志
- 访问统计
- 性能指标

---

## 🐛 常见问题

### Q1: 部署失败怎么办?
**A**: 
1. 查看Vercel的构建日志,找到具体错误
2. 常见原因:
   - Node版本不兼容 → 已在package.json中指定 `"engines": {"node": ">=18.0.0"}`
   - 依赖安装失败 → 检查package.json
   - 构建命令错误 → 检查vercel.json

### Q2: 如何查看构建日志?
**A**: 
1. 访问Vercel项目页面
2. 点击最新的部署
3. 查看 "Building" 标签页

### Q3: 如何回滚到之前的版本?
**A**: 
1. 在Vercel项目的 "Deployments" 页面
2. 找到之前成功的部署
3. 点击右侧的 "..." → "Promote to Production"

### Q4: 国内访问速度如何?
**A**: 
- Vercel在国内访问速度已经很不错
- 如果需要更快,可以:
  - 使用自定义域名并配置国内DNS
  - 或考虑阿里云OSS(需要备案)

### Q5: API密钥安全吗?
**A**: 
- ✅ 安全!API密钥存储在用户浏览器的localStorage中
- ✅ 不会上传到服务器
- ✅ 每个用户使用自己的API密钥
- ✅ 不会泄露给其他用户

---

## 🎯 优化建议

### 1. 启用Vercel Analytics(可选)
在项目设置中启用:
- **Analytics**: 访问量统计
- **Speed Insights**: 性能监控

### 2. 配置环境变量(如果需要)
在项目设置 → Environment Variables 中添加

### 3. 设置部署保护(可选)
在项目设置 → Deployment Protection 中配置:
- 密码保护
- 仅限团队成员访问

---

## 📞 获取帮助

- **Vercel文档**: https://vercel.com/docs
- **Vercel社区**: https://github.com/vercel/vercel/discussions
- **项目Issues**: https://github.com/Fengsha5201314/AI_Context-canvas/issues

---

## 🎊 恭喜!

你的AI Context Canvas已经准备好部署了!

**下一步**:
1. 访问 https://vercel.com/new
2. 导入 `Fengsha5201314/AI_Context-canvas` 仓库
3. 点击Deploy
4. 等待2-3分钟
5. 获取访问链接
6. 分享给朋友使用!

**预期访问链接**:
- `https://ai-context-canvas.vercel.app`
- 或你自定义的域名

🚀 开始部署吧!
