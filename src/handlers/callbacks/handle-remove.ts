import { findOrCreateUser, userHasBadge } from "../../database/user-facade";
import { BadgeDoc, CascadingData, RemoveIntention, UserDoc } from "../../types";
import { areSameId } from "../../database/utils";
import { fatal } from "../../helpers";

export async function handleRemove(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId, badge }: RemoveIntention
): Promise<string> {
  let badgeDoc: BadgeDoc;
  let userDoc: UserDoc;

  try {
    const getBadge = dbSingleton
      .collection("badges")
      .findOne({ slackTeam: team, emoji: badge });

    const getUser = findOrCreateUser({
      dbSingleton,
      user: targetId,
      team,
    });

    [badgeDoc, userDoc] = await Promise.all([getBadge, getUser]);
  } catch (e) {
    fatal(e);
  }

  if (!badgeDoc) {
    throw new Error(`Paladin server cannot find badge: ${badge}`);
  }

  if (!userDoc) {
    throw new Error(`Paladin server cannot find user: <@${targetId}>`);
  }

  const hasBadge = userHasBadge(userDoc, badgeDoc._id);

  if (!hasBadge) {
    return `<@${targetId}> doesn't even have badge ${badge}`;
  }

  try {
    const newBadges = userDoc.badges.filter(
      (id) => !areSameId(id, badgeDoc._id)
    );
    const filter = { _id: userDoc._id };
    const update = { $set: { badges: newBadges } };
    await dbSingleton.collection("users").updateOne(filter, update);
    return `${badge} badge removed from <@${targetId}>`;
  } catch (e) {
    fatal(e);
  }
}
