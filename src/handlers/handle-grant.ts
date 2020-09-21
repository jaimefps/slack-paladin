import { CascadingData, BadgeDoc, ActorDoc } from "../types";
import { findOrCreateUser } from "../database/user-facade";

export async function handleGrant({
  intention: { targetId, badge },
  dbSingleton,
  event: { team },
}: CascadingData): Promise<string> {
  let badgeDoc: BadgeDoc;
  let userDoc: ActorDoc;

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
    console.error(e);
    throw new Error(
      `Paladin server failed to complete grant operation: ${e.message || e}`
    );
  }

  if (!badgeDoc) {
    throw new Error(`Paladin server cannot find badge: ${badge}`);
  }

  if (!userDoc) {
    throw new Error(`Paladin server cannot find user: <@${targetId}>`);
  }

  if (userDoc.badges.includes(badge)) {
    return `<@${targetId}> already has ${badge}.`;
  }

  try {
    const filter = { _id: userDoc._id };
    const update = { $set: { badges: [...userDoc.badges, badge] } };
    await dbSingleton.collection("users").updateOne(filter, update);
    return `${badge} badge granted to <@${targetId}>`;
  } catch (e) {
    console.error(e);
    throw new Error(
      `Paladin server failed to complete grant operation: ${e.message || e}`
    );
  }
}
