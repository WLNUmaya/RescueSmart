import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Play, Pause, ChevronLeft, ChevronRight, Move } from "lucide-react";
import dict from "../dictionary.json";

/**
 * SignOverlayPlayer
 * - Clickable text integration: pass `text` or prebuilt `sequenceIds`
 * - Sequences assets (png/gif/webm/mp4). For mp4/webm, it uses <video>.
 * - For images, it uses <img>.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - text?: string (optional) - will be matched to dictionary keywords
 * - sequenceIds?: string[] (optional) - explicit sign ids override text matching
 * - title?: string
 */
const cn = (...xs) => xs.filter(Boolean).join(" ");

function normalize(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function matchTextToIds(text) {
  const t = normalize(text);
  if (!t) return [];
  const hits = [];
  for (const e of dict.entries) {
    for (const kw of e.keywords || []) {
      const k = normalize(kw);
      if (k && (t.includes(k) || t === k)) {
        hits.push(e.id);
        break;
      }
    }
  }
  // de-dupe while preserving order
  return [...new Set(hits)];
}

function getEntry(id) {
  return dict.entries.find((e) => e.id === id) || null;
}

function isVideo(assetPath) {
  const a = String(assetPath || "").toLowerCase();
  return a.endsWith(".mp4") || a.endsWith(".webm") || a.endsWith(".ogg");
}

export default function SignOverlayPlayer({
  open,
  onClose,
  text,
  sequenceIds,
  title = "Sign Language",
}) {
  const computedIds = useMemo(() => {
    if (Array.isArray(sequenceIds) && sequenceIds.length) return sequenceIds;
    return matchTextToIds(text);
  }, [sequenceIds, text]);

  const sequence = useMemo(() => computedIds.map(getEntry).filter(Boolean), [computedIds]);

  const [idx, setIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // draggable
  const boxRef = useRef(null);
  const dragRef = useRef({ on: false, dx: 0, dy: 0 });

  useEffect(() => {
    if (!open) return;
    setIdx(0);
  }, [open, text]);

  const current = sequence[idx] || null;

  // auto-advance for images (simple timer) + for videos use "ended" event
  useEffect(() => {
    if (!open || !autoplay) return;
    if (!current) return;

    const el = boxRef.current;
    if (!el) return;

    // If image: advance after 1.4s
    if (!isVideo(current.asset)) {
      const t = setTimeout(() => {
        setIdx((i) => (i + 1 < sequence.length ? i + 1 : i));
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [open, autoplay, current, sequence.length]);

  const onVideoEnded = () => {
    if (!autoplay) return;
    setIdx((i) => (i + 1 < sequence.length ? i + 1 : i));
  };

  const canPrev = idx > 0;
  const canNext = idx + 1 < sequence.length;

  const assetUrl = current ? new URL(`../assets/signs/${current.asset}`, import.meta.url).toString() : "";

  const beginDrag = (e) => {
    const box = boxRef.current;
    if (!box) return;
    dragRef.current.on = true;

    const rect = box.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragRef.current.dx = clientX - rect.left;
    dragRef.current.dy = clientY - rect.top;
  };

  const moveDrag = (e) => {
    if (!dragRef.current.on) return;
    const box = boxRef.current;
    if (!box) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, clientX - dragRef.current.dx));
    const y = Math.max(8, Math.min(window.innerHeight - box.offsetHeight - 8, clientY - dragRef.current.dy));

    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
  };

  const endDrag = () => {
    dragRef.current.on = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", moveDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", moveDrag);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", moveDrag);
      window.removeEventListener("touchend", endDrag);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating draggable box */}
      <div
        ref={boxRef}
        className="absolute left-4 top-4 w-[92vw] max-w-md rounded-3xl border border-[#E8DCC4]/70 bg-white/95 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E8DCC4]/70 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-2xl border border-[#E8DCC4] bg-[#F5EFE6] active:scale-[0.99]"
              onMouseDown={beginDrag}
              onTouchStart={beginDrag}
              title="Move"
              aria-label="Move"
            >
              <Move size={16} />
            </button>
            <div>
              <div className="font-black text-[#2D3B2D] leading-tight">{title}</div>
              <div className="text-xs text-[#2D3B2D]/60">
                {sequence.length ? `Sign ${idx + 1}/${sequence.length}` : "No signs found"}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="p-2 rounded-2xl border border-[#E8DCC4] hover:bg-[#F5EFE6]"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {!sequence.length ? (
            <div className="rounded-2xl border border-[#E8DCC4] bg-[#F5EFE6]/60 p-4 text-sm font-semibold text-[#2D3B2D]/80">
              Couldn’t match any signs for this text.
              <div className="mt-2 text-xs">
                Tip: add keywords inside <code>dictionary.json</code>.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E8DCC4] bg-[#F5EFE6]/30 overflow-hidden">
              {current && isVideo(current.asset) ? (
                <video
                  key={current.asset}
                  src={assetUrl}
                  className="w-full aspect-square object-cover"
                  controls={!autoplay}
                  autoPlay={autoplay}
                  onEnded={onVideoEnded}
                />
              ) : (
                <img
                  key={current?.asset}
                  src={assetUrl}
                  alt={current?.label || "sign"}
                  className="w-full aspect-square object-cover"
                />
              )}
            </div>
          )}

          {/* Label */}
          {current ? (
            <div className="mt-3 text-sm font-black text-[#2D3B2D]">
              {current.label}
            </div>
          ) : null}

          {/* Controls */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl border font-black flex items-center justify-center gap-2",
                canPrev ? "border-[#E8DCC4] bg-white hover:bg-[#F5EFE6]" : "border-[#E8DCC4] bg-white/60 text-[#2D3B2D]/40 cursor-not-allowed"
              )}
            >
              <ChevronLeft size={18} />
              Prev
            </button>

            <button
              type="button"
              onClick={() => setAutoplay((v) => !v)}
              disabled={!sequence.length}
              className={cn(
                "px-4 py-3 rounded-2xl border font-black flex items-center justify-center gap-2",
                sequence.length ? "border-[#9CAF88] bg-[#9CAF88] text-white hover:bg-[#7A9A6D]" : "border-[#E8DCC4] bg-white/60 text-[#2D3B2D]/40 cursor-not-allowed"
              )}
              title="Autoplay"
            >
              {autoplay ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(sequence.length - 1, i + 1))}
              disabled={!canNext}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl border font-black flex items-center justify-center gap-2",
                canNext ? "border-[#E8DCC4] bg-white hover:bg-[#F5EFE6]" : "border-[#E8DCC4] bg-white/60 text-[#2D3B2D]/40 cursor-not-allowed"
              )}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Source text (optional) */}
          {text ? (
            <div className="mt-4 text-xs text-[#2D3B2D]/60">
              <div className="font-black mb-1">Text</div>
              <div className="rounded-2xl border border-[#E8DCC4] bg-white/70 p-3 whitespace-pre-wrap">
                {text}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
