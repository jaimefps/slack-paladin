import { ACTION_TYPES } from "../../constants";
import { CascadingRoot } from "../../types";

export function throwOnBadBadge(badge: string): void {
  // IMPROVE
  const isValid = badge[0] === ":" && badge.slice(-1) === ":";
  if (!isValid) throw new Error(`Invalid badge emoji submission: \`${badge}\``);
}

export function extractId(dirtyId: string): string {
  if (!dirtyId)
    throw new Error(`Cannot find expected user mention for current command.`);

  const userId = dirtyId.slice(2, -1);
  // IMPROVE
  if (userId.match(/[A-Za-z0-9]/) === null)
    throw new Error(`Paladin detected invalid user: ${dirtyId}`);
  return userId;
}

export function getTextParts({ event: { text } }: CascadingRoot): string[] {
  return text
    .split(" ")
    .map((chunk: string) => chunk.trim())
    .filter((chunk: string) => !!chunk);
}

export function getTextAction(data: CascadingRoot): ACTION_TYPES {
  // IMPROVE
  const candidateAction = getTextParts(data)[1] as any;
  if (
    !candidateAction ||
    !Object.values(ACTION_TYPES).includes(candidateAction)
  ) {
    return null;
  }
  return candidateAction as ACTION_TYPES;
}
