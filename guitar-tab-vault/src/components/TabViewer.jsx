import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

export default function TabViewer({ tab, onBack, onEdit }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(3);
  const contentRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const accumulatedRef = useRef(0);

  const scroll = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    accumulatedRef.current += (delta / 1000) * speed * 20;

    if (accumulatedRef.current >= 1) {
      const pixels = Math.floor(accumulatedRef.current);
      accumulatedRef.current -= pixels;
      if (contentRef.current) {
        contentRef.current.scrollTop += pixels;
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          setIsScrolling(false);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scroll);
  }, [speed]);

  useEffect(() => {
    if (isScrolling) {
      lastTimeRef.current = null;
      accumulatedRef.current = 0;
      animFrameRef.current = requestAnimationFrame(scroll);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isScrolling, scroll]);

  // Reset scroll position when tab changes
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setIsScrolling(false);
  }, [tab.id]);

  const scrollManual = (dir) => {
    if (contentRef.current) contentRef.current.scrollTop += dir * 120;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 shrink-0">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-base leading-tight truncate">{tab.title}</h2>
          <p className="text-gray-500 text-xs truncate">{tab.artist}</p>
        </div>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          title="Edit"
        >
          <Edit2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-4">
        <pre className="text-green-300 font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto">
          {tab.content || 'No content'}
        </pre>
      </div>

      {/* Auto-scroll control bar */}
      <div className="shrink-0 border-t border-gray-800 bg-gray-900/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Scroll up/down nudge */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => scrollManual(-1)}
              className="text-gray-500 hover:text-white p-0.5 rounded transition-colors"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => scrollManual(1)}
              className="text-gray-500 hover:text-white p-0.5 rounded transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsScrolling((s) => !s)}
            className={`flex items-center justify-center w-10 h-10 rounded-full font-medium transition-all shrink-0 ${
              isScrolling
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {isScrolling ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Speed slider */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-gray-600 text-xs w-5 text-right">1</span>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none bg-gray-700 accent-purple-500 cursor-pointer"
            />
            <span className="text-gray-600 text-xs w-5">10</span>
          </div>

          <div className="text-purple-400 text-xs font-mono w-8 text-center shrink-0">
            {speed.toFixed(1)}x
          </div>
        </div>
      </div>
    </div>
  );
}
