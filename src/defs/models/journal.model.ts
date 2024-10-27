export class Journal {
  title: string;
  entry: string;
  category: string;
  date: string;
  selected: boolean;
  favorite: boolean;
  sentimentScore: number;

  constructor(
    title: string,
    entry: string,
    category: string,
    date: string,
    selected: boolean,
    favorite: boolean,
    sentimentScore: number
  ) {
    this.title = title;
    this.entry = entry;
    this.category = category;
    this.date = date;
    this.selected = selected;
    this.favorite = favorite;
    this.sentimentScore = sentimentScore;
  }
}
