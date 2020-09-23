import {
  CascadingData,
  UserDoc,
  PromoteIntention,
  DomainDoc,
} from "../../types";
import { findOrCreateUser } from "../../database/user-facade";
import { DB_COLLECTIONS } from "../../constants";
import { areSameId } from "../../database/utils";

export async function handlePromote(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId, domain }: PromoteIntention
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

  // doesn't have domain => add domain, turn into paladin
  if (!userDomainRole) {
    try {
      const domains = [
        ...userDoc.domains,
        {
          id: domainDoc._id,
          role: "paladin",
        },
      ];
      const filter = { _id: userDoc._id };
      const update = { $set: { domains } };
      await dbSingleton
        .collection(DB_COLLECTIONS.users)
        .updateOne(filter, update);
      return `<@${targetId}> has become a \`Paladin\` of \`${domain}\`!`;
    } catch (e) {
      console.error(e);
      throw new Error(
        `Paladin failed to promote <@${targetId}> in the domain: \`${domain}\``
      );
    }
  }

  // has domain, is paladin => turn into admin
  if (userDomainRole === "paladin") {
    try {
      const domains = userDoc.domains.map((d) => {
        return areSameId(d.id, domainDoc._id)
          ? {
              id: d.id,
              role: "admin",
            }
          : d;
      });
      const filter = { _id: userDoc._id };
      const update = { $set: { domains } };
      await dbSingleton
        .collection(DB_COLLECTIONS.users)
        .updateOne(filter, update);
      return `<@${targetId}> has become an \`Admin\` of \`${domain}\`!`;
    } catch (e) {
      console.error(e);
      throw new Error(
        `Paladin failed to promote <@${targetId}> in the domain: \`${domain}\``
      );
    }
  }

  // has domain, is admin => "user cannot be promoted, already an admin"
  if (userDomainRole === "admin") {
    return `<@${targetId}> is already an \`Admin\` in \`${domain}\`.`;
  }

  throw new Error(
    `Paladin failed to process promotion request for <@${targetId}> in \`${domain}\``
  );
}
