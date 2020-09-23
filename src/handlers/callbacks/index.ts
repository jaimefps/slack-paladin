import { Db } from "mongodb";
import { Context as SlackContext, SlackEvent } from "@slack/bolt";
import { ACTION_TYPES } from "../../constants";
import { actorIsAllowed } from "../permissions";
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
import { CascadingData } from "../../types";
import { handleDemote } from "./handle-demote";
import { handleForge } from "./handle-forge";

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

  const actor = await findOrCreateUser({
    dbSingleton,
    team: event.team,
    user: event.user,
  });

  if (!actor) {
    throw new Error(`Paladin failed to find or register <@${event.user}>.`);
  }

  const intention = createIntention({
    actor,
    context,
    event,
  });

  const hasPermission = await actorIsAllowed(
    { actor, context, dbSingleton, event },
    intention
  );

  if (!hasPermission) {
    throw new Error(
      `<@${actor.slackUser}> does not have permission to do that.`
    );
  }

  const cascadingData: CascadingData = { ...data, actor };

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
     * TODO handle:
     *
     *  tomato
     *  clean
     */
    default:
      throw new Error(`Paladin failed to understand your intentions.`);
  }
}
