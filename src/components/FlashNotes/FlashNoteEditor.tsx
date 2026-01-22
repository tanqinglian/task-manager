import { useState, useEffect } from 'react';
import { FlashNote } from '../../types';
import { useFlashNoteStore } from '../../store/flashNoteStore';
import { TiptapEditor } from '../TaskEditor/TiptapEditor';

interface FlashNoteEditorProps {
  note?: FlashNote;
  onClose?: () => void;
  onConvertToTask?: (content: string, tags?: string[]) => void;
  onNoteSaved?: (message: string) => void;
}

export function FlashNoteEditor({ note, onClose, onConvertToTask, onNoteSaved }: FlashNoteEditorProps) {
  const { addNote, updateNote } = useFlashNoteStore();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTags(note.tags || []);
    } else {
      setContent('');
      setTags([]);
    }
  }, [note]);

  const handleSave = () => {
    if (!content.trim()) return;

    if (note) {
      updateNote({
        id: note.id,
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      });
    } else {
      addNote({
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      });

      // 新增想法时显示 toast
      if (onNoteSaved) {
        onNoteSaved('蒸蚌，你又有一个新想法诞生啦！！！');
      }
    }

    if (onClose) {
      onClose();
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleConvertToTask = () => {
    if (!content.trim() || !onConvertToTask) return;

    // 提取纯文本作为任务标题（取第一行或前50个字符）
   // const textContent = content.replace(/<[^>]*>/g, '').trim();
   //  const title = textContent.split('\n')[0].substring(0, 50);

    onConvertToTask(content, tags.length > 0 ? tags : undefined);

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 bg-white/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white text-sm">💡</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {note ? '编辑想法' : '新想法'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-600"
            title="标签"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 标签输入 */}
      {showTagInput && (
        <div className="px-4 py-3 border-b border-black/5 bg-purple-50/50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="添加标签..."
              className="flex-1 px-3 py-2 bg-white border border-black/8 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-xs"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all text-xs shadow-lg"
            >
              添加
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-purple-200 rounded p-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 编辑器 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="h-full">
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-black/5 bg-white/40">
        <div className="text-xs text-gray-400">
          {content.length > 0 ? `${content.length} 字` : '开始记录...'}
        </div>
        <div className="flex items-center gap-2">
          {/* 转为任务按钮 */}
          {content.trim() && onConvertToTask && (
            <button
              onClick={handleConvertToTask}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all text-xs shadow-lg shadow-blue-500/25"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              转为任务
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {note ? '保存' : '保存想法'}
          </button>
        </div>
      </div>
    </div>
  );
}
