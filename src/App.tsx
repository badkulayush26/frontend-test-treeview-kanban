import "./App.css";
import {
  KanbanBoard,
  TreeView,
  initialKanbanColumns,
  initialTreeData,
} from "./index";

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Front-End Test Playground</h1>
        <p>Tree View and Kanban board implemented with React and TypeScript.</p>
      </header>
      <main className="app-layout">
        <section className="app-section">
          <h2>Tree View</h2>
          <TreeView data={initialTreeData} />
        </section>
        <section className="app-section">
          <h2>Kanban Board</h2>
          <KanbanBoard columns={initialKanbanColumns} />
        </section>
      </main>
    </div>
  );
}

export default App;
