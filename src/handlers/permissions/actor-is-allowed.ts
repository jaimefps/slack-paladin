import { ACTION_TYPES, DB_COLLECTIONS } from "../../constants";
import { areSameId } from "../../database/utils";
import {
  CascadingData,
  DomainDoc,
  DomainRole,
  Intention,
  UserRole,
} from "../../types";

export async function actorHasMinDomainLevel(
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
  let domainDoc: DomainDoc;

  try {
    domainDoc = await dbSingleton
      .collection(DB_COLLECTIONS.domains)
      .findOne({ name: domainName, slackTeam: team });
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to lookup actor roles for \`${domainName}\`.`);
  }

  if (!domainDoc) {
    throw new Error(`Invalid domain provided \`${domainName}\``);
  }

  const userDomain: DomainRole = actor.domains.find((d) =>
    areSameId(domainDoc._id, d.id)
  );

  return userDomain
    ? LEVELS.indexOf(userDomain.role) <= LEVELS.indexOf(requiredLevel)
    : false;
}

export async function actorIsAllowed(
  data: CascadingData,
  intention: Intention
): Promise<boolean> {
  switch (intention.action) {
    // PALADIN LEVEL for respective domain:
    case ACTION_TYPES.grant:
    case ACTION_TYPES.remove:
      // cannot target self:
      if (intention.targetId === data.actor.slackUser) return false;
      return await actorHasMinDomainLevel(
        data,
        intention.domain,
        UserRole.paladin
      );

    // ADMIN LEVEL for respective domain:
    case ACTION_TYPES.promote:
    case ACTION_TYPES.demote:
    case ACTION_TYPES.forge:
      return await actorHasMinDomainLevel(
        data,
        intention.domain,
        UserRole.admin
      );

    // ADMIN LEVEL in any domain:
    case ACTION_TYPES.unearth:
      return !!data.actor.domains.find((dr) => dr.role === UserRole.admin);

    // non-protected actions:
    default:
      return true;
  }
}
