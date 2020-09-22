import { BadgeDoc, CascadingData, DomainRole, Intention } from "../../types";
import { ACTION_TYPES } from "../../constants";
import { areSameId } from "src/database/utils";

export async function actorIsAllowed(
  { actor, dbSingleton }: CascadingData,
  intention: Intention
) {
  switch (intention.action) {
    case ACTION_TYPES.help:
      return true;

    // a badge can be in multiple domains.
    // must have PALADIN in one of the badge's domains.
    case ACTION_TYPES.grant:
    case ACTION_TYPES.remove:
      const { domains: badgeDomains }: BadgeDoc = await dbSingleton
        .collection("badges")
        .findOne({ emoji: intention.badge });
      return (
        actor.domains.filter(
          (actDom: DomainRole) =>
            badgeDomains.find((id) => areSameId(actDom.id, id)) &&
            (actDom.role === "admin" || actDom.role === "paladin")
        ).length > 0
      );

    // must be ADMIN in that domain.
    // case ACTION_TYPES.promote:
    // case ACTION_TYPES.demote:
    //   return !!actorDomains.find(
    //     (actDom: DomainRoles) => actDom.name === badgeOrDomain
    //   );

    default:
      throw new Error("Paladin failed to review permissions");
  }
}
