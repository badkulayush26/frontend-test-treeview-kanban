# Frontend Test – Tree View and Kanban Board

A small React + TypeScript + Vite application that implements two reusable components commonly used in frontend interviews:

- A hierarchical **Tree View** with lazy loading and drag‑and‑drop
- A **Kanban Board** with draggable cards across columns

The project uses:

- React 18 + TypeScript
- Vite
- Tailwind CSS for layout and page‑level styling

---

## 1. Getting Started

### Install dependencies

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173` or `http://localhost:5174`).

### Type checking

```bash
npm run typecheck
```

This runs `tsc --noEmit` to ensure the TypeScript types are valid.

---

## 2. Project Structure

Important files and folders:

- `src/App.tsx` – page layout; renders both components side by side
- `src/components/TreeView.tsx` – Tree View implementation
- `src/components/KanbanBoard.tsx` – Kanban board implementation
- `src/mocks/treeData.ts` – initial mock data for the tree
- `src/mocks/kanbanData.ts` – initial mock data for the board
- `src/index.css` – Tailwind base/imports and minimal global styles

---

## 3. Tree View Component

**Location:** `src/components/TreeView.tsx`  
**Type:** `TreeView` React component

### Data model

```ts
type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
  hasChildren?: boolean; // used for lazy loading
};
```

### Features

- **Expand / Collapse**
  - Parent nodes can be expanded and collapsed.
  - Expand icon (`▾` / `▸`) changes based on state.

- **Add Node**
  - “Add root node” button creates a new root node.
  - Each node has a `+` button to add a child.
  - Uses a simple prompt to capture the new node name.

- **Remove Node**
  - Each node has a delete button.
  - Removing a node deletes its entire subtree after confirmation.

- **Lazy Loading**
  - Nodes can declare `hasChildren: true` without actual `children`.
  - On first expand, a small `setTimeout` simulates an async API call and generates child nodes.

- **Edit Node Name**
  - Double‑click the node label to enable inline editing.
  - `Enter` or blur saves; `Escape` cancels.

- **Drag & Drop**
  - Uses native HTML5 drag & drop.
  - Drag a node and drop it on another node to move it as a child.
  - Drop in the root drop zone to move a node back to root level.

---

## 4. Kanban Board Component

**Location:** `src/components/KanbanBoard.tsx`  
**Type:** `KanbanBoard` React component

### Data model

```ts
type Card = {
  id: string;
  title: string;
};

type ColumnId = "todo" | "in-progress" | "done";

type Column = {
  id: ColumnId;
  title: string;
  cards: Card[];
};
```

### Features

- **Three default columns**
  - Todo
  - In Progress
  - Done
  - Initial cards are defined in `src/mocks/kanbanData.ts`.

- **Add / Delete Cards**
  - “+” button in the header and “+ Add Card” button inside the column both add new cards.
  - Each card has a delete icon to remove it from the column.

- **Drag & Drop Between Columns**
  - Cards are draggable using HTML5 drag & drop.
  - Drop on a column to move the card to that column (appended at the end).

- **Reorder Cards Within a Column**
  - Dropping a card directly on top of another card inserts it before the target card.
  - Works both within the same column and between different columns.

- **Inline Edit**
  - Double‑click a card title to switch to an input.
  - `Enter` or blur saves changes; `Escape` cancels.

- **Responsive Layout**
  - Uses a flexible layout with horizontal scrolling on narrow viewports.
  - The main page layout stacks vertically on small screens.

---

## 5. How to Reuse Components

Both components are exported from `src/index.ts`:

```ts
export { default as TreeView } from "./components/TreeView";
export { default as KanbanBoard } from "./components/KanbanBoard";
export { initialTreeData } from "./mocks/treeData";
export { initialKanbanColumns } from "./mocks/kanbanData";
```

In the host application:

```tsx
import {
  TreeView,
  KanbanBoard,
  initialTreeData,
  initialKanbanColumns,
} from "./index";

function App() {
  return (
    <>
      <TreeView data={initialTreeData} />
      <KanbanBoard columns={initialKanbanColumns} />
    </>
  );
}
```

You can plug in your own data by matching the `TreeNode` and `Column`/`Card` types.
