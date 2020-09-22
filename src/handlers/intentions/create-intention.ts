import { isActionType, ACTION_TYPES } from "../../constants";
import {
  CascadingData,
  GrantIntention,
  Intention,
  RemoveIntention,
} from "../../types";

/**
 * helpers
 *
 */
export function extractId(dirtyId: string): string {
  return dirtyId.slice(2, 13);
}

export function getTextParts({ event: { text } }: CascadingData): string[] {
  return text
    .split(" ")
    .map((chunk: string) => chunk.trim())
    .filter((chunk: string) => !!chunk);
}

export function getTextAction(data: CascadingData): ACTION_TYPES | null {
  const candidateAction = getTextParts(data)[1];
  if (!candidateAction) return null;
  if (!isActionType(candidateAction))
    throw new Error("Paladin detected invalid action");
  return candidateAction;
}

/**
 * factories
 *
 */
export function createHelpIntention(): Intention {
  return { action: ACTION_TYPES.help };
}

export function createGrantIntention(data: CascadingData): GrantIntention {
  const [, , dirtyTargetId, badge] = getTextParts(data);
  return {
    action: ACTION_TYPES.grant,
    targetId: extractId(dirtyTargetId),
    badge,
  };
}

export function createRemoveIntention(data: CascadingData): RemoveIntention {
  const [, , dirtyTargetId, badge] = getTextParts(data);
  return {
    action: ACTION_TYPES.remove,
    targetId: extractId(dirtyTargetId),
    badge,
  };
}

/**
 * root
 *
 */
export function createIntention(data: CascadingData): Intention {
  const action = getTextAction(data);

  switch (action) {
    case ACTION_TYPES.help:
      return createHelpIntention();
    case ACTION_TYPES.grant:
      return createGrantIntention(data);
    case ACTION_TYPES.remove:
      return createRemoveIntention(data);
    default:
      return createHelpIntention();
  }
}
