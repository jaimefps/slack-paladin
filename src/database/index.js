function isValidUser(userId) {
  console.log("TODO: Implement userId validation");
  return !!userId;
}

const mockDomainsCollection = {
  domain1: "domain1",
  domain2: "domain2",
  domain3: "domain3",
};

const mockBadgesCollection = {
  winner: {
    domains: [mockDomainsCollection.domain1, mockDomainsCollection.domain2],
  },
  loser: {
    domains: [mockDomainsCollection.domain1, mockDomainsCollection.domain3],
  },
};

const mockUsersCollection = {
  mockSlackUUID: {
    badges: [],
    createAt: "",
    updatedAt: "",
    sudo: false,
    domains: [
      {
        name: "domain1",
        role: "admin",
      },
      {
        name: "domain2",
        role: "paladin",
      },
    ],
  },
};

const db = {
  async findOrCreateUser(userId) {
    if (!isValidUser(userId))
      throw new Error("Invalid userId when db.findOrCreateUser():" + userId);
    let thisUser = mockUsersCollection[userId];
    if (!thisUser) {
      const time = Date.now();
      const newUser = {
        roles: [],
        badges: [],
        createAt: time,
        updatedAt: time,
      };
      mockUsersCollection[userId] = newUser;
      thisUser = mockUsersCollection[userId];
    }
    console.log("thisUser:", thisUser);
    return thisUser;
  },
  async findBadgeData(badgeName) {
    return mockBadgesCollection[badgeName] || null;
  },
};

module.exports = {
  db,
  isValidUser,
};
