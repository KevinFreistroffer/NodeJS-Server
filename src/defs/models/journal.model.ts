import { ICategory } from "../interfaces";

export class Journal {
  title: string;
  entry: string;
  categories: ICategory[];
  selected: boolean;
  favorite: boolean;
  sentimentScore: number;

  constructor(
    title: string,
    entry: string,
    categories: ICategory[],
    selected: boolean,
    favorite: boolean,
    sentimentScore: number
  ) {
    this.title = title;
    this.entry = entry;
    this.categories = categories;
    this.selected = selected;
    this.favorite = favorite;
    this.sentimentScore = sentimentScore;
  }
}
