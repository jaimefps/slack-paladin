import { Db, MongoClient } from "mongodb";

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

export async function createDbSingleton(): Promise<Db> {
  const dbUrl = getDBUrl();
  const dbName = getDBName();
  const client = await MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // ensure we disconnect from Mongo
  // whenever Node is shut down:
  process.on("SIGINT", () => {
    client.close(() => {
      console.log("🔌 MongoDB disconnected on app termination 🔌");
      process.exit(0);
    });
  });
  // singleton connection to
  // paladin database:
  return client.db(dbName);
}
