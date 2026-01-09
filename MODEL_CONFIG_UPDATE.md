# 模型配置优化更新

## 更新内容

优化了AI模型配置界面，添加了推荐的免费模型选项和便捷的获取链接。

## 主要改进

### 1. 硅基流动配置优化

**默认模型更新：**
- 新默认：`deepseek-ai/DeepSeek-R1-0528-Qwen3-8B` （完全免费）
- 旧默认：`Qwen/Qwen2.5-72B-Instruct`

**新增模型选项：**
- ✅ DeepSeek R1 Qwen3 8B (免费推荐)
- Qwen 2.5 72B Instruct
- Qwen 2.5 Coder 32B
- DeepSeek V3
- 自定义模型（支持手动输入）

**便捷链接：**
- API密钥获取：https://cloud.siliconflow.cn/account/ak
- 模型广场：https://cloud.siliconflow.cn/me/models

### 2. 阿里云百炼配置优化

**默认模型更新：**
- 新默认：`qwen3-coder-plus` （有免费额度）
- 旧默认：`qwen-max`

**新增模型选项：**
- ✅ Qwen3 Coder Plus (有免费额度)
- ✅ Qwen Flash (推荐)
- Qwen Plus
- Qwen Max
- Qwen Turbo
- 自定义模型（支持手动输入）

**便捷链接：**
- API密钥获取：https://bailian.console.aliyun.com/
- 模型市场：https://bailian.console.aliyun.com/?tab=model#/model-market/all?providers=qwen

### 3. Google Gemini配置优化

**新增提示：**
- ⚠️ 添加了"需要科学上网"的警告提示
- 帮助用户了解使用限制

**便捷链接：**
- API密钥获取：https://aistudio.google.com/apikey

### 4. 默认提供商调整

**新默认：硅基流动**
- 原因：国内可直接访问，有免费模型
- 旧默认：Google Gemini（国内需科学上网）

## 用户体验改进

### 1. 下拉选择 + 自定义输入
- 常用模型可直接选择
- 支持"自定义模型"选项
- 输入框自动显示，方便填写

### 2. 一键跳转链接
- 每个API配置都有"获取API密钥"链接
- 每个模型配置都有"查看所有可用模型"链接
- 新标签页打开，不影响当前操作

### 3. 免费模型标注
- 明确标注哪些模型免费
- 标注哪些模型有免费额度
- 帮助用户做出选择

## 推荐配置（国内用户）

### 方案1：硅基流动（完全免费）
```
提供商：硅基流动
模型：deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
优点：完全免费，国内可访问
```

### 方案2：阿里云百炼（有免费额度）
```
提供商：阿里云百炼
模型：qwen3-coder-plus
优点：有免费额度，国内稳定
```

### 方案3：混合使用
```
日常使用：硅基流动（免费）
高质量需求：阿里云百炼 Qwen Flash
```

## 技术实现

### 自定义模型输入
```typescript
{config.providers.siliconflow.model === 'custom' && (
  <input
    type="text"
    placeholder="输入自定义模型名称"
    onChange={(e) => updateProvider('siliconflow', 'model', e.target.value)}
  />
)}
```

### 外部链接
```typescript
<a 
  href="https://cloud.siliconflow.cn/me/models" 
  target="_blank" 
  rel="noopener noreferrer"
  className="text-xs text-blue-500 hover:text-blue-600"
>
  → 查看所有可用模型
</a>
```

## 相关文件

- `ai-context-canvas/src/stores/appStore.ts` - 默认配置
- `ai-context-canvas/src/components/SettingsPanel.tsx` - 设置界面

## 用户指南

### 如何获取硅基流动API密钥
1. 访问 https://cloud.siliconflow.cn/account/ak
2. 注册/登录账号
3. 创建API密钥
4. 复制密钥到设置面板

### 如何获取阿里云百炼API密钥
1. 访问 https://bailian.console.aliyun.com/
2. 登录阿里云账号
3. 开通百炼服务
4. 创建API密钥
5. 复制密钥到设置面板

### 如何选择模型
1. 打开设置面板
2. 选择AI提供商
3. 从下拉列表选择推荐模型
4. 或选择"自定义模型"手动输入
5. 点击"查看所有可用模型"了解更多

## 未来优化

1. 添加模型性能对比
2. 显示模型价格信息
3. 添加模型使用统计
4. 支持多模型并行调用
