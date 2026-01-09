# Gemini API 修复说明

## 问题描述
用户报告API调用失败，无法正常使用Gemini模型。

## 根本原因
1. **maxOutputTokens参数设置不当**：之前移除了该参数，导致输出被截断
2. **模型选择问题**：默认使用预览版模型可能不稳定

## 解决方案

### 1. 恢复maxOutputTokens参数
根据官方文档，Gemini 3 Pro和Flash的输出限制为65,536 tokens，已在代码中正确设置：

```typescript
generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 65536, // 设置最大输出token数
}
```

### 2. 更新模型选项
在设置面板中添加了更多模型选择：
- **Gemini 3 Pro (预览版)** - 最强大，但可能不稳定
- **Gemini 3 Flash (预览版)** - 快速版本
- **Gemini 2.5 Pro (稳定版)** - 推荐用于生产环境
- **Gemini 2.5 Flash (稳定版)** - 默认选项，平衡性能和稳定性

### 3. 修改默认模型
将默认模型从 `gemini-3-pro-preview` 改为 `gemini-2.5-flash`，确保新用户获得稳定体验。

### 4. 增强提示词
在系统提示词后添加了更明确的指令：
```
重要提示：请输出完整详细的内容，不要省略或截断任何信息。尽可能详细地展开所有要点。
```

## 测试建议

1. **检查API密钥**：确保在设置面板中正确配置了Google AI Studio的API密钥
2. **选择稳定模型**：建议先使用 `gemini-2.5-flash` 测试
3. **测试输出长度**：粘贴多个内容块，点击"AI提取总结"，查看输出是否完整
4. **查看控制台**：如果仍有错误，打开浏览器开发者工具查看详细错误信息

## 相关文件
- `ai-context-canvas/src/services/aiService.ts` - API调用逻辑
- `ai-context-canvas/src/components/SettingsPanel.tsx` - 模型选择界面
- `ai-context-canvas/src/stores/appStore.ts` - 默认配置

## 官方文档参考
- [Gemini API Models](https://ai.google.dev/gemini-api/docs/models)
- Gemini 3 Pro输出限制：65,536 tokens
- Gemini 2.5 Flash输出限制：65,536 tokens

## 下一步
如果问题仍然存在，请检查：
1. API密钥是否有效
2. 是否有足够的配额
3. 网络连接是否正常
4. 浏览器控制台的具体错误信息
