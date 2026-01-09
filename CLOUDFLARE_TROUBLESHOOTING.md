# Cloudflare Pages 部署故障排除指南

## 问题：构建失败

如果你在 Cloudflare Pages 上看到构建失败，请按照以下步骤操作：

## 解决方案 1：检查构建配置

### 在 Cloudflare Pages 项目设置中确认以下配置：

1. **生产分支**：`main`
2. **构建命令**：`npm run build`
3. **构建输出目录**：`dist`
4. **Node.js 版本**：18.x 或更高

### 如何修改构建配置：

1. 进入你的 Cloudflare Pages 项目
2. 点击 **"设置"** (Settings) 标签
3. 找到 **"构建和部署"** (Builds & deployments) 部分
4. 点击 **"编辑配置"** (Edit configuration)
5. 修改以上设置
6. 点击 **"保存"** (Save)

## 解决方案 2：重新触发构建

### 方法 A：通过 Cloudflare 控制台

1. 进入你的项目页面
2. 点击 **"部署"** (Deployments) 标签
3. 找到失败的部署
4. 点击 **"重试部署"** (Retry deployment) 按钮

### 方法 B：通过 Git 推送

```bash
# 进入项目目录
cd ai-context-canvas

# 创建一个空提交来触发重新构建
git commit --allow-empty -m "触发 Cloudflare Pages 重新构建"

# 推送到 GitHub
git push origin main
```

## 解决方案 3：检查构建日志

1. 在 Cloudflare Pages 项目中，点击失败的部署
2. 查看完整的构建日志
3. 找到具体的错误信息

### 常见错误及解决方法：

#### 错误 1：Node.js 版本不兼容
```
Error: The engine "node" is incompatible with this module
```

**解决方法**：
- 我已经添加了 `.node-version` 和 `.nvmrc` 文件
- 这些文件会告诉 Cloudflare 使用 Node.js 18.17.0
- 重新触发构建即可

#### 错误 2：依赖安装失败
```
npm ERR! code ERESOLVE
```

**解决方法**：
在 Cloudflare Pages 设置中，将构建命令改为：
```bash
npm install --legacy-peer-deps && npm run build
```

#### 错误 3：TypeScript 编译错误
```
error TS2307: Cannot find module
```

**解决方法**：
确保所有依赖都在 `package.json` 中正确声明。

#### 错误 4：内存不足
```
JavaScript heap out of memory
```

**解决方法**：
在 Cloudflare Pages 设置中，将构建命令改为：
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## 解决方案 4：使用环境变量

如果需要设置环境变量：

1. 进入项目设置
2. 找到 **"环境变量"** (Environment variables)
3. 添加以下变量（如果需要）：
   - `NODE_VERSION`: `18.17.0`
   - `NPM_FLAGS`: `--legacy-peer-deps`

## 解决方案 5：清除缓存并重新构建

1. 进入项目设置
2. 找到 **"构建缓存"** (Build cache)
3. 点击 **"清除缓存"** (Purge cache)
4. 重新触发构建

## 验证部署成功

部署成功后，你应该能看到：

1. ✅ 构建状态显示为 **"成功"** (Success)
2. 🌐 访问 URL：`https://ai-context-canvas.pages.dev`
3. 🎉 应用正常运行

## 当前配置文件

我已经为你创建了以下配置文件：

- `.node-version` - 指定 Node.js 版本
- `.nvmrc` - Node Version Manager 配置
- `wrangler.toml` - Cloudflare Pages 构建配置

这些文件已经推送到 GitHub，下次构建时会自动使用。

## 需要帮助？

如果以上方法都不能解决问题，请：

1. 截图完整的构建日志
2. 告诉我具体的错误信息
3. 我会帮你进一步诊断问题

## 快速操作步骤

**现在就重新构建：**

1. 进入 Cloudflare Pages 项目
2. 点击 **"部署"** 标签
3. 点击 **"重试部署"** 按钮
4. 等待 2-3 分钟
5. 查看构建是否成功

或者，在终端运行：
```bash
cd ai-context-canvas
git commit --allow-empty -m "重新触发构建"
git push origin main
```

然后在 Cloudflare 控制台查看新的构建进度。
