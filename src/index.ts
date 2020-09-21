require("dotenv").config();

import { App, ExpressReceiver } from "@slack/bolt";
import { handleHelp } from "./handlers/handle-help";
import { handleIntention } from "./handlers/handle-intention";
import { getIntention } from "./helpers";
import { SLACK_EVENTS, ACTION_TYPES } from "./constants";
import { createDbSingleton } from "./database/connection";
import { findOrCreateUser } from "./database/user-facade";

(async function start() {
  // environment:
  const PORT = 4390 || process.env.PORT;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const token = process.env.SLACK_BOT_TOKEN;

  // singletons:
  const dbSingleton = await createDbSingleton();
  const restClient = new ExpressReceiver({ signingSecret });
  const slackbot = new App({ token, receiver: restClient });

  // restClient.router.get("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.post("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.put("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.delete("/test", (_, res) => res.send({ 1: "yay!" }));

  slackbot.event(SLACK_EVENTS.app_mention, async ({ context, event }) => {
    console.log("event:", event);
    console.log("context:", context);

    try {
      const intention = getIntention({ context, event });

      if (!ACTION_TYPES[intention.action]) {
        throw new Error(
          "Unknown invocation: " +
            intention.action +
            `\n\n${await handleHelp()}`
        );
      }

      const actor = await findOrCreateUser({
        dbSingleton,
        team: event.team,
        user: event.user,
      });

      if (!actor) {
        throw new Error(
          `Paladin server unable to find or create <@${event.user}>.`
        );
      }

      // const hasPermission = await actorIsAllowed({
      //   intention,
      //   context,
      //   event,
      //   actor,
      // });

      // if (!hasPermission) {
      //   throw new Error(
      //     `<@${event.user}> does not have permission to do that.`
      //   );
      // }

      const text = await handleIntention({
        actor,
        context,
        dbSingleton,
        event,
        intention,
      });

      if (!text) {
        throw new Error(`Paladin server unclear if action was completed.`);
      }

      await slackbot.client.chat.postMessage({
        text,
        channel: event.channel,
        thread_ts: event.ts,
        token: context.botToken,
      });
    } catch (e) {
      try {
        await slackbot.client.chat.postMessage({
          text: `Error: ${e.message}`,
          channel: event.channel,
          thread_ts: event.ts,
          token: context.botToken,
        });
      } catch (error) {
        console.error(error);
      }
    }
  });

  await slackbot.start(PORT);
  console.log(`⚡ Paladin app is running on PORT: ${PORT} ⚡`);
})();
