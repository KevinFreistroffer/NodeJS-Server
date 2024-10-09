import { ObjectId } from "mongodb";
import { IEntry } from "../src/defs/interfaces";

export const mockEntry = {
  userId: new ObjectId(),
  entryId: new ObjectId(),
  title: "Test Journal",
  journal: "Test Journal",
  category: "Test Category",
};

export const mockEntries = [mockEntry, mockEntry, mockEntry];
