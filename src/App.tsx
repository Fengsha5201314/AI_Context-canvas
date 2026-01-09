import { useEffect, useState, useRef } from 'react';
import { useAppStore } from './stores/appStore';
import GridCanvas, { GridCanvasRef } from './components/GridCanvas';
import Toolbar from './components/Toolbar';
import SettingsPanel from './components/SettingsPanel';
import { readFromClipboard, handleFileDrop } from './utils/clipboard';
import { ExportService } from './services/exportService';
import { AIService } from './services/aiService';
import { StorageService } from './services/storageService';
import type { ContentBlock } from './types/canvas';

function App() {
  const { addBlock, undo, redo, copy, cut, canvas, aiConfig, updateAIConfig } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<GridCanvasRef>(null);
  
  // 预览模态框状态
  const [previewBlock, setPreviewBlock] = useState<ContentBlock | null>(null);

  // 初始化：从localStorage加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载画布状态
        const savedCanvas = await StorageService.loadCanvas();
        if (savedCanvas) {
          useAppStore.setState({ canvas: savedCanvas });
        }

        // 加载AI配置
        const savedAIConfig = await StorageService.loadAIConfig();
        if (savedAIConfig) {
          updateAIConfig(savedAIConfig);
        }

        // 加载AI结果
        const savedAIResult = localStorage.getItem('ai_result');
        if (savedAIResult) {
          setAiResult(savedAIResult);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [updateAIConfig]);

  // 自动保存画布状态
  useEffect(() => {
    if (isLoading) return;

    const saveCanvas = async () => {
      try {
        await StorageService.saveCanvas(canvas);
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    };

    // 防抖：500ms后保存
    const timer = setTimeout(saveCanvas, 500);
    return () => clearTimeout(timer);
  }, [canvas, isLoading]);

  // 自动保存AI配置
  useEffect(() => {
    if (isLoading) return;

    const saveAIConfig = async () => {
      try {
        await StorageService.saveAIConfig(aiConfig);
      } catch (error) {
        console.error('保存AI配置失败:', error);
      }
    };

    const timer = setTimeout(saveAIConfig, 500);
    return () => clearTimeout(timer);
  }, [aiConfig, isLoading]);

  // 自动保存AI结果
  useEffect(() => {
    if (isLoading) return;

    if (aiResult) {
      localStorage.setItem('ai_result', aiResult);
    } else {
      localStorage.removeItem('ai_result');
    }
  }, [aiResult, isLoading]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // 检查焦点元素，如果是输入框、文本域或可编辑元素，则不处理快捷键
      const activeElement = document.activeElement;
      const isInputFocused = 
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';
      
      // ESC键关闭预览
      if (e.key === 'Escape' && previewBlock) {
        e.preventDefault();
        setPreviewBlock(null);
        return;
      }
      
      // 获取最新的 store 状态，避免闭包陷阱
      const { clickPosition: currentClickPosition, canvas, deleteBlocks, setViewport } = useAppStore.getState();
      
      // Ctrl/Cmd + V: 粘贴（仅在非输入框时触发）
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isInputFocused) {
        e.preventDefault();
        try {
          const block = await readFromClipboard(currentClickPosition || undefined);
          if (block) {
            addBlock(block);
            
            // 平滑移动视口到新内容位置
            const scale = canvas.viewport.scale;
            const targetX = window.innerWidth / 2 - (block.position.x + block.size.width / 2) * scale;
            const targetY = (window.innerHeight - 60) / 2 - (block.position.y + block.size.height / 2) * scale;
            
            // 使用动画平滑移动
            const startX = canvas.viewport.x;
            const startY = canvas.viewport.y;
            const duration = 300; // 300ms动画
            const startTime = Date.now();
            
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // 使用缓动函数（easeOutCubic）
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              
              const currentX = startX + (targetX - startX) * easeProgress;
              const currentY = startY + (targetY - startY) * easeProgress;
              
              setViewport({ x: currentX, y: currentY });
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            
            requestAnimationFrame(animate);
          } else {
            console.log('剪贴板为空或无法读取内容');
          }
        } catch (error) {
          console.error('粘贴失败:', error);
          alert('粘贴失败，请确保已授予剪贴板权限。\n\n在浏览器地址栏左侧点击锁图标，允许"剪贴板"权限。');
        }
      }
      
      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y: 重做
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
      
      // Ctrl/Cmd + C: 复制
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copy();
      }
      
      // Ctrl/Cmd + X: 剪切
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        cut();
      }
      
      // Delete: 删除选中的内容块
      if (e.key === 'Delete') {
        e.preventDefault();
        if (canvas.selectedIds.length > 0) {
          deleteBlocks(canvas.selectedIds);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addBlock, undo, redo, copy, cut, previewBlock]);

  // 处理文件拖拽
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.files) {
        const blocks = await handleFileDrop(e.dataTransfer.files);
        blocks.forEach(block => addBlock(block));
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [addBlock]);

  const handleExportPDF = async () => {
    if (canvas.blocks.length === 0) {
      alert('画布为空，无法导出');
      return;
    }
    
    setIsExporting(true);
    try {
      // 使用优化后的导出方法 - 按内容块顺序导出
      const blob = await ExportService.exportToPDF(canvas.blocks);
      const filename = ExportService.generateExportFilename('pdf');
      ExportService.downloadBlob(blob, filename);
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    if (canvas.blocks.length === 0) {
      alert('画布为空，无法导出');
      return;
    }
    
    setIsExporting(true);
    try {
      const blob = await ExportService.exportToWord(canvas.blocks);
      const filename = ExportService.generateExportFilename('docx');
      ExportService.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Word导出失败:', error);
      alert('Word导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAISummarize = async () => {
    if (canvas.blocks.length === 0) {
      alert('画布为空，无法进行AI处理');
      return;
    }
    
    setIsAIProcessing(true);
    setAiResult(''); // 清空之前的结果
    
    try {
      // 使用流式API，实时更新结果
      await AIService.summarizeStream(canvas.blocks, aiConfig, (text) => {
        setAiResult(text); // 实时更新显示的文本
      });
    } catch (error: any) {
      console.error('AI处理失败:', error);
      alert(error.message || 'AI处理失败，请重试');
      setAiResult(null); // 出错时清空结果
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {isLoading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="text-center">
            <p className="text-lg text-gray-600">加载中...</p>
          </div>
        </div>
      )}
      
      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p className="text-lg">正在导出，请稍候...</p>
          </div>
        </div>
      )}
      
      {isAIProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p className="text-lg">AI正在处理，请稍候...</p>
          </div>
        </div>
      )}
      
      <Toolbar
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
        onAISummarize={handleAISummarize}
        onOpenSettings={handleOpenSettings}
      />
      
      {/* 左右分栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧: 已粘贴的内容 */}
        <div className="flex-1 overflow-y-auto bg-white border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              已粘贴的内容
            </h2>
            <GridCanvas ref={canvasRef} onBlockDoubleClick={setPreviewBlock} />
          </div>
        </div>
        
        {/* 右侧: AI清洗 */}
        <div className="w-[400px] overflow-y-auto bg-gray-50 border-l border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              AI 清洗
              {isAIProcessing && (
                <span className="ml-2 text-sm text-blue-500 animate-pulse">生成中...</span>
              )}
            </h2>
            {aiResult !== null && aiResult !== '' ? (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <textarea
                  value={aiResult}
                  onChange={(e) => setAiResult(e.target.value)}
                  className="w-full h-[calc(100vh-250px)] p-3 text-sm text-gray-700 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AI处理结果将显示在这里..."
                  disabled={isAIProcessing}
                />
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult);
                      alert('已复制到剪贴板');
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    disabled={isAIProcessing}
                  >
                    复制
                  </button>
                  <button
                    onClick={() => setAiResult(null)}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={isAIProcessing}
                  >
                    清除
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p className="text-sm">暂无清洗结果</p>
                <p className="text-xs mt-2">点击工具栏的"AI提取总结"按钮</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      
      {previewBlock && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setPreviewBlock(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {previewBlock.type === 'text' ? (
              <div className="p-8">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-800">文本预览</h3>
                  <button
                    onClick={() => setPreviewBlock(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>
                <div 
                  className="prose max-w-none whitespace-pre-wrap"
                  style={{
                    fontSize: `${(previewBlock.fontSize || 14) * 1.5}px`,
                    fontFamily: previewBlock.fontFamily || 'Arial',
                    color: previewBlock.color || '#000000',
                  }}
                >
                  {previewBlock.content}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">图片预览</h3>
                  <button
                    onClick={() => setPreviewBlock(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>
                <img 
                  src={previewBlock.imageData} 
                  alt="预览" 
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
