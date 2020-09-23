import {
  CascadingData,
  UserDoc,
  DomainDoc,
  DemoteIntention,
} from "../../types";
import { findOrCreateUser } from "../../database/user-facade";
import { DB_COLLECTIONS } from "../../constants";
import { areSameId } from "../../database/utils";

export async function handleDemote(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId, domain }: DemoteIntention
): Promise<string> {
  let domainDoc: DomainDoc;
  let userDoc: UserDoc;

  try {
    const getDomain = dbSingleton
      .collection(DB_COLLECTIONS.domains)
      .findOne({ slackTeam: team, name: domain });

    const getUser = findOrCreateUser({
      dbSingleton,
      user: targetId,
      team,
    });

    [domainDoc, userDoc] = await Promise.all([getDomain, getUser]);
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to lookup user or domain info.`);
  }

  if (!domainDoc) {
    return `Invalid domain: \`${domain}\``;
  }

  if (!userDoc) {
    throw new Error(`Paladin failed to find user: <@${targetId}>`);
  }

  const userDomainRole =
    userDoc?.domains?.find((role) => areSameId(domainDoc._id, role.id))?.role ||
    null;

  // doesn't have domain => "user cannot have lesser permissions"
  if (!userDomainRole) {
    return `<@${targetId}> is already a \`Villager\` in \`${domain}\`.`;
  }

  // has domain, is paladin => remove the entry altogether
  if (userDomainRole === "paladin") {
    try {
      const domains = userDoc.domains.filter(
        (d) => !areSameId(d.id, domainDoc._id)
      );
      const filter = { _id: userDoc._id };
      const update = { $set: { domains } };
      await dbSingleton
        .collection(DB_COLLECTIONS.users)
        .updateOne(filter, update);
      return `<@${targetId}> has become an \`Villager\` of \`${domain}\`!`;
    } catch (e) {
      console.error(e);
      throw new Error(
        `Paladin failed to demote <@${targetId}> in the domain: \`${domain}\``
      );
    }
  }

  // has domain, is admin => turn into paladin
  if (userDomainRole === "admin") {
    try {
      const domains = userDoc.domains.map((d) => {
        return areSameId(d.id, domainDoc._id)
          ? {
              id: d.id,
              role: "paladin",
            }
          : d;
      });
      const filter = { _id: userDoc._id };
      const update = { $set: { domains } };
      await dbSingleton
        .collection(DB_COLLECTIONS.users)
        .updateOne(filter, update);
      return `<@${targetId}> has become a \`Paladin\` of \`${domain}\`!`;
    } catch (e) {
      console.error(e);
      throw new Error(
        `Paladin failed to demote <@${targetId}> in the domain: \`${domain}\``
      );
    }
  }

  throw new Error(
    `Paladin failed to process demotion request for <@${targetId}> in \`${domain}\``
  );
}
