import { ObjectId } from "mongodb";
import { IJournal } from "../src/defs/interfaces";

export const mockJournal = {
  userId: new ObjectId(),
  journalId: new ObjectId(),
  title: "Test Journal",
  entry: "Test Entry",
  category: "Test Category",
};

export const mockJournals = [mockJournal, mockJournal, mockJournal];
