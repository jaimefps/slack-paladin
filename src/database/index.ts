import { MongoClient } from "mongodb";
import {
  DomainCollection,
  BadgeCollection,
  UserCollection,
  ActorDoc,
} from "../types";

function getDbUri() {
  switch (process.env.NODE_ENV) {
    case "development":
      return process.env.DB_URL_DEV;
    // case "test":
    //   return process.env.DB_URL_TEST;
    // case "production":
    //   return process.env.DB_URL_PROD;
    default:
      throw new Error("Failed to pick database uri");
  }
}

const client = new MongoClient(getDbUri(), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect(async (err) => {
  if (err) console.log("DB ERROR:", err);
  const teams = client.db("paladin-dev").collection("teams");
  const thisTeam = await teams.findOne({ slackid: "T019P7ZBUBF" });
  console.log("thisTeam", thisTeam);
  // perform actions on the collection object
  client.close();
});

const mockDomainsCollection: DomainCollection = {
  domain1: "domain1",
  domain2: "domain2",
  domain3: "domain3",
};

const mockBadgesCollection: BadgeCollection = {
  winner: {
    points: 5,
    domains: [mockDomainsCollection.domain1, mockDomainsCollection.domain2],
  },
  loser: {
    points: 1,
    domains: [mockDomainsCollection.domain1, mockDomainsCollection.domain3],
  },
};

const mockUsersCollection: UserCollection = {
  mockSlackUUID: {
    badges: ["loser"],
    domains: [
      { name: "domain1", role: "admin" },
      { name: "domain2", role: "paladin" },
    ],
  },
};

export function isValidUser(userId: string): boolean {
  console.log("TODO: Implement userId validation");
  return userId.slice(0, 4) === "U01A" && userId.length === 11;
}

export const db = {
  async grantBadgeToUser(userId: string, badge: string) {
    mockUsersCollection[userId].badges.push(badge);
    return mockUsersCollection[userId];
  },

  async findBadgeData(badgeName: string) {
    return mockBadgesCollection[badgeName] || null;
  },

  async findOrCreateUser(userId: string): Promise<ActorDoc> {
    if (!isValidUser(userId))
      throw new Error("Invalid userId when verifying user");
    let thisUser = mockUsersCollection[userId];
    if (!thisUser) {
      console.warn("hardcoded domain in user");
      const mockDomain = { name: "domain1", role: "admin" };
      const newUser: ActorDoc = { badges: [], domains: [mockDomain] };
      mockUsersCollection[userId] = newUser;
      thisUser = mockUsersCollection[userId];
    }
    console.log("thisUser:", thisUser);
    return thisUser;
  },
};
