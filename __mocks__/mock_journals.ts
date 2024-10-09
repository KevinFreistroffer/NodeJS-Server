import { ObjectId } from "mongodb";
import { IEntry } from "../src/defs/interfaces";

export const mockEntry = {
  userId: new ObjectId(),
  entryId: new ObjectId(),
  title: "Test Entry",
  entry: "Test Entry",
  category: "Test Category",
};

export const mockEntries = [mockEntry, mockEntry, mockEntry];
