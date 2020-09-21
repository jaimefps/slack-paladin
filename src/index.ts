require("dotenv").config();

import { App } from "@slack/bolt";
import { handleHelp } from "./handlers/handle-help";
import { handleIntention } from "./handlers/handle-intention";
import { getIntention /* , actorIsAllowed */ } from "./helpers";
import { SLACK_EVENTS, ACTION_TYPES } from "./constants";
import { createClient, getDBName } from "./database/connection";
import { findOrCreateUser } from "./database/user-facade";
// import { db } from "./database";

const PORT = 4390 || process.env.PORT;

// root async/await:
async function start() {
  /**
   * DB setup
   */
  const dbClient = await createClient();
  const dbSingleton = dbClient.db(getDBName());
  process.on("SIGINT", function () {
    dbClient.close(function () {
      console.log("🔌 MongoDB disconnected on app termination 🔌");
      process.exit(0);
    });
  });

  /**
   * SlackBot setup
   */
  const bot = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
  });
  await bot.start(PORT);
  bot.event(SLACK_EVENTS.app_mention, async ({ context, event }) => {
    const { team, user } = event;
    console.log("context:", context);
    console.log("event:", event);

    function reply({ text }: { text: string }) {
      bot.client.chat.postMessage({
        token: context.botToken,
        channel: event.channel,
        thread_ts: event.ts,
        text,
      });
    }

    try {
      const intention = getIntention({ context, event });
      if (!ACTION_TYPES[intention.action]) {
        throw new Error(
          "Unknown invocation: " +
            intention.action +
            `\n\n${await handleHelp()}`
        );
      }
      const actor = await findOrCreateUser({ dbSingleton, team, user });
      if (!actor)
        throw new Error(
          `Paladin server unable to find or create <@${event.user}>.`
        );
      // console.log("theactor:", actor);
      // const hasPermission = await actorIsAllowed({
      //   intention,
      //   context,
      //   event,
      //   actor,
      // });
      // if (!hasPermission)
      //   throw new Error(
      //     `<@${event.user}> does not have permission to do that.`
      //   );
      await reply({
        text: await handleIntention({
          actor,
          context,
          dbSingleton,
          event,
          intention,
        }),
      });
    } catch (e) {
      try {
        const errMsg = `Error: ${e.message}`;
        await reply({ text: errMsg });
      } catch (error) {
        console.error(error);
      }
    }
  });

  console.log("⚡ Paladin app is running ⚡");
}

start();
