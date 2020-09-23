import { Context as SlackContext, SlackEvent } from "@slack/bolt";
import { ACTION_TYPES } from "../../constants";
import {
  GrantIntention,
  Intention,
  ListIntention,
  RemoveIntention,
  RevealIntention,
  UnearthIntention,
  WhoamiIntention,
  Listings,
  PromoteIntention,
  DemoteIntention,
  ForgeIntention,
} from "../../types";

interface IntentionRawData {
  context: SlackContext;
  event: SlackEvent;
}

/**
 * helpers
 *
 */
export function throwOnBadBadge(badge: string): void {
  // IMPROVE
  const isValid = badge[0] === ":" && badge.slice(-1) === ":";
  if (!isValid) throw new Error(`Invalid badge emoji submission: \`${badge}\``);
}

export function extractId(dirtyId: string): string {
  if (!dirtyId)
    throw new Error(`Cannot find expected user mention for current command.`);

  const userId = dirtyId.slice(2, -1);

  if (userId.match(/[A-Za-z0-9]{11}/) === null)
    throw new Error(`Paladin detected invalid user: ${dirtyId}`);
  return userId;
}

export function getTextParts({ event: { text } }: IntentionRawData): string[] {
  return text
    .split(" ")
    .map((chunk: string) => chunk.trim())
    .filter((chunk: string) => !!chunk);
}

export function getTextAction(data: IntentionRawData): ACTION_TYPES {
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

/**
 * factories
 *
 */
export function makeHelp(): Intention {
  return {
    action: ACTION_TYPES.help,
  };
}

export function makeList(data: IntentionRawData): ListIntention {
  const [, , resource] = getTextParts(data);
  const resourceOpts = Object.values(Listings);
  if (!resourceOpts.includes(resource as any)) {
    throw new Error(
      `Paladin only supports revealing: ${resourceOpts.join(", ")}`
    );
  }
  return {
    action: ACTION_TYPES.list,
    resource: resource as Listings,
  };
}

export function makeGrant(data: IntentionRawData): GrantIntention {
  const [, , domain, badgeName, dirtyTargetId] = getTextParts(data);
  return {
    action: ACTION_TYPES.grant,
    targetId: extractId(dirtyTargetId),
    badgeName,
    domain,
  };
}

export function makeRemove(data: IntentionRawData): RemoveIntention {
  const [, , domain, badgeName, dirtyTargetId] = getTextParts(data);
  return {
    action: ACTION_TYPES.remove,
    targetId: extractId(dirtyTargetId),
    badgeName,
    domain,
  };
}

// "bard" action
export function makeReveal(data: IntentionRawData): RevealIntention {
  const [, , dirtyTargetId] = getTextParts(data);
  return {
    action: ACTION_TYPES.reveal,
    targetId: extractId(dirtyTargetId),
  };
}

export function makeUnearth(data: IntentionRawData): UnearthIntention {
  const [, , domain] = getTextParts(data);
  return {
    action: ACTION_TYPES.unearth,
    domain,
  };
}

export function makeWhoami(): WhoamiIntention {
  return {
    action: ACTION_TYPES.whoami,
  };
}

export function makePromote(data: IntentionRawData): PromoteIntention {
  const [, , dirtyTargetId, domain] = getTextParts(data);
  return {
    action: ACTION_TYPES.promote,
    targetId: extractId(dirtyTargetId),
    domain,
  };
}

export function makeDemote(data: IntentionRawData): DemoteIntention {
  const [, , dirtyTargetId, domain] = getTextParts(data);
  return {
    action: ACTION_TYPES.demote,
    targetId: extractId(dirtyTargetId),
    domain,
  };
}

export function makeForge(data: IntentionRawData): ForgeIntention {
  const [, , domain, name, badge] = getTextParts(data);
  throwOnBadBadge(badge);
  return {
    action: ACTION_TYPES.forge,
    name,
    badge,
    domain,
  };
}

/**
 * root
 *
 */
export function createIntention(data: IntentionRawData): Intention {
  const action = getTextAction(data);

  switch (action) {
    case ACTION_TYPES.help:
      return makeHelp();

    case ACTION_TYPES.whoami:
      return makeWhoami();

    // bard action:
    case ACTION_TYPES.reveal:
      return makeReveal(data);

    // reveal badges|domains
    case ACTION_TYPES.list:
      return makeList(data);

    case ACTION_TYPES.unearth:
      return makeUnearth(data);

    case ACTION_TYPES.forge:
      return makeForge(data);

    case ACTION_TYPES.grant:
      return makeGrant(data);

    case ACTION_TYPES.remove:
      return makeRemove(data);

    case ACTION_TYPES.promote:
      return makePromote(data);

    case ACTION_TYPES.demote:
      return makeDemote(data);

    default:
      return {
        action: null,
      };
  }
}
