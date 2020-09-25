import {
  CascadingData,
  DomainDoc,
  DomainRole,
  UnearthIntention,
  UserRole,
} from "../../types";
import { DB_COLLECTIONS, transactionOpts } from "../../constants";

export async function handleUnearth(
  { dbSingleton, dbClient, event: { team }, actor }: CascadingData,
  { domain }: UnearthIntention
): Promise<string> {
  let domainDoc: DomainDoc;

  const adminDoms = actor.domains.filter((dr) => dr.role === UserRole.admin);
  if (adminDoms.length >= 3) {
    return `You cannot unearth more domains. You are already an Admin in ${adminDoms.length} domains.`;
  }

  const session = dbClient.startSession();

  try {
    await session.withTransaction(async () => {
      domainDoc = await dbSingleton
        .collection(DB_COLLECTIONS.domains)
        .findOne({ name: domain }, { session });

      if (domainDoc) {
        throw new Error(
          `A domain already exists with the name of: \`${domain}\``
        );
      }

      const newDomain = await dbSingleton
        .collection(DB_COLLECTIONS.domains)
        .insertOne(
          {
            name: domain,
            slackTeam: team as string,
          } as DomainDoc,
          { session }
        );

      const domains: DomainRole[] = [
        ...actor.domains,
        {
          role: UserRole.admin,
          id: newDomain.insertedId,
        },
      ];

      // actor that creates a new domain
      // is set to be a UserRole.admin of that domain.
      await dbSingleton
        .collection(DB_COLLECTIONS.users)
        .findOneAndUpdate(
          { _id: actor._id },
          { $set: { domains } },
          { session }
        );
    }, transactionOpts);
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to create domain: \`${domain}\``);
  } finally {
    await session.endSession();
  }

  return `Paladin unearthed a new domain: \`${domain}\`!`;
}
