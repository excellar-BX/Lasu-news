import { useState, useRef, useEffect, useCallback } from 'react';

const FAB_SIZE = 56;
const EDGE_PADDING = 20;
const DRAG_THRESHOLD = 5; // px moved before we consider it a drag

const WhatsAppFab = () => {
  const whatsappNumber = "2348130827166";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  // Track whether position has been initialized
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false); // distinguish tap vs drag
  const [isSnapping, setIsSnapping] = useState(false);
  const [side, setSide] = useState('right'); // 'left' | 'right'

  const fabRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });      // pointer at drag start
  const dragStartFab = useRef({ x: 0, y: 0 });      // fab position at drag start
  const movedDistance = useRef(0);                   // total px moved
  const animFrameRef = useRef(null);

  // ── Initialize position: right edge, 30% from bottom ──────────────
  useEffect(() => {
    const initX = window.innerWidth - FAB_SIZE - EDGE_PADDING;
    const initY = window.innerHeight - window.innerHeight * 0.30 - FAB_SIZE / 2;
    setPosition({ x: initX, y: initY });
    setSide('right');
    setMounted(true);
  }, []);

  // ── Clamp helper ───────────────────────────────────────────────────
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const clampPosition = useCallback((x, y) => ({
    x: clamp(x, EDGE_PADDING, window.innerWidth  - FAB_SIZE - EDGE_PADDING),
    y: clamp(y, EDGE_PADDING, window.innerHeight - FAB_SIZE - EDGE_PADDING),
  }), []);

  // ── Snap to nearest edge after drag ends ──────────────────────────
  const snapToEdge = useCallback((currentX, currentY) => {
    const midX = window.innerWidth / 2;
    const snappedX = currentX + FAB_SIZE / 2 < midX
      ? EDGE_PADDING
      : window.innerWidth - FAB_SIZE - EDGE_PADDING;

    const clampedY = clamp(
      currentY,
      EDGE_PADDING,
      window.innerHeight - FAB_SIZE - EDGE_PADDING
    );

    setSide(snappedX === EDGE_PADDING ? 'left' : 'right');
    setIsSnapping(true);
    setPosition({ x: snappedX, y: clampedY });
    setTimeout(() => setIsSnapping(false), 320);
  }, []);

  // ── Pointer move (rAF-throttled) ───────────────────────────────────
  const onPointerMove = useCallback((clientX, clientY) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;
      movedDistance.current = Math.sqrt(dx * dx + dy * dy);

      if (movedDistance.current > DRAG_THRESHOLD) {
        setHasDragged(true);
      }

      const raw = {
        x: dragStartFab.current.x + dx,
        y: dragStartFab.current.y + dy,
      };
      setPosition(clampPosition(raw.x, raw.y));
    });
  }, [clampPosition]);

  // ── Mouse handlers ─────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    // Only left button
    if (e.button !== 0) return;
    e.preventDefault();

    setIsDragging(true);
    setHasDragged(false);
    movedDistance.current = 0;

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartFab.current = { ...position };
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    onPointerMove(e.clientX, e.clientY);
  }, [isDragging, onPointerMove]);

  const handleMouseUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (hasDragged) {
      snapToEdge(position.x, position.y);
    }
  }, [isDragging, hasDragged, position, snapToEdge]);

  // ── Touch handlers ─────────────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    // Don't prevent default here globally — only track
    const touch = e.touches[0];

    setIsDragging(true);
    setHasDragged(false);
    movedDistance.current = 0;

    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    dragStartFab.current = { ...position };
  }, [position]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault(); // prevent page scroll while dragging fab
    const touch = e.touches[0];
    onPointerMove(touch.clientX, touch.clientY);
  }, [isDragging, onPointerMove]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (hasDragged) {
      snapToEdge(position.x, position.y);
    }
  }, [isDragging, hasDragged, position, snapToEdge]);

  // ── Global event listeners ─────────────────────────────────────────
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup',   handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend',  handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup',   handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend',  handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // ── Reposition on window resize ────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const snappedX = side === 'left'
          ? EDGE_PADDING
          : window.innerWidth - FAB_SIZE - EDGE_PADDING;
        return clampPosition(snappedX, prev.y);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [side, clampPosition]);

  // ── Click guard: block navigation if it was a drag ────────────────
  const handleClick = useCallback((e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [hasDragged]);

  // ── Tooltip side ──────────────────────────────────────────────────
  const tooltipClass = side === 'left'
    ? `absolute left-full ml-3 px-3 py-1.5 bg-white text-gray-800
       text-xs font-semibold rounded-xl shadow-lg border border-gray-100
       opacity-0 group-hover:opacity-100 transition-opacity duration-200
       whitespace-nowrap pointer-events-none top-1/2 -translate-y-1/2`
    : `absolute right-full mr-3 px-3 py-1.5 bg-white text-gray-800
       text-xs font-semibold rounded-xl shadow-lg border border-gray-100
       opacity-0 group-hover:opacity-100 transition-opacity duration-200
       whitespace-nowrap pointer-events-none top-1/2 -translate-y-1/2`;

  if (!mounted) return null;

  return (
    <a
      ref={fabRef}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      aria-label="Contact us on WhatsApp"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top:  `${position.y}px`,
        width:  `${FAB_SIZE}px`,
        height: `${FAB_SIZE}px`,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        // Smooth snap only; raw dragging has no transition
        transition: isDragging
          ? 'none'
          : isSnapping
            ? 'left 0.32s cubic-bezier(0.34,1.56,0.64,1), top 0.32s cubic-bezier(0.34,1.56,0.64,1), transform 0.2s ease, box-shadow 0.2s ease'
            : 'left 0.32s cubic-bezier(0.34,1.56,0.64,1), top 0.32s cubic-bezier(0.34,1.56,0.64,1), transform 0.2s ease, box-shadow 0.2s ease',
        transform: isDragging ? 'scale(1.12)' : 'scale(1)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
      className={`
        bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-full
        flex items-center justify-center group
        shadow-[0_4px_20px_rgba(37,211,102,0.45)]
        hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)]
        ${isDragging ? 'shadow-[0_8px_32px_rgba(37,211,102,0.6)]' : ''}
      `}
    >
      {/* Pulse ring — visible when idle */}
      {!isDragging && (
        <span
          className="absolute inset-0 rounded-full bg-[#25D366]
                     animate-ping opacity-20 pointer-events-none"
        />
      )}

      {/* WhatsApp icon */}
      <svg
        className="w-7 h-7 pointer-events-none relative z-10"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>

      {/* Tooltip */}
      <span className={tooltipClass} aria-hidden="true">
        Chat on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppFab;