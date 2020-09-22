import { CascadingData, Intention } from "../../types";
// import { ACTION_TYPES } from "../../constants";
// import { areSameId } from "../../database/utils";

export async function actorIsAllowed(_: CascadingData, __: Intention) {
  return true;

  // switch (intention.action) {
  //   case ACTION_TYPES.help:
  //     return true;

  //   // a badge can be in multiple domains.
  //   // must have PALADIN in one of the badge's domains.
  //   // case ACTION_TYPES.grant:
  //   // case ACTION_TYPES.remove:
  //   //   const { domain }: BadgeDoc = await dbSingleton
  //   //     .collection("badges")
  //   //     .findOne({ emoji: intention.badge });
  //   //   return (
  //   //     actor.domains.filter(
  //   //       (actDom: DomainRole) =>
  //   //         areSameId(domain, id) &&
  //   //         (actDom.role === "admin" || actDom.role === "paladin")
  //   //     ).length > 0
  //   //   );

  //   // must be ADMIN in that domain.
  //   // case ACTION_TYPES.promote:
  //   // case ACTION_TYPES.demote:
  //   //   return !!actorDomains.find(
  //   //     (actDom: DomainRoles) => actDom.name === badgeOrDomain
  //   //   );

  //   default:
  //     throw new Error("Paladin failed to review permissions");
  // }
}
