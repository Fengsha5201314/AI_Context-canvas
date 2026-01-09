# AI上下文画布

一个轻量级的无限画布应用，用于整理和管理AI对话所需的上下文资料。

## ✨ 核心功能

- 📋 **快速粘贴**: 支持文字和图片的快速粘贴
- 🎨 **无限画布**: 自由拖动和排列内容
- 📦 **自动保存**: 数据自动保存到本地，刷新不丢失
- 📄 **多格式导出**: 支持PDF和Word格式导出
- 🤖 **AI集成**: 支持Google Gemini、硅基流动、阿里云百炼
- ⌨️ **快捷键**: 完整的快捷键支持，提高效率

## 🚀 快速开始

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
2. **拖动内容**: 直接拖动内容块
3. **移动画布**: 按住 `空格键` + 拖动
4. **缩放画布**: 按住 `Alt键` + 滚轮

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

1. **AI对话准备**: 整理多张截图和文字，导出PDF发送给AI
2. **学习笔记**: 收集和整理学习资料
3. **资料收集**: 从多个来源收集内容，统一管理
4. **会议记录**: 实时记录会议要点和白板内容

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **画布渲染**: React Konva
- **样式**: TailwindCSS
- **构建工具**: Vite
- **数据存储**: IndexedDB (localforage)
- **导出功能**: jsPDF + docx
- **AI集成**: Google Generative AI SDK

## 📋 快捷键

| 功能 | 快捷键 |
|------|--------|
| 粘贴 | Ctrl+V |
| 复制 | Ctrl+C |
| 剪切 | Ctrl+X |
| 撤销 | Ctrl+Z |
| 重做 | Ctrl+Y |
| 删除 | Delete |
| 移动画布 | Space+拖动 |
| 缩放画布 | Alt+滚轮 |

## 🔧 开发

### 运行测试
```bash
npm test
```

### 代码检查
```bash
npm run build
```

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
