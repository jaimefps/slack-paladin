require("dotenv").config();

import { App, ExpressReceiver } from "@slack/bolt";
import { handleIntention } from "./handlers/handle-intention";
import { createDbSingleton } from "./database/connection";

(async function start() {
  // environment:
  const PORT = 4390 || process.env.PORT;
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
      console.log("time:", new Date());
      console.log("context:", context);
      console.log("event:", event);

      try {
        const text = await handleIntention({
          context,
          dbSingleton,
          event,
        });

        if (!text) {
          throw new Error(
            `Paladin server unsure if action was completed. Please try again or reach out to support.`
          );
        }

        await slackbot.client.chat.postMessage({
          text,
          channel: event.channel,
          thread_ts: event.ts,
          token: context.botToken,
        });
      } catch (err1) {
        try {
          await slackbot.client.chat.postMessage({
            text: `Error: ${err1.message}`,
            channel: event.channel,
            thread_ts: event.ts,
            token: context.botToken,
          });
        } catch (err2) {
          console.error(err2);
        }
      }
    }
  );

  await slackbot.start(PORT);
  console.log(`⚡ Paladin app is running on PORT: ${PORT} ⚡`);
})();
