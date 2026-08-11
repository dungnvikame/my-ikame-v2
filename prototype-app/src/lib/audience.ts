import type { User } from '../types';

/**
 * Demo-fidelity check proving the spec's permission-aware-by-construction pattern
 * (§17.7 / §15.4) renders correctly — NOT a real access-control boundary. The
 * underlying mock data is fully resident client-side in AppState regardless of what
 * this filter does; it never touches a server. Keep it simple, don't oversell it.
 */
export function isEligible(user: User, audienceTeamIds?: string[]): boolean {
  if (!audienceTeamIds || audienceTeamIds.length === 0) return true;
  return audienceTeamIds.includes(user.teamId);
}
