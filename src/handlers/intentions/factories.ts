import { ACTION_TYPES } from "../../constants";
import { throwOnBadBadge, extractId, getTextParts } from "./helpers";
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
  CascadingRoot,
} from "../../types";

export function makeHelp(): Intention {
  return {
    action: ACTION_TYPES.help,
  };
}

export function makeList(data: CascadingRoot): ListIntention {
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

export function makeGrant(data: CascadingRoot): GrantIntention {
  const [, , domain, badgeName, dirtyTargetId] = getTextParts(data);
  return {
    action: ACTION_TYPES.grant,
    targetId: extractId(dirtyTargetId),
    badgeName,
    domain,
  };
}

export function makeRemove(data: CascadingRoot): RemoveIntention {
  const [, , domain, badgeName, dirtyTargetId] = getTextParts(data);
  return {
    action: ACTION_TYPES.remove,
    targetId: extractId(dirtyTargetId),
    badgeName,
    domain,
  };
}

// "bard" action
export function makeReveal(data: CascadingRoot): RevealIntention {
  const [, , dirtyTargetId] = getTextParts(data);
  return {
    action: ACTION_TYPES.reveal,
    targetId: extractId(dirtyTargetId),
  };
}

export function makeUnearth(data: CascadingRoot): UnearthIntention {
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

export function makePromote(data: CascadingRoot): PromoteIntention {
  const [, , dirtyTargetId, domain] = getTextParts(data);
  return {
    action: ACTION_TYPES.promote,
    targetId: extractId(dirtyTargetId),
    domain,
  };
}

export function makeDemote(data: CascadingRoot): DemoteIntention {
  const [, , dirtyTargetId, domain] = getTextParts(data);
  return {
    action: ACTION_TYPES.demote,
    targetId: extractId(dirtyTargetId),
    domain,
  };
}

export function makeForge(data: CascadingRoot): ForgeIntention {
  const [, , domain, name, badge] = getTextParts(data);
  throwOnBadBadge(badge);
  return {
    action: ACTION_TYPES.forge,
    name,
    badge,
    domain,
  };
}
