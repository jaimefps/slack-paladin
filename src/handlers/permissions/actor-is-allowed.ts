import {
  CascadingData,
  DomainDoc,
  DomainRole,
  Intention,
  UserRole,
} from "../../types";
import { ACTION_TYPES, DB_COLLECTIONS } from "../../constants";
import { areSameId } from "../../database/utils";

export async function actorIsAllowed(
  { dbSingleton, event: { team }, actor }: CascadingData,
  intention: Intention
): Promise<boolean> {
  switch (intention.action) {
    case null:
    case ACTION_TYPES.help:
      return true;

    // must have PALADIN level permission
    // in the badge's domain.
    case ACTION_TYPES.grant:
    case ACTION_TYPES.remove:
      // cannot grant/remove badges to/form yourself:
      if (intention.targetId === actor.slackUser) {
        return false;
      }

      try {
        const domainDoc: DomainDoc = await dbSingleton
          .collection(DB_COLLECTIONS.domains)
          .findOne({ name: intention.domain, slackTeam: team });
        const userDomain: DomainRole = actor.domains.find((d) =>
          areSameId(domainDoc._id, d.id)
        );
        return userDomain
          ? userDomain.role === UserRole.paladin ||
              userDomain.role === UserRole.admin
          : false;
      } catch (e) {
        console.log(e);
        throw new Error(`Failed to lookup domain ${intention.domain}`);
      }

    // // must be ADMIN in that domain.
    // case ACTION_TYPES.promote:
    // case ACTION_TYPES.demote:
    // console.log(
    //   "intention.targetId === actor.slackUser",
    //   intention.targetId,
    //   actor.slackUser
    // );
    // if (intention.targetId === actor.slackUser) {
    //   return `You cannot promote or demote yourself.`;
    // }
    //   const domain = "test";
    //   return !!actorDomains.find(
    //     (actDom: DomainRoles) => actDom.name === badgeOrDomain
    //   );

    default:
      throw new Error(
        `Paladin failed confirm permission to ${intention.action}`
      );
  }
}
