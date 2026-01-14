import { useTaskStore } from "../../store/taskStore";
import { DIMENSIONS } from "../../constants";

export function DimensionSidebar() {
  const { selectedDimension, setSelectedDimension, getTasksByDimension } = useTaskStore();

  return (
    <div className="w-52 backdrop-blur-xl bg-white/60 border border-black/5 rounded-xl shadow flex flex-col overflow-hidden">
      {/* 侧边栏标题 */}
      <div className="px-3 py-2 border-b border-black/5">
        <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          任务维度
        </h2>
      </div>

      {/* 维度列表 */}
      <nav className="flex-1 min-h-0 py-1 overflow-y-auto">
        {DIMENSIONS.map((dimension) => {
          const isActive = selectedDimension === dimension.key;
          const taskCount = getTasksByDimension(dimension.key).length;

          return (
            <button
              key={dimension.key}
              onClick={() => setSelectedDimension(dimension.key)}
              className={`
                w-full flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg
                transition-all duration-200 group
                ${isActive
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow shadow-blue-500/25"
                  : "text-gray-700 hover:bg-white/50"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className={`text-base ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                  {dimension.icon}
                </span>
                <span className="text-xs font-semibold">{dimension.label}</span>
              </div>
              <span
                className={`
                  text-[10px] font-semibold px-2 py-0.5 rounded
                  ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100/50 text-gray-500 group-hover:bg-gray-200/50"
                  }
                `}
              >
                {taskCount}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 底部信息区域 */}
      <div className="p-3 border-t border-black/5 bg-gradient-to-t from-black/[0.02] to-transparent">
        <div className="text-[10px] text-gray-400">
          <p className="font-medium text-gray-500 mb-0.5">任务管理器</p>
          <p>选择维度查看任务</p>
        </div>
      </div>
    </div>
  );
}
