import { Column } from "../components/KanbanBoard";

export const initialKanbanColumns: Column[] = [
  {
    id: "todo",
    title: "Todo",
    cards: [
      { id: "todo-1", title: "Create initial project plan" },
      { id: "todo-2", title: "Design landing page" },
      { id: "todo-3", title: "Review codebase structure" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      { id: "in-progress-1", title: "Implement authentication" },
      { id: "in-progress-2", title: "Set up database schema" },
      { id: "in-progress-3", title: "Fix navbar bugs" },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      { id: "done-1", title: "Organize project repository" },
      { id: "done-2", title: "Write API documentation" },
    ],
  },
];

