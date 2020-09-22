import { CascadingData, DomainDoc, UnearthIntention } from "../../types";
import { DB_COLLECTIONS } from "../../constants";

export async function handleUnearth(
  { dbSingleton, event: { team } }: CascadingData,
  { domain }: UnearthIntention
): Promise<string> {
  let domainDoc: DomainDoc;

  try {
    domainDoc = await dbSingleton
      .collection(DB_COLLECTIONS.domains)
      .findOne({ name: domain });
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed lookup domain: ${domain}`);
  }

  if (domainDoc) {
    return `A domain already exists with the name of: ${domain}`;
  }

  const newDomain: DomainDoc = {
    name: domain,
    slackTeam: team as string,
  };

  try {
    const result = await dbSingleton
      .collection(DB_COLLECTIONS.domains)
      .insertOne(newDomain);
    console.log("resulkt", result.insertedId);
    return `Paladin unearthed a new domain: ${domain}!`;
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to create domain: ${domain}`);
  }
}
