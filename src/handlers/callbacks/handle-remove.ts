import {
  BadgeDoc,
  CascadingData,
  DomainDoc,
  RemoveIntention,
  UserDoc,
} from "../../types";
import { areSameId } from "../../database/utils";
import { DB_COLLECTIONS } from "../../constants";
import { findOrCreateUser, userHasBadge } from "../../database/user-facade";

export async function handleRemove(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId, badgeName, domain }: RemoveIntention
): Promise<string> {
  let domainDoc: DomainDoc;
  let badgeDoc: BadgeDoc;
  let userDoc: UserDoc;

  try {
    domainDoc = await dbSingleton
      .collection(DB_COLLECTIONS.domains)
      .findOne({ name: domain, slackTeam: team });
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to find domain: \`${domain}\``);
  }

  if (!domainDoc) {
    throw new Error(`Invalid domain provided: \`${domain}\``);
  }

  try {
    [badgeDoc, userDoc] = await Promise.all([
      dbSingleton.collection(DB_COLLECTIONS.badges).findOne({
        slackTeam: team,
        name: badgeName,
        domain: domainDoc._id,
      }),
      findOrCreateUser({
        dbSingleton,
        user: targetId,
        team,
      }),
    ]);
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to find user or badge info.`);
  }

  if (!badgeDoc) {
    return `\`${badgeName}\` is not a badge in \`${domain}\`.`;
  }

  if (!userDoc) {
    throw new Error(`Paladin cannot find user: <@${targetId}>`);
  }

  if (!userHasBadge(userDoc, badgeDoc._id)) {
    return `<@${targetId}> doesn't have badge \`${badgeName}\``;
  }

  try {
    const newBadges = userDoc.badges.filter(
      (id) => !areSameId(id, badgeDoc._id)
    );
    const filter = { _id: userDoc._id };
    const update = { $set: { badges: newBadges } };
    await dbSingleton
      .collection(DB_COLLECTIONS.users)
      .updateOne(filter, update);
    return `\`${badgeName}\` ${badgeDoc.emoji} removed from <@${targetId}>`;
  } catch (e) {
    console.error(e);
    throw new Error(
      `Paladin failed to deprive <@${targetId}> of \`${badgeName}\``
    );
  }
}
