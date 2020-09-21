import { ActorDoc } from "src/types";
// import { getPresentTime } from "../helpers";

export function makeUser(slackTeamId: String, slackUserId: String): ActorDoc {
  return {
    badges: [],
    domains: [],
    slackTeam: slackTeamId,
    slackUser: slackUserId,
    // createdAt: now,
    // updatedAt: now,
  };
}
