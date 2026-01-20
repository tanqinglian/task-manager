import { FlashNote } from '../../types';
import { useFlashNoteStore } from '../../store/flashNoteStore';
import { FlashNoteList } from './FlashNoteList';
import { FlashNoteEditor } from './FlashNoteEditor';

interface FlashNotePanelProps {
  onClose?: () => void;
  onConvertToTask?: (content: string, tags?: string[]) => void;
  onNoteSaved?: (message: string) => void;
}

export function FlashNotePanel({ onClose, onConvertToTask, onNoteSaved }: FlashNotePanelProps) {
  const { selectedNoteId, setSelectedNoteId, getSelectedNote } = useFlashNoteStore();
  const selectedNote = getSelectedNote();

  // 创建新笔记
  const handleNewNote = () => {
    setSelectedNoteId(null);
  };

  // 从列表转化为任务
  const handleConvertNoteToTask = (note: FlashNote) => {
    if (onConvertToTask) {
      onConvertToTask(note.content, note.tags);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl w-full max-w-5xl h-[80vh] flex rounded-3xl overflow-hidden">
        {/* 左侧：笔记列表 */}
        <div className="w-80 border-r border-black/5 flex flex-col bg-gradient-to-br from-purple-50/30 to-pink-50/30">
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white text-sm">💡</span>
              </div>
              <span className="text-sm font-bold text-gray-900">灵光一闪</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3 border-b border-black/5 bg-white/40">
            <button
              onClick={handleNewNote}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all text-xs shadow-lg shadow-purple-500/25"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新想法
            </button>
          </div>

          <FlashNoteList onConvertToTask={handleConvertNoteToTask} />
        </div>

        {/* 右侧：编辑器 */}
        <div className="flex-1 flex flex-col">
          {selectedNote || selectedNoteId === null ? (
            <FlashNoteEditor
              note={selectedNote || undefined}
              onConvertToTask={onConvertToTask}
              onNoteSaved={onNoteSaved}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center mx-auto">
                  <span className="text-3xl">💡</span>
                </div>
                <p className="text-sm font-medium text-gray-500">选择一条想法</p>
                <p className="text-xs mt-2 text-gray-400">或创建新想法</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
