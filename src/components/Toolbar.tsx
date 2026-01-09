import { useAppStore } from '../stores/appStore';

interface ToolbarProps {
  onExportPDF: () => void;
  onExportWord: () => void;
  onAISummarize: () => void;
  onOpenSettings: () => void;
}

function Toolbar({ onExportPDF, onExportWord, onAISummarize, onOpenSettings }: ToolbarProps) {
  const { canvas, clearCanvas, showGrid, setShowGrid, autoLayout } = useAppStore();
  const canExport = canvas.blocks.length > 0;

  const handleClearCanvas = () => {
    if (window.confirm('确定要清空画布吗？此操作无法撤销。')) {
      clearCanvas();
    }
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-800">AI上下文画布</h1>
        
        <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="rounded"
          />
          <span>显示网格</span>
        </label>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={autoLayout}
          disabled={!canExport}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          自动排版
        </button>
        
        <button
          onClick={onExportPDF}
          disabled={!canExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          导出PDF
        </button>
        
        <button
          onClick={onExportWord}
          disabled={!canExport}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          导出Word
        </button>
        
        <button
          onClick={onAISummarize}
          disabled={!canExport}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          AI提取总结
        </button>
        
        <button
          onClick={handleClearCanvas}
          disabled={!canExport}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          清空画布
        </button>
        
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          设置
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
