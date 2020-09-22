import { CascadingData, BadgeDoc, UserDoc, GrantIntention } from "../../types";
import { findOrCreateUser, userHasBadge } from "../../database/user-facade";
import { DB_COLLECTIONS } from "../../constants";

export async function handleGrant(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId, badge }: GrantIntention
): Promise<string> {
  let badgeDoc: BadgeDoc;
  let userDoc: UserDoc;

  try {
    const getBadge = dbSingleton
      .collection(DB_COLLECTIONS.badges)
      .findOne({ slackTeam: team, emoji: badge });

    const getUser = findOrCreateUser({
      dbSingleton,
      user: targetId,
      team,
    });

    [badgeDoc, userDoc] = await Promise.all([getBadge, getUser]);
  } catch (e) {
    console.error(e);
    throw new Error(
      `Paladin failed to find user or badge info for: <@${targetId}>`
    );
  }

  if (!badgeDoc) {
    throw new Error(`Paladin server doesn't have a badge of: ${badge}`);
  }

  if (!userDoc) {
    throw new Error(`Paladin server cannot find user: <@${targetId}>`);
  }

  if (userHasBadge(userDoc, badgeDoc._id)) {
    return `<@${targetId}> already has ${badge}.`;
  }

  try {
    const filter = { _id: userDoc._id };
    const update = { $set: { badges: [...userDoc.badges, badgeDoc._id] } };
    await dbSingleton
      .collection(DB_COLLECTIONS.users)
      .updateOne(filter, update);
    return `${badge} badge granted to <@${targetId}>`;
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to bestow badge upon: <@${targetId}>`);
  }
}
