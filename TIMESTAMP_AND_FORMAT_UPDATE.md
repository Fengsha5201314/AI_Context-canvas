# 时间戳和格式保留更新

## 📋 更新概述

本次更新增强了内容管理功能,添加了时间戳显示、编辑和按时间排序功能,同时优化了导出格式保留。

## ✨ 新增功能

### 1. 时间戳显示 ✅

每个内容卡片的标题栏现在显示粘贴时间:

```
#1
2026-01-08 20:41:00
```

**格式**: `YYYY-MM-DD HH:mm:ss`

**位置**: 卡片顶部蓝色渐变标题栏,序号下方

**样式**: 
- 白色文字,半透明(opacity-90)
- 悬停时完全不透明(opacity-100)
- 右侧显示编辑图标(铅笔)

### 2. 时间戳编辑 ✅

用户可以点击时间戳进行编辑:

**操作流程**:
1. 点击时间戳区域
2. 输入框出现,显示当前时间
3. 修改时间(格式: YYYY-MM-DD HH:mm:ss)
4. 按Enter或点击✓保存
5. 按Escape或点击✕取消

**验证**:
- 自动解析输入的时间字符串
- 无效时间会被忽略
- 保存后立即更新显示

**用途**:
- 修正粘贴时间
- 手动调整排序顺序
- 标记特定时间点的内容

### 3. 按时间排序 ✅

点击工具栏的"自动排版"按钮,内容会按时间顺序重新排列:

**排序规则**:
- 按`createdAt`时间戳升序排列
- 从早到晚排序
- 修改过的时间戳也会参与排序

**效果**:
- 网格布局自动调整
- 序号重新分配(#1, #2, #3...)
- 支持撤销操作

**使用场景**:
- 用户拖拽调整顺序后想恢复时间顺序
- 批量粘贴后想按操作顺序排列
- 修改时间戳后重新排序

### 4. 导出格式保留 ✅

导出PDF时完整保留原始文本格式:

**保留内容**:
- ✅ 原始字体大小(`fontSize`)
- ✅ 原始字体系列(`fontFamily`)
- ✅ 原始文本颜色(`color`)
- ✅ 原始换行符(保留段落结构)
- ✅ 原始文本内容(不截断)

**对比**:

| 项目 | 卡片显示 | 双击预览 | PDF导出 |
|------|---------|---------|---------|
| 字体大小 | 限制14px | 原始大小×1.5 | **原始大小** |
| 文本行数 | 最多6行 | 完整显示 | **完整显示** |
| 换行保留 | 是 | 是 | **是** |
| 字体颜色 | 是 | 是 | **是** |

**实现细节**:
- 使用Canvas渲染文本为图片
- 保留用户设置的字体和颜色
- 智能分行,不破坏原始段落
- 高质量PNG格式嵌入PDF

## 🎯 使用场景

### 场景1: 按时间顺序整理笔记

1. 随意粘贴多个内容
2. 拖拽调整部分顺序
3. 点击"自动排版"恢复时间顺序
4. 导出PDF保留完整格式

### 场景2: 修正粘贴时间

1. 发现某个内容的时间不对
2. 点击时间戳进入编辑模式
3. 输入正确的时间
4. 点击"自动排版"重新排序

### 场景3: 标记重要时间点

1. 粘贴内容后
2. 编辑时间戳为特定时间(如会议时间)
3. 按时间排序后,内容按会议顺序排列
4. 导出为会议记录

## 🔧 技术实现

### 时间戳格式化

```typescript
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
```

### 时间戳解析

```typescript
const parseTimeString = (timeStr: string): number | null => {
  const date = new Date(timeStr);
  return isNaN(date.getTime()) ? null : date.getTime();
};
```

### 按时间排序

```typescript
autoLayout: () => {
  set((state) => {
    const blocks = [...state.canvas.blocks];
    if (blocks.length === 0) return state;

    // 按创建时间排序(从早到晚)
    blocks.sort((a, b) => a.createdAt - b.createdAt);

    return {
      canvas: {
        ...state.canvas,
        blocks: blocks,
      },
    };
  });
  get().pushHistory();
}
```

### 导出格式保留

```typescript
// 使用原始字体大小,不缩小
const fontSize = block.fontSize || 14;
ctx.font = `${fontSize}px ${block.fontFamily || 'Arial'}, ...`;
ctx.fillStyle = block.color || '#000000';

// 保留原始换行符
const paragraphs = block.content.split('\n');
```

## 📊 数据结构

### ContentBlock扩展

```typescript
interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
  createdAt: number;  // 粘贴时间戳(可编辑)
  updatedAt: number;  // 最后更新时间
  fontSize?: number;  // 原始字体大小
  fontFamily?: string; // 原始字体系列
  color?: string;     // 原始文本颜色
  // ...其他字段
}
```

## 🎨 UI设计

### 时间戳显示状态

```
┌─────────────────────────────┐
│ #1                    ≡≡≡≡  │ ← 拖动手柄
│ 2026-01-08 20:41:00    ✏️   │ ← 时间戳+编辑图标
└─────────────────────────────┘
```

### 时间戳编辑状态

```
┌─────────────────────────────┐
│ #1                    ≡≡≡≡  │
│ [2026-01-08 20:41:00] ✓ ✕  │ ← 输入框+保存/取消
└─────────────────────────────┘
```

## ⌨️ 快捷键

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 保存时间 | Enter | 编辑时间戳时 |
| 取消编辑 | Escape | 编辑时间戳时 |
| 自动排版 | - | 点击工具栏按钮 |

## 🔄 工作流程

### 完整工作流

```
粘贴内容
  ↓
自动记录时间戳
  ↓
显示在卡片标题栏
  ↓
(可选)点击编辑时间
  ↓
(可选)拖拽调整顺序
  ↓
点击"自动排版"按时间排序
  ↓
导出PDF(保留原始格式)
```

## 📝 注意事项

### 时间戳编辑

1. **格式要求**: 必须是有效的日期时间字符串
2. **推荐格式**: `YYYY-MM-DD HH:mm:ss`
3. **其他格式**: JavaScript Date能解析的格式都可以
4. **无效输入**: 会被忽略,保持原时间不变

### 排序行为

1. **稳定排序**: 相同时间的内容保持原有顺序
2. **自动保存**: 排序后自动推入历史记录
3. **可撤销**: 支持Ctrl+Z撤销排序

### 导出格式

1. **字体支持**: 依赖系统字体,建议使用常见字体
2. **颜色保留**: RGB颜色完整保留
3. **图片质量**: PNG格式,高质量输出
4. **文件大小**: 文本转图片会增加文件大小

## 🚀 性能优化

1. **时间格式化**: 使用原生Date API,性能优秀
2. **排序算法**: JavaScript原生sort,O(n log n)
3. **Canvas渲染**: 按需渲染,不影响UI响应
4. **状态管理**: 使用Zustand,最小化重渲染

## 📅 更新日期

2026年1月8日 21:00
