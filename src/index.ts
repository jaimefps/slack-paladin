require("dotenv").config();

import { App } from "@slack/bolt";
import { handleHelp } from "./handlers/handle-help";
import { handleIntention } from "./handlers/handle-intention";
import { getIntention /* , actorIsAllowed */ } from "./helpers";
import { SLACK_EVENTS, ACTION_TYPES } from "./constants";
import { db } from "./database";

const PORT = 4390 || process.env.PORT;

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  await bot.start(PORT);

  bot.event(SLACK_EVENTS.app_mention, async ({ context, event }) => {
    console.log("context:", context);
    console.log("event:", event);

    const reply = ({ text }: { text: string }) => {
      bot.client.chat.postMessage({
        token: context.botToken,
        channel: event.channel,
        thread_ts: event.ts,
        text,
      });
    };

    try {
      const intention = getIntention({ context, event });

      // @ts-ignore
      if (!ACTION_TYPES[intention.action])
        throw new Error(
          "Unknown invocation: " +
            intention.action +
            `\n\n${await handleHelp()}`
        );

      const actor = await db.findOrCreateUser(event.user);
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

      const result = await handleIntention({
        intention,
        context,
        event,
        actor,
      });

      await reply({ text: result });
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
})();
