import { ObjectId } from "mongodb";
import { IJournal } from "../src/defs/interfaces";

export const mockJournal = {
  userId: new ObjectId(),
  journalId: new ObjectId(),
  title: "Test Journal",
  journal: "Test Journal",
  category: "Test Category",
};

export const mockJournals = [mockJournal, mockJournal, mockJournal];
