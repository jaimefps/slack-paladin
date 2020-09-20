require("dotenv").config();
const { App } = require("@slack/bolt");
const { handleIntention } = require("./handlers/handle-intention");
const { getIntention, actorIsAllowed } = require("./helpers");
const { SLACK_EVENTS } = require("./constants");
const { db } = require("./database");

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

    const reply = ({ text }) => {
      bot.client.chat.postMessage({
        token: context.botToken,
        channel: event.channel,
        thread_ts: event.ts,
        text,
      });
    };

    try {
      const actor = await db.findOrCreateUser(event.user);
      const intention = getIntention({ context, event });
      const hasPermission = await actorIsAllowed({
        intention,
        context,
        event,
        actor,
      });

      if (!hasPermission)
        throw new Error(
          `<@${event.user}> does not have permission to do that.`
        );

      await reply({
        text: await handleIntention({
          intention,
          context,
          event,
          actor,
        }),
      });
    } catch (e) {
      try {
        const text = `Error: ${e.message}`;
        await reply({ text });
      } catch (error) {
        console.error(error);
      }
    }
  });

  console.log("⚡️ Bolt app is running!");
})();
