import { Db, MongoClient } from "mongodb";

export function getDBUrl() {
  switch (process.env.NODE_ENV) {
    case "development":
      return process.env.DB_URL_DEV;
    default:
      throw new Error("Failed to pick database uri");
  }
}

export function getDBName(): string {
  switch (process.env.NODE_ENV) {
    case "development":
      return "paladin-dev";
    default:
      throw new Error("Failed to pick database name");
  }
}

export async function createDbSingleton(): Promise<Db> {
  const client = await MongoClient.connect(getDBUrl(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  process.on("SIGINT", () => {
    client.close(() => {
      console.log("🔌 MongoDB disconnected on app termination 🔌");
      process.exit(0);
    });
  });

  return client.db(getDBName());
}
