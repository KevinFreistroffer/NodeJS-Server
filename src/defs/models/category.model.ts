export class Category {
  category: string;
  selected: boolean;

  constructor(category: string, selected: boolean) {
    this.category = category;
    this.selected = selected;
  }
}
