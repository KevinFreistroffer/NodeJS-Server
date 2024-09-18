import { ObjectId } from "mongodb";

export const mockUser = {
  _id: new ObjectId(),
  username: "user1",
  email: "user1@example.com",
  resetPasswordToken: "token1",
  resetPasswordExpires: new Date().toLocaleString(),
  verified: true,
  journals: [
    {
      _id: new ObjectId(),
      title: "Journal 1 title",
      entry: `Journal entry 1 content.`,
      date: "1/02/2017",
      category: "My Journals",
    },
  ],
  journalCategories: [
    {
      _id: new ObjectId(),
      category: "My Journals",
      selected: true,
    },
  ],
};

export const mockNewUsers = [
  {
    _id: new ObjectId(),
    username: "user1",
    email: "user1@example.com",
    resetPasswordToken: "token1",
    resetPasswordExpires: new Date().toLocaleString(),
    verified: true,
    journals: [],
    journalCategories: [],
  },
  {
    _id: new ObjectId(),
    username: "user2",
    email: "user2@example.com",
    resetPasswordToken: "token2",
    resetPasswordExpires: new Date().toLocaleString(),
    verified: true,
    journals: [],
    journalCategories: [],
  },
];

export const mockUsersWithJournals = [
  {
    ...mockNewUsers[0],
    journals: [
      {
        _id: new ObjectId(),
        title: "Journal 1 title",
        entry: `Journal entry 1 content.`,
        date: "1/02/2017",
        category: "My Journals",
      },
    ],
    journalCategories: [
      {
        _id: new ObjectId(),
        category: "My Journals",
        selected: true,
      },
    ],
  },
  {
    ...mockNewUsers[1],
    journals: [
      {
        _id: new ObjectId(),
        title: "Journal 2 title",
        entry: `Journal entry 2 content.`,
        date: "1/02/2017",
        category: "My Journals",
      },
    ],
    journalCategories: [
      {
        _id: new ObjectId(),
        category: "My Journals",
        selected: true,
      },
    ],
  },
];
