import { MongoClient } from "mongodb";

export function getDBUrl() {
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

export function getDBName(): string {
  switch (process.env.NODE_ENV) {
    case "development":
      return "paladin-dev";
    // case "test":
    //   return "paladin-test";
    // case "production":
    //   return "paladin-prod";
    default:
      throw new Error("Failed to pick database name");
  }
}

export async function createClient() {
  const url = getDBUrl();
  return MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
