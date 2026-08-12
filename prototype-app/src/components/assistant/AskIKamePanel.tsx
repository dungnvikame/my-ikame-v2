import { useAppState } from '../../AppState';

/**
 * Phase 1 stub — Phase 2 (Ask iKame scripted engine) owns and fills this file.
 * Contract: renders null unless `askOpen`; closes via `setAskOpen(false)`.
 */
export function AskIKamePanel() {
  const { askOpen, setAskOpen } = useAppState();
  if (!askOpen) return null;
  return (
    <div className="drawer-layer" role="presentation" onMouseDown={() => setAskOpen(false)}>
      <aside
        className="ask-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Hỏi iKame"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2>Hỏi iKame</h2>
        <p>Trợ lý AI (concept) — đang được xây dựng.</p>
      </aside>
    </div>
  );
}
