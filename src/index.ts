require("dotenv").config();

import { App, ExpressReceiver } from "@slack/bolt";
import { handleEvent } from "./handlers/callbacks";
import { createDbSingleton } from "./database";
import { ACTION_TYPES } from "./constants";

/*

context: {
  botToken: 'xoxb-1329271402389-1371823076981-I3qolQIOAaJoxKdGNlAiUWi5',
  botUserId: 'U01AXQ728UV',
  botId: 'B01BQN79EJU',
  updateConversation: [Function]
}

event: {
  client_msg_id: '2b596a60-35c2-46d4-8b2d-01925e8de69a',
  type: 'app_mention',
  text: '<@U01AXQ728UV> whoami',
  user: 'U01AG5STD24',
  ts: '1601000143.001900',
  team: 'T019P7ZBUBF',
  blocks: [ { type: 'rich_text', block_id: 'd/n', elements: [Array] } ],
  channel: 'G01AY220EFP',
  event_ts: '1601000143.001900'
}

*/

(async function start(): Promise<void> {
  // environment:
  const PORT = process.env.PORT || 4390;
  const token = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  // singletons:
  const { dbSingleton, dbClient } = await createDbSingleton();
  const restClient = new ExpressReceiver({ signingSecret });
  const slackbot = new App({ token, receiver: restClient });

  // restClient.router.get("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.post("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.put("/test", (_, res) => res.send({ 1: "yay!" }));
  // restClient.router.delete("/test", (_, res) => res.send({ 1: "yay!" }));

  slackbot.event(
    "app_mention",
    async ({ context, event }): Promise<void> => {
      const startTime = new Date().toJSON();
      console.time(startTime);
      console.log("context:", context);
      console.log("event:", event);

      async function reply(text: string): Promise<void> {
        await slackbot.client.chat.postMessage({
          text,
          channel: event.channel,
          token: context.botToken,
          thread_ts: event.ts,
        });
      }

      if (!event.team) {
        throw new Error(
          "Paladin failed to detect what team this request is coming from."
        );
      }

      let replyMsg;

      try {
        replyMsg = await handleEvent({
          context,
          dbClient,
          dbSingleton,
          event,
        });

        if (!replyMsg) {
          throw new Error(
            `Paladin unsure if action was completed. Please try again or reach out to support.`
          );
        }

        console.timeEnd(startTime);
        return await reply(replyMsg);
      } catch (e) {
        console.error(e);
        replyMsg = `Error: ${e.message}\n\n\`@paladin ${ACTION_TYPES.help}\` to show available commands.`;
      }

      try {
        // reply with error message:
        console.timeEnd(startTime);
        return await reply(replyMsg);
      } catch (e) {
        // fatal error
        console.error(e);
      }
    }
  );

  await slackbot.start(PORT);
  console.log(`⚡ Paladin app is running on http://localhost:${PORT} ⚡`);
})();
