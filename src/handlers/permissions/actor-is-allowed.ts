import { ACTION_TYPES, DB_COLLECTIONS } from "../../constants";
import { areSameId } from "../../database/utils";
import {
  CascadingData,
  DomainDoc,
  DomainRole,
  Intention,
  UserRole,
} from "../../types";

export async function actorHasMinLevel(
  data: CascadingData,
  domainName: string,
  requiredLevel: UserRole
): Promise<boolean> {
  const {
    dbSingleton,
    event: { team },
    actor,
  } = data;

  const LEVELS = Object.values(UserRole);
  let userDomain: DomainRole;

  try {
    const domainDoc: DomainDoc = await dbSingleton
      .collection(DB_COLLECTIONS.domains)
      .findOne({ name: domainName, slackTeam: team });
    userDomain = actor.domains.find((d) => areSameId(domainDoc._id, d.id));
  } catch (e) {
    console.log(e);
    throw new Error(`Failed to lookup actor roles for \`${domainName}\`.`);
  }

  return userDomain
    ? LEVELS.indexOf(userDomain.role) <= LEVELS.indexOf(requiredLevel)
    : false;
}

export async function actorIsAllowed(
  data: CascadingData,
  intention: Intention
): Promise<boolean> {
  switch (intention.action) {
    // PALADIN LEVEL:
    case ACTION_TYPES.grant:
    case ACTION_TYPES.remove:
      // cannot target self:
      if (intention.targetId === data.actor.slackUser) return false;
      return await actorHasMinLevel(data, intention.domain, UserRole.paladin);

    // ADMIN LEVEL:
    case ACTION_TYPES.promote:
    case ACTION_TYPES.demote:
    case ACTION_TYPES.unearth:
    case ACTION_TYPES.forge:
      return await actorHasMinLevel(data, intention.domain, UserRole.admin);

    // non-protected actions:
    default:
      return true;
  }
}
