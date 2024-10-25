import { ObjectId } from "mongodb";
import { User } from "../src/defs/models/user.model";
import { IUser, IJournal, ICategory } from "../src/defs/interfaces";

export const mockUnsavedUser = new User({
  username: "user1",
  email: "user1@example.com",
  password: "password1",
  resetPasswordTokenExpires: new Date(),
});

const getJournals = (numJournalsToGet: number, getSavedJournals: boolean) => {
  const journals = [];
  for (let i = 0; i < numJournalsToGet; i++) {
    const journal: {
      _id?: ObjectId;
      title: string;
      journal: string;
      date: string;
      category: string;
    } = {
      title: `Journal ${i} title`,
      journal: `Journal journal ${i} content.`,
      date: "1/02/2017",
      category: "My Journals",
    };

    if (getSavedJournals) {
      journal["_id"] = new ObjectId();
    }

    journals.push(journal);
  }

  return journals;
};

const getCategories = (
  numCategoriesToGet: number,
  getSavedCategories: boolean
) => {
  const categories = [];
  for (let i = 0; i < numCategoriesToGet; i++) {
    const category: {
      _id?: ObjectId;
      category: string;
      selected: boolean;
    } = {
      category: `Category ${i}`,

      selected: true,
    };

    if (getSavedCategories) {
      category["_id"] = new ObjectId();
    }

    categories.push(category);
  }

  return categories;
};

/**
  export const mockUsersWithJournals = getMockUsers({
    numUsersToGet: 2,
    numJournalsToGet: 1,
    numCategoriesToGet: 1,
    addMongoObjectIds: true,
  });
 */
export const getMockUsers = ({
  numUsersToGet,
  numJournalsToGet,
  numCategoriesToGet,
  addMongoObjectIds,
}: {
  numUsersToGet: number;
  numJournalsToGet: number;
  numCategoriesToGet: number;
  addMongoObjectIds: boolean; // If true, the returned users will have _id fields
}) => {
  const users = [];
  for (let i = 0; i < numUsersToGet; i++) {
    const user: {
      _id?: ObjectId;
      username: string;
      email: string;
      resetPasswordToken: string;
      resetPasswordExpires: string;
      verified: boolean;
      journals: {
        _id?: ObjectId;
        title: string;
        journal: string;
        date: string;
        category: string;
      }[];
      journalCategories: {
        _id?: ObjectId;
        category: string;
        selected: boolean;
      }[];
    } = {
      username: `user${i}`,
      email: `user${i}@example.com`,
      resetPasswordToken: `token${i}`,
      resetPasswordExpires: new Date().toLocaleString(),
      verified: true,
      journals:
        numJournalsToGet > 0
          ? getJournals(numJournalsToGet, addMongoObjectIds)
          : [],
      journalCategories: numCategoriesToGet
        ? getCategories(numCategoriesToGet, addMongoObjectIds)
        : [],
    };

    if (addMongoObjectIds) {
      user["_id"] = new ObjectId();
    }

    users.push(user);
  }
  return users;
};
