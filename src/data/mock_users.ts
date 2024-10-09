"use strict";

export const users = [
  {
    username: "admin",
    password: "password",
    email: "admin@gmail.com",
    verified: true,
    journals: [
      {
        title: "A lot of Text testing height of views",
        journal: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
				atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
				culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
				expedita distinctio.`,
        date: "1/02/2017",
        id: 1,
        category: "My Journals",
      },
      {
        title: "Reflections on a Busy Week",
        journal: "This week has been incredibly hectic...",
        date: "3/15/2023",
        id: 2,
        category: "Life Stuff",
      },
      {
        title: "New Recipe: Spicy Lentil Soup",
        journal: "Ingredients: 1 cup red lentils, 2 carrots...",
        date: "5/22/2023",
        id: 3,
        category: "Cooking Recipes",
      },
      {
        title: "Morning Meditation Insights",
        journal: "Today's meditation session was particularly enlightening...",
        date: "7/10/2023",
        id: 4,
        category: "Mindfulness",
      },
      {
        title: "Project Brainstorming",
        journal: "Ideas for the upcoming team project...",
        date: "9/5/2023",
        id: 5,
        category: "Work Notes",
      },
      {
        title: "Book Review: 'The Alchemist'",
        journal: "Paulo Coelho's 'The Alchemist' is a profound journey...",
        date: "10/18/2023",
        id: 6,
        category: "Book Reviews",
      },
      {
        title: "Fitness Progress Update",
        journal: "Today I reached a new personal best in my 5K run...",
        date: "11/30/2023",
        id: 7,
        category: "Health & Fitness",
      },
      {
        title: "Travel Plans: Japan 2024",
        journal: "Itinerary ideas for our upcoming trip to Japan...",
        date: "1/5/2024",
        id: 8,
        category: "Travel",
      },
      {
        title: "Reflections on Personal Growth",
        journal:
          "Looking back on the past year, I've noticed significant changes...",
        date: "2/14/2024",
        id: 9,
        category: "My Journals",
      },
      {
        title: "New Coding Challenge",
        journal: "Today I started a new coding challenge on algorithms...",
        date: "3/22/2024",
        id: 10,
        category: "Programming",
      },
    ],
    journalCategories: [
      { category: "My Journals", selected: false },
      { category: "Life Stuff", selected: false },
      { category: "Cooking Recipes", selected: false },
      { category: "Mindfulness", selected: false },
      { category: "Work Notes", selected: false },
      { category: "Book Reviews", selected: false },
      { category: "Health & Fitness", selected: false },
      { category: "Travel", selected: false },
      { category: "Programming", selected: false },
    ],
  },
  {
    username: "nojournals",
    password: "nojournals",
    email: "nojournals.freistroffer@gmail.com",
    verified: true,
    journals: [],
    journalCategories: ["My Journals"],
  },
];
