import { CascadingData, BadgeDoc, UserDoc, GrantIntention } from "../../types";
import { findOrCreateUser, userHasBadge } from "../../database/user-facade";
import { fatal } from "../../helpers";

export async function handleGrant(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId, badge }: GrantIntention
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

  if (hasBadge) {
    return `<@${targetId}> already has ${badge}.`;
  }

  try {
    const filter = { _id: userDoc._id };
    const update = { $set: { badges: [...userDoc.badges, badgeDoc._id] } };
    await dbSingleton.collection("users").updateOne(filter, update);
    return `${badge} badge granted to <@${targetId}>`;
  } catch (e) {
    fatal(e);
  }
}
