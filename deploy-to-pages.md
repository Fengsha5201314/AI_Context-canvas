# 🚀 Cloudflare Pages 正确部署指南

## 问题说明

你之前创建的是一个 **Worker 项目**，不是 **Pages 项目**，所以网站无法访问。

Worker 和 Pages 的区别：
- **Worker**：用于运行后端代码（API、函数）
- **Pages**：用于部署前端网站（HTML/CSS/JS）

我们的项目是前端应用，需要使用 **Pages**！

---

## ✅ 正确的部署步骤

### 步骤 1：删除错误的 Worker 项目（可选）

1. 进入 Cloudflare 控制台
2. 找到左侧边栏的 **"Workers 和 Pages"**
3. 找到 `ai-content-canvas` 项目
4. 点击项目名称
5. 点击 **"设置"** (Settings)
6. 滚动到底部，点击 **"删除"** (Delete)

### 步骤 2：创建真正的 Pages 项目

#### 方法 A：通过网页界面（推荐）

1. **直接访问这个 URL**：
   ```
   https://dash.cloudflare.com/6d8207078aefb6f90359624660abdfad/pages/new
   ```

2. 你应该看到 **"连接到 Git"** 按钮，点击它

3. 选择 **GitHub**

4. 授权 Cloudflare 访问你的 GitHub

5. 选择 `AI_Context-canvas` 仓库

6. 配置构建设置：
   ```
   项目名称：ai-context-canvas
   生产分支：main
   框架预设：None（或选择 Vite）
   构建命令：npm run build
   构建输出目录：dist
   根目录：/（留空）
   ```

7. 点击 **"保存并部署"**

8. 等待 2-3 分钟，构建完成

9. 访问新的 URL（会是 `https://ai-context-canvas.pages.dev`）

#### 方法 B：通过命令行（备用方案）

如果网页界面一直进入 Worker 页面，可以使用命令行：

1. 打开终端（命令提示符）

2. 进入项目目录：
   ```bash
   cd ai-context-canvas
   ```

3. 安装 Wrangler（Cloudflare 的命令行工具）：
   ```bash
   npm install -g wrangler
   ```

4. 登录 Cloudflare：
   ```bash
   wrangler login
   ```
   这会打开浏览器，让你授权

5. 部署到 Pages：
   ```bash
   wrangler pages deploy dist --project-name=ai-context-canvas
   ```

6. 等待部署完成，会显示访问 URL

---

## 🎯 如何判断是 Pages 还是 Worker？

### Pages 项目的特征：
- ✅ URL 包含 `/pages/`
- ✅ 有 "构建设置" 选项
- ✅ 可以连接 Git 仓库
- ✅ 显示 "部署历史"
- ✅ 网站可以正常访问

### Worker 项目的特征：
- ❌ URL 包含 `/workers/`
- ❌ 需要写代码或上传脚本
- ❌ 没有 "构建设置"
- ❌ 网站无法访问（ERR_CONNECTION_CLOSED）

---

## 📝 重要提示

1. **不要在 Worker 页面创建项目**
   - Worker 是给后端服务用的
   - 我们需要的是 Pages

2. **确保在 Pages 页面创建**
   - URL 应该包含 `/pages/new`
   - 应该看到 "连接到 Git" 选项

3. **如果一直进入 Worker 页面**
   - 尝试直接访问：`https://dash.cloudflare.com/6d8207078aefb6f90359624660abdfad/pages`
   - 然后点击 "创建应用程序" 或 "Create application"

---

## 🆘 需要帮助？

如果按照上面的步骤还是无法创建 Pages 项目，请：

1. 截图你看到的页面
2. 告诉我 URL 地址栏显示的内容
3. 我会继续帮你排查问题

---

## 🎉 成功标志

当你成功创建 Pages 项目后：

1. ✅ 在 Cloudflare 控制台看到项目类型是 "Pages"
2. ✅ 可以看到 "部署历史" 和 "构建日志"
3. ✅ 访问 `https://ai-context-canvas.pages.dev` 能看到你的网站
4. ✅ 网站功能正常，可以添加卡片、使用 AI 等

---

**现在就试试方法 A，直接访问 Pages 创建页面！** 🚀
