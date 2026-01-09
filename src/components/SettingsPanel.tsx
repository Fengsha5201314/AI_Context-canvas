import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import type { AIConfig } from '../types/canvas';

interface SettingsPanelProps {
  onClose: () => void;
}

function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { aiConfig, updateAIConfig } = useAppStore();
  const [config, setConfig] = useState<AIConfig>(aiConfig);

  const handleSave = () => {
    updateAIConfig(config);
    // 保存到localStorage
    localStorage.setItem('ai-config', JSON.stringify(config));
    onClose();
  };

  const updateProvider = (provider: string, field: string, value: any) => {
    setConfig({
      ...config,
      providers: {
        ...config.providers,
        [provider]: {
          ...config.providers[provider],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">AI配置</h2>
        
        {/* 系统提示词 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            系统提示词
          </label>
          <textarea
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="请输入系统提示词..."
          />
        </div>

        {/* 选择AI提供商 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择AI提供商
          </label>
          <select
            value={config.selectedProvider}
            onChange={(e) => setConfig({ ...config, selectedProvider: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="siliconflow">硅基流动 (推荐-国内可用)</option>
            <option value="aliyun">阿里云百炼 (国内可用)</option>
            <option value="google">Google Gemini (需科学上网)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            一次只能使用一个AI提供商，请选择后在下方配置对应的API密钥
          </p>
        </div>

        {/* Google Gemini配置 */}
        {config.selectedProvider === 'google' && (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Google Gemini 配置</h3>
            
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ 注意：Google Gemini API在国内需要科学上网才能访问
            </div>
          
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">API密钥</label>
              <input
                type="password"
                value={config.providers.google.apiKey}
                onChange={(e) => updateProvider('google', 'apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入Google AI Studio API密钥"
              />
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block"
              >
                → 获取API密钥
              </a>
            </div>
          
            <div>
              <label className="block text-sm text-gray-600 mb-1">模型</label>
              <select
                value={config.providers.google.model}
                onChange={(e) => updateProvider('google', 'model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemini-3-pro-preview">Gemini 3 Pro (预览版 - 最强)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (预览版 - 快速)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (稳定版)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (稳定版)</option>
              </select>
            </div>
          </div>
        )}

        {/* 硅基流动配置 */}
        {config.selectedProvider === 'siliconflow' && (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">硅基流动配置</h3>
          
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">API密钥</label>
              <input
                type="password"
                value={config.providers.siliconflow.apiKey}
                onChange={(e) => updateProvider('siliconflow', 'apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入硅基流动API密钥"
              />
              <a 
                href="https://cloud.siliconflow.cn/account/ak" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block"
              >
                → 获取API密钥
              </a>
            </div>
          
            <div>
              <label className="block text-sm text-gray-600 mb-1">模型</label>
              <select
                value={config.providers.siliconflow.model}
                onChange={(e) => updateProvider('siliconflow', 'model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B">DeepSeek R1 Qwen3 8B (免费推荐)</option>
                <option value="Qwen/Qwen2.5-72B-Instruct">Qwen 2.5 72B Instruct</option>
                <option value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen 2.5 Coder 32B</option>
                <option value="deepseek-ai/DeepSeek-V3">DeepSeek V3</option>
                <option value="custom">自定义模型...</option>
              </select>
              {config.providers.siliconflow.model === 'custom' && (
                <input
                  type="text"
                  placeholder="输入自定义模型名称，如：Pro/Qwen/Qwen2.5-72B-Instruct"
                  onChange={(e) => updateProvider('siliconflow', 'model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
              )}
              <a 
                href="https://cloud.siliconflow.cn/me/models" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 inline-block"
              >
                → 查看所有可用模型
              </a>
            </div>
          </div>
        )}

        {/* 阿里云百炼配置 */}
        {config.selectedProvider === 'aliyun' && (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">阿里云百炼配置</h3>
          
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">API密钥</label>
              <input
                type="password"
                value={config.providers.aliyun.apiKey}
                onChange={(e) => updateProvider('aliyun', 'apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入阿里云百炼API密钥"
              />
              <a 
                href="https://bailian.console.aliyun.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block"
              >
                → 获取API密钥
              </a>
            </div>
          
            <div>
              <label className="block text-sm text-gray-600 mb-1">模型</label>
              <select
                value={config.providers.aliyun.model}
                onChange={(e) => updateProvider('aliyun', 'model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="qwen3-coder-plus">Qwen3 Coder Plus (有免费额度)</option>
                <option value="qwen-flash">Qwen Flash (推荐)</option>
                <option value="qwen-plus">Qwen Plus</option>
                <option value="qwen-max">Qwen Max</option>
                <option value="qwen-turbo">Qwen Turbo</option>
                <option value="custom">自定义模型...</option>
              </select>
              {config.providers.aliyun.model === 'custom' && (
                <input
                  type="text"
                  placeholder="输入自定义模型名称"
                  onChange={(e) => updateProvider('aliyun', 'model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
              )}
              <a 
                href="https://bailian.console.aliyun.com/?tab=model#/model-market/all?providers=qwen" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 inline-block"
              >
                → 查看所有可用模型
              </a>
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
