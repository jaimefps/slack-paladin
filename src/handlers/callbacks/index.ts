import { Db } from "mongodb";
import { Context as SlackContext, SlackEvent } from "@slack/bolt";
import { ACTION_TYPES } from "../../constants";
import { actorIsAllowed, teamIsAllowed } from "../permissions";
import { createIntention } from "../intentions";
import { findOrCreateUser } from "../../database/user-facade";
import { handleGrant } from "./handle-grant";
import { handleHelp } from "./handle-help";
import { handleList } from "./handle-list";
import { handlePromote } from "./handle-promote";
import { handleRemove } from "./handle-remove";
import { handleReveal } from "./handle-reveal";
import { handleUnearth } from "./handle-unearth";
import { handleWhoami } from "./handle-whoami";
import { CascadingData, TeamDoc } from "../../types";
import { handleDemote } from "./handle-demote";
import { handleForge } from "./handle-forge";
import { findOrCreateTeam } from "../../database/team-facade";

/**
 * root
 *
 */
export async function handleIntention(data: {
  context: SlackContext;
  event: SlackEvent;
  dbSingleton: Db;
}): Promise<string> {
  const { context, event, dbSingleton } = data;

  const intention = createIntention({
    context,
    event,
  });

  // IMPROVE
  // findOrCreate team.
  // depending on intention,
  // they may be able to do things here with a free tier account.
  const teamDoc: TeamDoc = await findOrCreateTeam({ dbSingleton, event });

  if (!teamDoc) {
    throw new Error(
      `Paladin failed to find or register your team in the system.`
    );
  }

  const teamHasPermission = teamIsAllowed(
    { context, dbSingleton, event, team: teamDoc },
    intention
  );

  if (!teamHasPermission) {
    throw new Error(`Your team does not have permission to do that.`);
  }

  // IMPROVE
  // findOrCreate actor.
  // depending on intention, we need to check permissions.
  const actorDoc = await findOrCreateUser({
    dbSingleton,
    team: event.team,
    user: event.user,
  });

  if (!actorDoc) {
    throw new Error(`Paladin failed to find or register <@${event.user}>.`);
  }

  const cascadingData: CascadingData = {
    ...data,
    team: teamDoc,
    actor: actorDoc,
  };

  const actorHasPermission = await actorIsAllowed(cascadingData, intention);

  if (!actorHasPermission) {
    throw new Error(
      `<@${actorDoc.slackUser}> does not have permission to do that.`
    );
  }

  switch (intention.action) {
    case ACTION_TYPES.help:
      return await handleHelp();

    case ACTION_TYPES.whoami:
      return await handleWhoami(cascadingData);

    // bard action
    case ACTION_TYPES.reveal:
      return await handleReveal(cascadingData, intention);

    // reveal badges|domains:
    case ACTION_TYPES.list:
      return await handleList(cascadingData, intention);

    case ACTION_TYPES.unearth:
      return await handleUnearth(cascadingData, intention);

    case ACTION_TYPES.grant:
      return await handleGrant(cascadingData, intention);

    case ACTION_TYPES.remove:
      return await handleRemove(cascadingData, intention);

    case ACTION_TYPES.promote:
      return await handlePromote(cascadingData, intention);

    case ACTION_TYPES.demote:
      return await handleDemote(cascadingData, intention);

    case ACTION_TYPES.forge:
      return await handleForge(cascadingData, intention);

    /**
     * IMPROVE easter eggs:
     *
     *  tomato
     *  washoff
     */

    default:
      throw new Error(`Paladin failed to understand your intentions.`);
  }
}
