import {
  BadgeDoc,
  CascadingData,
  ListIntention,
  DomainDoc,
  Listings,
  UserRole,
  DomainRole,
  UserDoc,
} from "../../types";
import { ACTION_TYPES, DB_COLLECTIONS } from "../../constants";
import { areSameId } from "../../database/utils";

export async function handleList(
  { dbSingleton, event: { team } }: CascadingData,
  { resource }: ListIntention
): Promise<string> {
  async function getDomainAdmins(domain: DomainDoc): Promise<UserDoc[]> {
    const element: DomainRole = { id: domain._id, role: UserRole.admin };
    try {
      return await dbSingleton
        .collection(DB_COLLECTIONS.users)
        .find({ domains: { $elemMatch: element } })
        .toArray();
    } catch (e) {
      console.error(e);
      throw new Error("Paladin failed to find domain Admins.");
    }
  }

  function formatAdminsTxt(admins: UserDoc[]) {
    let txt = ``;
    admins.forEach((a) => (txt = `${txt}\n<@${a.slackUser}>`));
    return txt;
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
      throw new Error(`Paladin failed to lookup \`domains\`.`);
    }

    let txt = "These are all the domains in the kingdom:";

    for (const dom of domainDocs) {
      // for-of loop to write easy awaits:
      const admins = await getDomainAdmins(dom);
      txt = `${txt}\n\nDomain: ${dom.name}\nAdmins:\n${formatAdminsTxt(
        admins
      )}\n\n\n`;
    }

    return domainDocs.length < 1
      ? `No domains have been created in your team.\nAsk an \`Admin\` to \`${ACTION_TYPES.unearth}\` a new domain for you.`
      : txt;
  }

  function formatBadgesTxt(badges: BadgeDoc[]) {
    let txt = "";
    badges.forEach((badge) => {
      txt = `${txt}\n${badge.emoji} ${badge.name}\n`;
    });
    return txt;
  }

  async function listBadges() {
    let badgeDocs: BadgeDoc[];
    let domainDocs: DomainDoc[];

    try {
      badgeDocs = await dbSingleton
        .collection(DB_COLLECTIONS.badges)
        .find({ slackTeam: team })
        .toArray();

      domainDocs = await dbSingleton
        .collection(DB_COLLECTIONS.domains)
        .find({ _id: { $in: badgeDocs.map((b) => b.domain) } })
        .toArray();
    } catch (e) {
      console.error(e);
      throw new Error(`Paladin failed to lookup \`badges\`.`);
    }

    let txt = `These are all the badges in the kingdom:`;

    domainDocs.forEach((dom) => {
      const thisBadges = badgeDocs.filter((badge) => {
        return areSameId(badge.domain, dom._id);
      });
      if (thisBadges.length > 0) {
        txt = `${txt}\n\nDomain: ${dom.name}\nBadges:`;
        txt = `${txt}\n\n${formatBadgesTxt(thisBadges)}\n\n\n`;
      }
    });

    return txt;
  }

  switch (resource) {
    case Listings.badges:
      return await listBadges();

    case Listings.domains:
      return await listDomains();

    default:
      throw new Error(`Paladin failed to reveal list of: \`${resource}\``);
  }
}
