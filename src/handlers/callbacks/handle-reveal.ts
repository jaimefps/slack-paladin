import { findOrCreateUser } from "../../database/user-facade";
import { BadgeDoc, CascadingData, RevealIntention, UserDoc } from "../../types";
import { fatal } from "../../helpers";

export async function handleReveal(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId }: RevealIntention
): Promise<string> {
  let userDoc: UserDoc;
  let badgeDocs: BadgeDoc[];

  try {
    userDoc = await findOrCreateUser({
      dbSingleton,
      user: targetId,
      team,
    });
  } catch (e) {
    fatal(e);
  }

  if (userDoc.badges.length < 1) {
    return `<@${targetId}> doesn't have any badges... yet!`;
  }

  try {
    badgeDocs = await dbSingleton
      .collection("badges")
      .find({ _id: { $in: userDoc.badges } })
      .toArray();
  } catch (e) {
    fatal(e);
  }

  return `${badgeDocs.map((d) => d.emoji).join(" ")}`;
}
