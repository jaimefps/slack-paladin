import { ACTION_TYPES } from "./constants";
import { db } from "./database";
import { CascadingData, DomainRoles } from "./types";

export function getPresentTime() {
  return new Date().toISOString();
}

export async function actorIsAllowed({ intention, actor }: CascadingData) {
  const { domains: actorDomains } = actor;
  const { action, badge: badgeOrDomain } = intention;
  let badgeDomains: any;

  switch (action) {
    case ACTION_TYPES.help:
      return true;

    // a badge can be in multiple domains.
    // must have PALADIN in one of the badge's domains.
    case ACTION_TYPES.grant:
    case ACTION_TYPES.remove:
      ({ domains: badgeDomains } = await db.findBadgeData(badgeOrDomain));
      return (
        actorDomains.filter(
          (actDom: DomainRoles) =>
            badgeDomains.includes(actDom.name) &&
            (actDom.role === "admin" || actDom.role === "paladin")
        ).length > 0
      );

    // must be ADMIN in that domain.
    case ACTION_TYPES.promote:
    case ACTION_TYPES.exile:
      return !!actorDomains.find(
        (actDom: DomainRoles) => actDom.name === badgeOrDomain
      );

    default:
      return true;
  }
}

// <@botname> <action> <@targetUser> <badge|domain>
export function getIntention({ event: { text } }: CascadingData) {
  // IMPORTANT: badge = badge|domain. // TODO refactor-rename
  // IMPORTANT: userId = user being targeted by action.
  const [, action, user, badge] = text
    .split(" ")
    .map((chunk: string) => chunk.trim())
    .filter((chunk: string) => !!chunk);

  return !action
    ? {
        action: ACTION_TYPES.help,
        userId: null,
        badge: null,
      }
    : {
        action,
        userId: user ? user.slice(2, user.length - 1) : null,
        badge,
      };
}
