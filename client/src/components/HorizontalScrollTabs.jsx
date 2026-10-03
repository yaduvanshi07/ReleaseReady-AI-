import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * HorizontalScrollTabs
 * Displays tabs in a single horizontal row with smooth automatic scrolling,
 * manual left/right navigation controls, pause-on-hover/touch,
 * and responsive touch-first scrolling on mobile.
 */
export function HorizontalScrollTabs({
  tabs = [],
  activeTab,
  onSelectTab,
  autoScrollSpeed = 0.5, // pixels per frame
  className = ''
}) {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollDirectionRef = useRef(1); // 1 = forward (rightward), -1 = backward (leftward)
  const isInteractingRef = useRef(false);

  // Update scroll boundary flags
  const checkScrollBoundaries = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  // Smooth continuous auto-scroll effect
  useEffect(() => {
    let animationFrameId;
    const el = containerRef.current;
    if (!el) return;

    const step = () => {
      if (!isPaused && !isInteractingRef.current && el) {
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxScroll = scrollWidth - clientWidth;

        if (maxScroll > 10) {
          // Smooth bounce/loop when reaching the ends
          if (scrollLeft >= maxScroll - 1) {
            scrollDirectionRef.current = -1;
          } else if (scrollLeft <= 1) {
            scrollDirectionRef.current = 1;
          }

          el.scrollLeft += autoScrollSpeed * scrollDirectionRef.current;
          checkScrollBoundaries();
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, autoScrollSpeed, checkScrollBoundaries]);

  // Scroll manually via buttons
  const handleManualScroll = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(180, el.clientWidth * 0.45);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScrollBoundaries, 300);
  };

  useEffect(() => {
    checkScrollBoundaries();
    window.addEventListener('resize', checkScrollBoundaries);
    return () => window.removeEventListener('resize', checkScrollBoundaries);
  }, [tabs, checkScrollBoundaries]);

  return (
    <div
      className={`relative group/tabs flex items-center w-full ${className}`}
      onMouseEnter={() => {
        setIsPaused(true);
        isInteractingRef.current = true;
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        isInteractingRef.current = false;
      }}
      onTouchStart={() => {
        setIsPaused(true);
        isInteractingRef.current = true;
      }}
      onTouchEnd={() => {
        setIsPaused(false);
        isInteractingRef.current = false;
      }}
    >
      {/* Left Navigation Button (Hidden on small screens where touch scrolling is natural) */}
      <button
        type="button"
        aria-label="Scroll tabs left"
        onClick={() => handleManualScroll('left')}
        disabled={!canScrollLeft}
        className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-surface-border bg-white/95 backdrop-blur shadow-sm text-ink-secondary hover:text-saffron-600 hover:border-saffron-300 hover:shadow-md transition-all shrink-0 z-10 mr-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Horizontal Scroll Container */}
      <div
        ref={containerRef}
        onScroll={checkScrollBoundaries}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1.5 px-0.5 no-scrollbar flex-nowrap w-full"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`tab-pill-btn group/btn flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border whitespace-nowrap cursor-pointer shrink-0 transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-saffron-500 to-amber-500 text-white border-saffron-600 shadow-md shadow-saffron-500/25 font-semibold -translate-y-0.5'
                  : 'bg-white text-ink-secondary border-surface-border hover:border-saffron-300 hover:text-ink-primary hover:bg-saffron-50/50 shadow-xs hover:shadow-sm'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover/btn:text-saffron-600'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white border border-white/30'
                      : (tab.badgeColor || 'bg-slate-100 text-slate-700')
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Navigation Button (Hidden on small screens) */}
      <button
        type="button"
        aria-label="Scroll tabs right"
        onClick={() => handleManualScroll('right')}
        disabled={!canScrollRight}
        className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-surface-border bg-white/95 backdrop-blur shadow-sm text-ink-secondary hover:text-saffron-600 hover:border-saffron-300 hover:shadow-md transition-all shrink-0 z-10 ml-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
