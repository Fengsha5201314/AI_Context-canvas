# AI Context Canvas

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fengsha5201314/AI_Context-canvas)
[![GitHub](https://img.shields.io/github/license/Fengsha5201314/AI_Context-canvas)](https://github.com/Fengsha5201314/AI_Context-canvas/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Fengsha5201314/AI_Context-canvas)](https://github.com/Fengsha5201314/AI_Context-canvas/stargazers)

一个轻量级的AI驱动内容整理画布，支持文字和图片的快速粘贴、拖拽排序、AI智能总结和多格式导出。

## 🌟 在线体验

**立即访问**: [https://ai-context-canvas.vercel.app](https://ai-context-canvas.vercel.app) *(部署后更新此链接)*

无需安装，打开即用！

## ✨ 核心功能

- 📋 **快速粘贴**: 支持文字和图片的快速粘贴
- 🎨 **网格布局**: 卡片式网格布局，清晰直观
- 🔄 **拖拽排序**: 自由拖拽调整内容顺序
- 📦 **自动保存**: 数据自动保存到本地，刷新不丢失
- 📄 **多格式导出**: 支持PDF和Word格式导出
- 🤖 **AI智能总结**: 支持Google Gemini、硅基流动、阿里云百炼
- 🔄 **流式输出**: AI结果实时流式显示
- ⏰ **时间管理**: 支持时间戳编辑和按时间排序
- ⌨️ **快捷键**: 完整的快捷键支持，提高效率

## 🚀 一键部署

### 部署到Vercel(推荐)

点击按钮一键部署:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fengsha5201314/AI_Context-canvas)

**优势**:
- ✅ 国内可直接访问
- ✅ 完全免费
- ✅ 无需备案
- ✅ 自动HTTPS
- ✅ 全球CDN加速

详细部署指南: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

## 🚀 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:5174/ 启动

### 构建生产版本
```bash
npm run build
```

## 📖 使用说明

### 基础操作
1. **粘贴内容**: 点击画布 → 按 `Ctrl+V`
2. **拖动排序**: 拖动卡片标题栏进行排序
3. **编辑时间**: 点击时间戳可编辑
4. **双击预览**: 双击卡片查看完整内容
5. **AI总结**: 点击"AI提取总结"按钮

### ⚠️ 重要：剪贴板权限设置

**首次使用时，浏览器会请求剪贴板权限，请务必点击"允许"！**

#### 如果无法粘贴内容，请按以下步骤操作：

**Chrome/Edge浏览器：**
1. 点击地址栏左侧的 🔒 锁图标
2. 找到"剪贴板"权限
3. 选择"允许"
4. 刷新页面（F5）

**Firefox浏览器：**
1. 在地址栏输入 `about:config`
2. 搜索 `dom.events.asyncClipboard.clipboardItem`
3. 设置为 `true`
4. 刷新页面

**Safari浏览器：**
- Safari 13.1+ 通常无需额外设置
- 如有问题，检查"偏好设置" > "网站" > "其他"中的权限

### 完整功能说明

详细使用指南请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md)

## 🎯 使用场景

1. **AI对话准备**: 整理多张截图和文字，AI智能总结后使用
2. **学习笔记**: 收集和整理学习资料，按时间排序
3. **资料收集**: 从多个来源收集内容，统一管理
4. **会议记录**: 实时记录会议要点，导出PDF分享

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **画布渲染**: React Konva
- **拖拽排序**: @dnd-kit
- **样式**: TailwindCSS
- **构建工具**: Vite
- **数据存储**: IndexedDB (localforage)
- **导出功能**: jsPDF + docx
- **AI集成**: Google Generative AI SDK + 硅基流动 + 阿里云百炼

## 📋 快捷键

| 功能 | 快捷键 |
|------|--------|
| 粘贴 | Ctrl+V |
| 删除 | Delete |
| 双击预览 | 双击卡片 |
| 编辑时间 | 点击时间戳 |

## 🔧 开发与部署

### 本地开发
```bash
npm install
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 部署到Vercel
详见 [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### 部署到其他平台
详见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📝 项目结构

```
ai-context-canvas/
├── src/
│   ├── components/     # React组件
│   ├── services/       # 服务层（导出、AI、存储）
│   ├── stores/         # Zustand状态管理
│   ├── types/          # TypeScript类型定义
│   └── utils/          # 工具函数
├── public/             # 静态资源
└── ...配置文件
```

## 🐛 常见问题

### 无法粘贴内容？
→ 检查剪贴板权限设置（见上方说明）

### 图片无法显示？
→ 确保图片格式支持（PNG, JPG, GIF, WebP）

### AI功能无法使用？
→ 检查API密钥配置和网络连接

### 数据丢失？
→ 数据自动保存到浏览器本地，除非清除浏览器数据

更多问题请查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**提示**: 首次使用请务必授予剪贴板权限，否则无法粘贴内容！
