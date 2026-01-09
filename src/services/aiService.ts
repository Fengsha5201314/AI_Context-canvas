import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ContentBlock, AIConfig } from '../types/canvas';

export class AIService {
  // 调用AI进行总结（流式输出）
  static async summarizeStream(
    blocks: ContentBlock[], 
    config: AIConfig,
    onChunk: (text: string) => void
  ): Promise<string> {
    if (blocks.length === 0) {
      throw new Error('画布为空，无法进行AI处理');
    }

    const provider = config.selectedProvider;
    const providerConfig = config.providers[provider];

    // 只检查API密钥是否配置
    if (!providerConfig || !providerConfig.apiKey) {
      const providerNames: Record<string, string> = {
        google: 'Google Gemini',
        siliconflow: '硅基流动',
        aliyun: '阿里云百炼'
      };
      throw new Error(`请先在设置中配置${providerNames[provider] || provider}的API密钥`);
    }

    switch (provider) {
      case 'google':
        return await this.callGoogleGeminiStream(blocks, config, onChunk);
      case 'siliconflow':
        return await this.callSiliconFlowStream(blocks, config, onChunk);
      case 'aliyun':
        return await this.callAliyunBailianStream(blocks, config, onChunk);
      default:
        throw new Error(`不支持的AI提供商: ${provider}`);
    }
  }

  // 调用AI进行总结（非流式，保留兼容性）
  static async summarize(blocks: ContentBlock[], config: AIConfig): Promise<string> {
    let result = '';
    await this.summarizeStream(blocks, config, (chunk) => {
      result = chunk;
    });
    return result;
  }

  // 调用Google Gemini API（流式输出）
  private static async callGoogleGeminiStream(
    blocks: ContentBlock[], 
    config: AIConfig,
    onChunk: (text: string) => void
  ): Promise<string> {
    const providerConfig = config.providers.google;
    const genAI = new GoogleGenerativeAI(providerConfig.apiKey);
    
    // 使用正确的模型名称,并设置生成配置
    // Gemini 3 Pro输出限制: 65,536 tokens
    const model = genAI.getGenerativeModel({ 
      model: providerConfig.model,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 65536, // 设置最大输出token数
      },
    });

    // 构建消息内容
    const parts: any[] = [
      { text: config.systemPrompt + '\n\n重要提示：请输出完整详细的内容，不要省略或截断任何信息。尽可能详细地展开所有要点。\n\n' },
    ];

    for (const block of blocks) {
      if (block.type === 'text') {
        parts.push({ text: block.content + '\n\n' });
      } else if (block.type === 'image') {
        // 提取base64数据
        const base64Data = block.imageData.split(',')[1];
        const mimeType = block.imageData.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
        
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }
    }

    try {
      // 使用流式API
      const result = await model.generateContentStream(parts);
      let fullText = '';
      
      // 逐块处理响应
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(fullText); // 回调函数，传递累积的文本
      }
      
      return fullText;
    } catch (error: any) {
      console.error('Gemini API错误详情:', error);
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
        throw new Error('Google Gemini API密钥无效，请检查配置');
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('Google Gemini API配额已用尽，请稍后再试');
      } else if (error.message?.includes('not found')) {
        throw new Error(`模型 ${providerConfig.model} 不可用，请在设置中选择其他模型`);
      } else {
        throw new Error(`Google Gemini API调用失败: ${error.message}`);
      }
    }
  }

  // 调用硅基流动API（流式输出）
  private static async callSiliconFlowStream(
    blocks: ContentBlock[], 
    config: AIConfig,
    onChunk: (text: string) => void
  ): Promise<string> {
    const providerConfig = config.providers.siliconflow;
    
    // 构建消息
    const messages: any[] = [
      {
        role: 'system',
        content: config.systemPrompt + '\n\n重要提示：请输出完整详细的内容，不要省略或截断任何信息。',
      },
    ];

    // 硅基流动支持多模态
    const userContent: any[] = [];
    
    for (const block of blocks) {
      if (block.type === 'text') {
        userContent.push({
          type: 'text',
          text: block.content,
        });
      } else if (block.type === 'image') {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: block.imageData,
          },
        });
      }
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: providerConfig.model,
          messages,
          max_tokens: 8000,
          temperature: 0.7,
          stream: true, // 启用流式输出
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '请求失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullText += content;
                  onChunk(fullText);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      return fullText;
    } catch (error: any) {
      if (error.message?.includes('Unauthorized')) {
        throw new Error('硅基流动API密钥无效，请检查配置');
      } else if (error.message?.includes('quota')) {
        throw new Error('硅基流动API配额已用尽，请稍后再试');
      } else {
        throw new Error(`硅基流动API调用失败: ${error.message}`);
      }
    }
  }

  // 调用阿里云百炼API（流式输出）
  private static async callAliyunBailianStream(
    blocks: ContentBlock[], 
    config: AIConfig,
    onChunk: (text: string) => void
  ): Promise<string> {
    const providerConfig = config.providers.aliyun;
    
    // 构建消息
    const messages: any[] = [
      {
        role: 'system',
        content: config.systemPrompt + '\n\n重要提示：请输出完整详细的内容，不要省略或截断任何信息。',
      },
    ];

    // 阿里云百炼支持多模态
    const userContent: any[] = [];
    
    for (const block of blocks) {
      if (block.type === 'text') {
        userContent.push({
          type: 'text',
          text: block.content,
        });
      } else if (block.type === 'image') {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: block.imageData,
          },
        });
      }
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    try {
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: providerConfig.model,
          messages,
          max_tokens: 8000,
          temperature: 0.7,
          stream: true, // 启用流式输出
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '请求失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullText += content;
                  onChunk(fullText);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      return fullText;
    } catch (error: any) {
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid')) {
        throw new Error('阿里云百炼API密钥无效，请检查配置');
      } else if (error.message?.includes('quota')) {
        throw new Error('阿里云百炼API配额已用尽，请稍后再试');
      } else {
        throw new Error(`阿里云百炼API调用失败: ${error.message}`);
      }
    }
  }
}
