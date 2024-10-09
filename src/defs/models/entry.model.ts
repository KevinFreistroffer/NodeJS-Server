export class Journal {
  title: string;
  journal: string;
  category: string;
  date: string;
  selected: boolean;
  favorite: boolean;

  constructor(
    title: string,
    journal: string,
    category: string,
    date: string,
    selected: boolean,
    favorite: boolean
  ) {
    this.title = title;
    this.journal = journal;
    this.category = category;
    this.date = date;
    this.selected = selected;
    this.favorite = false;
  }
}
