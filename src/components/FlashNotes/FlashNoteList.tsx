import { FlashNote } from '../../types';
import { useFlashNoteStore } from '../../store/flashNoteStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface FlashNoteListProps {
  onConvertToTask?: (note: FlashNote) => void;
}

export function FlashNoteList({ onConvertToTask }: FlashNoteListProps) {
  const { notes, selectedNoteId, setSelectedNoteId, deleteNote, togglePin } = useFlashNoteStore();

  // 排序：置顶的在前，然后按更新时间倒序
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条想法吗？')) {
      deleteNote(id);
    }
  };

  const truncateContent = (content: string, maxLength = 80) => {
    // 简单的富文本截取，移除 HTML 标签
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full">
      {/* 列表标题 */}
      <div className="px-4 py-3 border-b border-black/5 bg-white/40">
        <h2 className="text-sm font-semibold text-gray-700">想法列表 ({sortedNotes.length})</h2>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
              <span className="text-3xl">💡</span>
            </div>
            <p className="text-sm font-medium text-gray-500">还没有想法</p>
            <p className="text-xs mt-2 text-gray-400">点击右侧编辑器开始记录</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all ${
                  selectedNoteId === note.id
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 shadow-md'
                    : 'bg-white/60 border border-black/5 hover:bg-white/80 hover:border-black/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* 内容预览 */}
                    <p className="text-xs text-gray-600 line-clamp-3 mb-2">
                      {truncateContent(note.content)}
                    </p>

                    {/* 元信息 */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {note.isPinned && (
                        <span className="text-purple-500" title="已置顶">
                          📌
                        </span>
                      )}
                      <span>
                        {format(new Date(note.updatedAt), 'MM/dd HH:mm', { locale: zhCN })}
                      </span>
                      {note.tags && note.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <div className="flex items-center gap-1">
                            {note.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {note.tags.length > 2 && (
                              <span className="text-gray-400">+{note.tags.length - 2}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onConvertToTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onConvertToTask(note);
                        }}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-gray-400 hover:text-blue-500"
                        title="转为任务"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note.id);
                      }}
                      className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors text-gray-400 hover:text-purple-500"
                      title={note.isPinned ? '取消置顶' : '置顶'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDelete(note.id, e)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
