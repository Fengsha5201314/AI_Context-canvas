# 复制功能实现计划

## 需求 1：快速复制功能

### 功能描述
- 用户可以选中一个或多个卡片
- 按 Ctrl+C 复制选中的内容
- 可以粘贴到其他地方（AI 对话框等）

### 实现步骤

#### 1. 添加卡片选中状态（已有，需增强）
- [x] 单选：点击卡片
- [ ] 多选：Ctrl+点击添加/移除选中
- [ ] 全选：Ctrl+A
- [ ] 视觉反馈：选中的卡片高亮显示

#### 2. 实现复制功能
- [ ] 监听 Ctrl+C 事件
- [ ] 获取选中卡片的内容
- [ ] 将内容写入系统剪贴板
- [ ] 支持多种格式：
  - 纯文本
  - 富文本（HTML）
  - 图片（PNG）

#### 3. 添加工具栏按钮
- [ ] "复制选中" 按钮
- [ ] "全选" 按钮
- [ ] 显示选中数量

---

## 需求 2：自动捕获剪贴板

### 功能描述
- 添加一个开关控制
- 开关打开时，自动监听剪贴板变化
- 所有复制的内容自动添加到工具

### 实现步骤

#### 1. 添加开关控制
- [ ] 在设置面板添加"自动捕获剪贴板"开关
- [ ] 保存开关状态到 localStorage
- [ ] 在工具栏显示开关状态指示器

#### 2. 实现剪贴板监听
- [ ] 使用 Clipboard API 监听剪贴板变化
- [ ] 定时检查剪贴板内容（每 500ms）
- [ ] 检测到新内容时自动添加到工具
- [ ] 支持文本和图片

#### 3. 优化用户体验
- [ ] 添加提示：新内容已自动添加
- [ ] 防止重复添加相同内容
- [ ] 添加"清除重复"功能

---

## 需求 3：手机端适配（待后续实现）

### 功能描述
- 响应式布局
- 触摸操作优化
- 移动端 UI 适配

### 提醒
⚠️ 此需求等前两个需求测试完成后再实现

---

## 技术实现细节

### 1. 剪贴板 API

```typescript
// 读取剪贴板
const text = await navigator.clipboard.readText();
const items = await navigator.clipboard.read();

// 写入剪贴板
await navigator.clipboard.writeText(text);
await navigator.clipboard.write([
  new ClipboardItem({
    'text/plain': new Blob([text], { type: 'text/plain' }),
    'text/html': new Blob([html], { type: 'text/html' }),
  })
]);
```

### 2. 键盘事件监听

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+C: 复制
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      handleCopy();
    }
    // Ctrl+A: 全选
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      handleSelectAll();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 3. 状态管理

```typescript
interface AppStore {
  // 新增：自动捕获开关
  autoCapture: boolean;
  setAutoCapture: (enabled: boolean) => void;
  
  // 新增：选中状态增强
  selectAll: () => void;
  toggleSelection: (id: string) => void;
  
  // 新增：复制功能
  copySelectedBlocks: () => Promise<void>;
}
```

---

## 文件修改清单

### 需要修改的文件

1. **src/stores/appStore.ts**
   - 添加 autoCapture 状态
   - 添加 selectAll 方法
   - 添加 toggleSelection 方法
   - 添加 copySelectedBlocks 方法

2. **src/components/GridCanvas.tsx**
   - 添加卡片选中视觉反馈
   - 添加 Ctrl+点击多选支持
   - 添加键盘事件监听

3. **src/components/Toolbar.tsx**
   - 添加"复制选中"按钮
   - 添加"全选"按钮
   - 添加"自动捕获"开关
   - 显示选中数量

4. **src/components/SettingsPanel.tsx**
   - 添加"自动捕获剪贴板"设置项

5. **src/App.tsx**
   - 添加全局键盘事件监听
   - 添加剪贴板自动捕获逻辑

### 需要创建的文件

1. **src/utils/clipboard.ts**（已存在，需增强）
   - 添加复制多个卡片的功能
   - 添加复制为不同格式的功能

2. **src/hooks/useClipboardMonitor.ts**（新建）
   - 实现剪贴板监听 Hook
   - 处理自动添加逻辑

---

## 测试计划

### 需求 1 测试

1. **单选复制**
   - 点击一个卡片
   - 按 Ctrl+C
   - 粘贴到其他地方
   - 验证内容正确

2. **多选复制**
   - Ctrl+点击多个卡片
   - 按 Ctrl+C
   - 粘贴到其他地方
   - 验证所有内容都被复制

3. **全选复制**
   - 按 Ctrl+A
   - 按 Ctrl+C
   - 粘贴到其他地方
   - 验证所有内容都被复制

### 需求 2 测试

1. **自动捕获文本**
   - 打开自动捕获开关
   - 在其他地方复制文本
   - 切换到工具窗口
   - 验证文本自动添加

2. **自动捕获图片**
   - 打开自动捕获开关
   - 截图（QQ/微信/飞书）
   - 切换到工具窗口
   - 验证图片自动添加

3. **防重复**
   - 打开自动捕获开关
   - 多次复制相同内容
   - 验证不会重复添加

---

## 开发优先级

1. **高优先级**（立即实现）
   - 卡片多选功能
   - Ctrl+C 复制功能
   - 自动捕获开关
   - 剪贴板监听

2. **中优先级**（第二阶段）
   - 工具栏按钮
   - 复制格式选项
   - 防重复逻辑

3. **低优先级**（优化阶段）
   - 复制动画效果
   - 更多复制格式
   - 性能优化
