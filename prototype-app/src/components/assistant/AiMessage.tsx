import { useEffect, useRef, useState } from 'react';
import { AiBadge } from '../AiBadge';
import type { AiScript, ScriptCtx } from '../../data/ai-scripts';

/**
 * AI response bubble: badge + staggered paragraphs (F2 live copy) + citation cards +
 * "Vì sao trả lời này?" disclosure (carries explainability/feedback story — F11, no
 * separate thumbs-up/down buttons). `revealed` lets historical turns render statically
 * (no re-animation) after the panel is closed and reopened (F4).
 */
export function AiMessage({
  script,
  ctx,
  revealed,
  onRevealed,
  onOpenCitation,
}: {
  script: AiScript;
  ctx: ScriptCtx;
  revealed: boolean;
  onRevealed: () => void;
  onOpenCitation: (href: string) => void;
}) {
  const paragraphs = script.paragraphs(ctx);
  const citations = script.citations?.(ctx) ?? [];
  const [visibleCount, setVisibleCount] = useState(revealed ? paragraphs.length : 0);
  const [reasonOpen, setReasonOpen] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (revealed) return;
    paragraphs.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setVisibleCount((count) => Math.max(count, index + 1));
        if (index === paragraphs.length - 1) onRevealed();
      }, 450 + index * 550);
      timers.current.push(timer);
    });
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // Runs once on mount per turn instance — cleanup guards StrictMode's double effect fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (visibleCount < paragraphs.length) {
      setVisibleCount(paragraphs.length);
      onRevealed();
    }
  };

  const allVisible = visibleCount >= paragraphs.length;

  return (
    <div className="ai-message" onClick={allVisible ? undefined : revealAll}>
      <AiBadge level={script.level} />
      <div className="ai-message-paragraphs">
        {paragraphs.slice(0, visibleCount).map((text, index) => (
          <p key={index} className="ai-message-line">{text}</p>
        ))}
      </div>
      {allVisible && citations.length > 0 && (
        <div className="ai-citation-list">
          {citations.map((citation) => (
            <button
              key={citation.href}
              type="button"
              className="ai-citation-card"
              onClick={() => onOpenCitation(citation.href)}
            >
              <span className="ai-citation-source">{citation.source}</span>
              <span className="ai-citation-title">{citation.title}</span>
            </button>
          ))}
        </div>
      )}
      {allVisible && (
        <button
          type="button"
          className="ai-reason-toggle"
          aria-expanded={reasonOpen}
          onClick={() => setReasonOpen((open) => !open)}
        >
          Vì sao trả lời này?
        </button>
      )}
      {allVisible && reasonOpen && <p className="ai-reason-body">{script.reason}</p>}
    </div>
  );
}
