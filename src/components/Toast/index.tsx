import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  isVisible: boolean;
  onHide: () => void;
}

export function Toast({ message, duration = 10000, isVisible, onHide }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      return;
    }

    // 计算进度条更新间隔（每100ms更新一次）
    const interval = duration / 100;
    const progressStep = 100 / (duration / interval);

    const timer = setTimeout(() => {
      onHide();
    }, duration);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - progressStep;
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, interval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [isVisible, duration, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="relative animate-slide-up">
        {/* Toast 内容 */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl shadow-purple-500/30 min-w-[300px] max-w-md">
          {/* 图标 */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
          </div>

          {/* 消息文本 */}
          <p className="flex-1 text-sm font-semibold leading-tight">{message}</p>

          {/* 关闭按钮 */}
          <button
            onClick={onHide}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-white/80 transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
