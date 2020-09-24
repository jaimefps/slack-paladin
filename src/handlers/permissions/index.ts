import { actorIsAllowed } from "./actor-is-allowed";
import { teamIsAllowed } from "./team-is-allowed";
import { CascadingRoot, Intention, TeamDoc, UserDoc } from "../../types";
import { findOrCreateTeam } from "../../database/team-facade";
import { findOrCreateUser } from "../../database/user-facade";

export async function gatherCredentials(
  data: CascadingRoot,
  intention: Intention
): Promise<{ actor: UserDoc; team: TeamDoc }> {
  const { event, dbSingleton } = data;

  const [teamDoc, actorDoc]: [TeamDoc, UserDoc] = await Promise.all([
    findOrCreateTeam({ dbSingleton, event }),
    findOrCreateUser({
      dbSingleton,
      team: event.team,
      user: event.user,
    }),
  ]);

  if (!teamDoc) {
    throw new Error(`Paladin failed to find or register your team.`);
  }

  if (!actorDoc) {
    throw new Error(`Paladin failed to find or register <@${event.user}>.`);
  }

  if (
    !(await teamIsAllowed(
      {
        ...data,
        team: teamDoc,
        actor: actorDoc,
      },
      intention
    ))
  ) {
    throw new Error(`Your team account does not have permission to do that.`);
  }

  if (
    !(await actorIsAllowed(
      {
        ...data,
        actor: actorDoc,
        team: teamDoc,
      },
      intention
    ))
  ) {
    throw new Error(
      `<@${actorDoc.slackUser}> does not have permission to do that.`
    );
  }

  return {
    actor: actorDoc,
    team: teamDoc,
  };
}
