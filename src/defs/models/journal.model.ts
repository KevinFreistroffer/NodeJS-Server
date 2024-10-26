export class Journal {
  title: string;
  entry: string;
  category: string;
  date: string;
  selected: boolean;
  favorite: boolean;

  constructor(
    title: string,
    entry: string,
    category: string,
    date: string,
    selected: boolean,
    favorite: boolean
  ) {
    this.title = title;
    this.entry = entry;
    this.category = category;
    this.date = date;
    this.selected = selected;
    this.favorite = false;
  }
}
