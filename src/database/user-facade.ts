import { Db, ObjectId } from "mongodb";
import { UserDoc } from "src/types";
import { areSameId } from "./utils";
import { isValidUser } from "../helpers/index";

export function userHasBadge(userDoc: UserDoc, badgeId: ObjectId): boolean {
  return !!userDoc.badges.find((id) => areSameId(badgeId, id));
}

export function makeUserDoc(slackTeamId: string, slackUserId: string): UserDoc {
  return {
    badges: [],
    domains: [],
    slackTeam: slackTeamId,
    slackUser: slackUserId,
  };
}

export async function findOrCreateUser({
  dbSingleton,
  user,
  team,
}: {
  dbSingleton: Db;
  user: string;
  team: string;
}): Promise<UserDoc> {
  if (!isValidUser(user)) {
    throw new Error(`Paladin cannot find or create invalid user ${user}`);
  }
  const result = await dbSingleton
    .collection("users")
    .findOneAndUpdate(
      { slackUser: user },
      { $setOnInsert: makeUserDoc(team, user) },
      { returnOriginal: false, upsert: true }
    );
  return result.value;
}
