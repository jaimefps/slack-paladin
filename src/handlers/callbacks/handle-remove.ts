import { findOrCreateUser, userHasBadge } from "../../database/user-facade";
import { BadgeDoc, CascadingData, RemoveIntention, UserDoc } from "../../types";
import { areSameId } from "../../database/utils";
import { DB_COLLECTIONS } from "../../constants";

export async function handleRemove(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId, badge }: RemoveIntention
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
    throw new Error(`Paladin cannot find badge: ${badge}`);
  }

  if (!userDoc) {
    throw new Error(`Paladin cannot find user: <@${targetId}>`);
  }

  if (!userHasBadge(userDoc, badgeDoc._id)) {
    return `<@${targetId}> doesn't even have badge ${badge}`;
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
    return `${badge} badge removed from <@${targetId}>`;
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to deprive user: <@${targetId}>`);
  }
}
