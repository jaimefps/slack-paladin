import { MongoClient } from "mongodb";

export function getDbUri() {
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

export const client = new MongoClient(getDbUri(), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// client.connect(async (err) => {
//   if (err) console.log("DB ERROR:", err);
//   const teams = client.db("paladin-dev").collection("teams");
//   const thisTeam = await teams.findOne({ slackid: "T019P7ZBUBF" });
//   console.log("thisTeam", thisTeam);
//   // perform actions on the collection object
//   client.close();
// });
