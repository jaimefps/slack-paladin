require("dotenv").config();

import { App, ExpressReceiver } from "@slack/bolt";
import { handleIntention } from "./handlers/callbacks";
import { createDbSingleton } from "./database";
import { handleHelp } from "./handlers/callbacks/handle-help";

(async function start(): Promise<void> {
  // environment:
  const PORT = process.env.PORT || 4390;
  const token = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  // singletons:
  const dbSingleton = await createDbSingleton();
  const restClient = new ExpressReceiver({ signingSecret });
  const slackbot = new App({ token, receiver: restClient });

  // restClient.router.get("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.post("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.put("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.delete("/test", (_, res) => res.send({ 1: "yay!" }));

  slackbot.event(
    "app_mention",
    async ({ context, event }): Promise<void> => {
      const time = new Date().toJSON();
      console.log("start:", time);
      console.log("context:", context);
      console.log("event:", event);
      console.time(time);

      async function reply(text: string): Promise<void> {
        await slackbot.client.chat.postMessage({
          text,
          channel: event.channel,
          token: context.botToken,
          thread_ts:
            process.env.NODE_ENV === "development" ? undefined : event.ts,
        });
      }

      if (!event.team) {
        throw new Error(
          "Paladin failed to detect what team this request is coming from."
        );
      }

      let replyMsg;

      try {
        replyMsg = await handleIntention({
          context,
          dbSingleton,
          event,
        });

        if (!replyMsg) {
          throw new Error(
            `Paladin unsure if action was completed. Please try again or reach out to support.`
          );
        }

        console.timeEnd(time);
        return await reply(replyMsg);
      } catch (err1) {
        console.error(err1);
        replyMsg = `Error: ${err1.message || err1}\n\n${await handleHelp()}`;
      }

      try {
        // reply with error message:
        console.timeEnd(time);
        return await reply(replyMsg);
      } catch (err2) {
        // fatal error
        console.error(err2);
      }
    }
  );

  await slackbot.start(PORT);
  console.log(`⚡ Paladin app is running on http://localhost:${PORT} ⚡`);
})();
