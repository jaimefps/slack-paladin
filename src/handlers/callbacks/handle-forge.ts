import {
  BadgeDoc,
  CascadingData,
  DomainDoc,
  ForgeIntention,
} from "../../types";
import { DB_COLLECTIONS } from "../../constants";

export async function handleForge(
  { dbSingleton, event: { team } }: CascadingData,
  { name, badge, domain }: ForgeIntention
): Promise<string> {
  let domainDoc: DomainDoc;
  let badgeDoc: BadgeDoc;

  // find if domain exists;
  // if no, return fail msg
  try {
    domainDoc = await dbSingleton.collection(DB_COLLECTIONS.domains).findOne({
      slackTeam: team,
      name: domain,
    });
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed lookup domain: \`${domain}\``);
  }

  if (!domainDoc) {
    return `Paladin cannot find any domain called \`${domain}\``;
  }

  // IMPROVE!
  async function warnDuplication(problem: "name" | "emoji") {
    try {
      return `The \`${domainDoc.name}\` domain already has a badge with that ${problem}.`;
    } catch (e) {
      console.error(e);
      throw new Error(
        `Paladin failed to lookup domain of already existing badge: ${badge}`
      );
    }
  }

  // IMPROVE
  // find if badge exists;
  // check if domain/emoji combo exists
  // check if domain/name combo exists
  // if yes, return fail msg
  try {
    badgeDoc = await dbSingleton.collection(DB_COLLECTIONS.badges).findOne({
      domain: domainDoc._id,
      slackTeam: team,
      emoji: badge,
    });
    if (badgeDoc) return await warnDuplication("emoji");
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed lookup badge: ${badge}`);
  }

  try {
    badgeDoc = await dbSingleton.collection(DB_COLLECTIONS.badges).findOne({
      domain: domainDoc._id,
      slackTeam: team,
      name,
    });
    if (badgeDoc) return await warnDuplication("name");
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed lookup badge: ${badge}`);
  }

  // else create badge
  const newBadge: BadgeDoc = {
    name,
    emoji: badge,
    domain: domainDoc._id,
    slackTeam: team,
  };

  try {
    await dbSingleton.collection(DB_COLLECTIONS.badges).insertOne(newBadge);
    return `Paladin forged a new badge \`${name}\` ${badge} for the \`${domain}\` domain!`;
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to forge badge: ${badge}`);
  }
}
