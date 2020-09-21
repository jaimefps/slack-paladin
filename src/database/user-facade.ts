import { Db } from "mongodb";
import { ActorDoc } from "src/types";

export function makeUserDoc(
  slackTeamId: string,
  slackUserId: string
): ActorDoc {
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
}): Promise<ActorDoc> {
  const result = await dbSingleton
    .collection("users")
    .findOneAndUpdate(
      { slackUser: user },
      { $setOnInsert: makeUserDoc(team, user) },
      { returnOriginal: false, upsert: true }
    );
  return result.value;
}
