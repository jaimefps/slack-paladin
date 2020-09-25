import { ACTION_TYPES } from "../../constants";
import { gatherCredentials } from "../permissions";
import { handleDemote } from "./handle-demote";
import { handleForge } from "./handle-forge";
import { handleGrant } from "./handle-grant";
import { handleHelp } from "./handle-help";
import { handleList } from "./handle-list";
import { handlePromote } from "./handle-promote";
import { handleRemove } from "./handle-remove";
import { handleReveal } from "./handle-reveal";
import { handleUnearth } from "./handle-unearth";
import { handleWhoami } from "./handle-whoami";
import { createIntention } from "../intentions";
import { CascadingData, CascadingRoot } from "../../types";

/**
 * root
 *
 */
export async function handleEvent(data: CascadingRoot): Promise<string> {
  const intention = createIntention(data);
  const { team, actor } = await gatherCredentials(data, intention);
  const cascadingData: CascadingData = { ...data, team, actor };

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

    default:
      throw new Error(`Paladin failed to understand your intentions.`);
  }
}
