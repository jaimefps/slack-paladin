import {
  BadgeDoc,
  CascadingData,
  ListIntention,
  DomainDoc,
  Listings,
} from "../../types";
import { DB_COLLECTIONS } from "../../constants";

export async function handleList(
  { dbSingleton, event: { team } }: CascadingData,
  { resource }: ListIntention
): Promise<string> {
  async function listBadges() {
    let badgeDocs: BadgeDoc[];
    try {
      badgeDocs = await dbSingleton
        .collection(DB_COLLECTIONS.badges)
        .find({ slackTeam: team })
        .toArray();
    } catch (e) {
      console.error(e);
      throw new Error(`Paladin failed to lookup badges.`);
    }
    return `These are all the badges: ${badgeDocs
      .map((b) => b.emoji)
      .join(" ")}`;
  }

  async function listDomains() {
    let domainDocs: DomainDoc[];
    try {
      domainDocs = await dbSingleton
        .collection(DB_COLLECTIONS.domains)
        .find({ slackTeam: team })
        .toArray();
    } catch (e) {
      console.error(e);
      throw new Error(`Paladin failed to lookup domains.`);
    }
    return `These are all the domains: ${domainDocs
      .map((b) => b.name)
      .join(", ")}`;
  }

  switch (resource) {
    case Listings.badges:
      return await listBadges();

    case Listings.domains:
      return await listDomains();

    default:
      throw new Error(`Paladin failed to reveal list of: ${resource}`);
  }
}
