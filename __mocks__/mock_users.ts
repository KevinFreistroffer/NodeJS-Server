import { ObjectId } from "mongodb";
import { User } from "../src/defs/models/user.model";
import { IUser, IEntry, ICategory } from "../src/defs/interfaces";

export const mockUnsavedUser = new User(
  "user1",
  "user1@example.com",
  "password1"
);

const getEntries = (numEntriesToGet: number, getSavedEntries: boolean) => {
  const journals = [];
  for (let i = 0; i < numEntriesToGet; i++) {
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

    if (getSavedEntries) {
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
  export const mockUsersWithEntries = getMockUsers({
    numUsersToGet: 2,
    numEntriesToGet: 1,
    numCategoriesToGet: 1,
    addMongoObjectIds: true,
  });
 */
export const getMockUsers = ({
  numUsersToGet,
  numEntriesToGet,
  numCategoriesToGet,
  addMongoObjectIds,
}: {
  numUsersToGet: number;
  numEntriesToGet: number;
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
      entryCategories: {
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
        numEntriesToGet > 0
          ? getEntries(numEntriesToGet, addMongoObjectIds)
          : [],
      entryCategories: numCategoriesToGet
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
