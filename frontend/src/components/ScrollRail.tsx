import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

type Edges = { left: boolean; right: boolean; progress: number; thumb: number };

const empty: Edges = { left: false, right: false, progress: 0, thumb: 1 };

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    {dir === "left" ? (
      <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

export const ScrollRail = ({
  children,
  className = "",
  snap = false,
  watch,
}: {
  children: ReactNode;
  className?: string;
  snap?: boolean;
  watch?: string;
}) => {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, scroll: 0, moved: false, pointerId: -1 });
  const [edges, setEdges] = useState<Edges>(empty);

  const measure = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({
      left: el.scrollLeft > 6,
      right: max - el.scrollLeft > 6,
      progress: max <= 0 ? 0 : el.scrollLeft / max,
      thumb: el.scrollWidth <= 0 ? 1 : el.clientWidth / el.scrollWidth,
    });
  };

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scroller.current;
    const active = el?.querySelector<HTMLElement>("[data-active='true']");
    if (!el || !active) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2;
    el.scrollTo({ left: Math.min(Math.max(0, left), max), behavior: "smooth" });
  }, [watch]);

  const move = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.72), behavior: "smooth" });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target;
    const interactive = target instanceof Element && Boolean(target.closest("button, a, input, select, textarea"));
    if (event.pointerType === "mouse" && interactive) return;
    const el = scroller.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scroll: el.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || !drag.current.active || event.pointerId !== drag.current.pointerId) return;
    const deltaX = event.clientX - drag.current.startX;
    const deltaY = event.clientY - drag.current.startY;
    if (!drag.current.moved) {
      if (Math.abs(deltaX) < 12 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      drag.current.moved = true;
      el.setPointerCapture(event.pointerId);
    }
    el.scrollLeft = drag.current.scroll - deltaX;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== drag.current.pointerId) return;
    drag.current.active = false;
    if (!drag.current.moved) return;
    drag.current.moved = false;
    const blockClick = (click: Event) => {
      click.preventDefault();
      click.stopPropagation();
      window.removeEventListener("click", blockClick, true);
    };
    window.addEventListener("click", blockClick, true);
    window.setTimeout(() => window.removeEventListener("click", blockClick, true), 0);
  };

  const thumbWidth = Math.max(edges.thumb * 100, 14);
  const overflowing = edges.left || edges.right || edges.thumb < 0.98;

  return (
    <div>
      <div className={`relative ${overflowing ? "sm:px-14" : ""}`}>
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-paper to-transparent transition-opacity duration-300 sm:left-14 ${
            edges.left ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-paper to-transparent transition-opacity duration-300 sm:right-14 ${
            edges.right ? "opacity-100" : "opacity-0"
          }`}
        />
        <button
          type="button"
          aria-label="Anterior"
          disabled={!edges.left}
          onClick={() => move(-1)}
          className={`absolute top-1/2 left-0 z-20 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-ink shadow-sm transition duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:grid`}
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          disabled={!edges.right}
          onClick={() => move(1)}
          className={`absolute top-1/2 right-0 z-20 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-ink shadow-sm transition duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:grid`}
        >
          <Chevron dir="right" />
        </button>
        <div
          ref={scroller}
          onScroll={measure}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`rail flex touch-pan-y gap-3 overflow-x-auto select-none ${snap ? "rail-snap" : ""} ${overflowing ? "sm:cursor-grab sm:active:cursor-grabbing" : ""} ${className}`}
        >
          {children}
        </div>
      </div>
      {overflowing && (
        <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div
            className="absolute top-0 h-full rounded-full bg-accent"
            style={{ width: `${thumbWidth}%`, left: `${edges.progress * (100 - thumbWidth)}%` }}
          />
        </div>
      )}
    </div>
  );
};
