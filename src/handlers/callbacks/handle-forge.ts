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

  console.log("=================intention", { name, badge, domain });

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

  console.log("=================domainDoc", domainDoc);

  if (!domainDoc) {
    return `Paladin cannot find any domain called \`${domain}\``;
  }

  // find if badge exists;
  // if yes, look up parent domain and return fail msg
  try {
    badgeDoc = await dbSingleton.collection(DB_COLLECTIONS.badges).findOne({
      domain: domainDoc._id,
      slackTeam: team,
      emoji: badge,
      name,
    });
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed lookup badge: ${badge}`);
  }

  console.log("=================badgeDoc", badgeDoc);

  if (badgeDoc) {
    try {
      const interruptDomain: DomainDoc = await dbSingleton
        .collection(DB_COLLECTIONS.domains)
        .findOne({ _id: badgeDoc.domain });
      return `A ${badge} badge already exists in the \`${interruptDomain.name}\` domain.`;
    } catch (e) {
      console.error(e);
      throw new Error(
        `Paladin failed to lookup domain of already existing badge: ${badge}`
      );
    }
  }

  // else create badge
  const newBadge: BadgeDoc = {
    name,
    domain: domainDoc._id,
    emoji: badge,
    slackTeam: team,
  };

  try {
    await dbSingleton.collection(DB_COLLECTIONS.badges).insertOne(newBadge);
    return `Paladin forged a new badge ${badge} for the \`${domain}\` domain!`;
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to forge badge: ${badge}`);
  }
}
