import { matchPath } from 'react-router-dom';
import type { Perspective } from '../types';
import type { AiScript } from './ai-scripts-types';
import { V1_SCRIPTS } from './ai-scripts-v1';
import { V2_SCRIPTS } from './ai-scripts-v2';

// Re-export the shared type contract so every downstream import path
// (`from '../data/ai-scripts'`) stays stable across all phases.
export type { AiScript, AiScriptAction, Citation, ScriptCtx } from './ai-scripts-types';

const ALL_SCRIPTS: AiScript[] = [...V1_SCRIPTS, ...V2_SCRIPTS];

function matchesRoute(script: AiScript, pathname: string): boolean {
  return script.routes.some((pattern) => pattern !== '*' && matchPath(pattern, pathname) !== null);
}

/**
 * (F7) Route/perspective-filtered suggested chips. '*' fallback scripts are appended
 * ONLY when no route-specific chip matched the current pathname.
 */
export function scriptsForContext(pathname: string, perspective: Perspective): AiScript[] {
  const eligible = ALL_SCRIPTS.filter((script) => !script.perspective || script.perspective === perspective);
  const specific = eligible.filter((script) => matchesRoute(script, pathname));
  if (specific.length > 0) return specific;
  return eligible.filter((script) => script.routes.includes('*'));
}

/** Resolves the `:postId` route param for S1's live-article lookup. */
export function matchNewsPostId(pathname: string): string | null {
  return matchPath('/news/:postId', pathname)?.params.postId ?? null;
}
