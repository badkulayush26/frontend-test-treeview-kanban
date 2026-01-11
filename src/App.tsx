import {
  KanbanBoard,
  TreeView,
  initialKanbanColumns,
  initialTreeData,
} from "./index";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-start justify-center p-6">
      <div className="w-full max-w-6xl bg-slate-900/70 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Front-End Test Playground
          </h1>
          <p className="text-sm text-slate-300">
            Tree View and Kanban board implemented with React and TypeScript.
          </p>
        </header>
        <main className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
          <section className="space-y-3">
            <h2 className="text-lg font-medium">Tree View</h2>
            <TreeView data={initialTreeData} />
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium">Kanban Board</h2>
            <KanbanBoard columns={initialKanbanColumns} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
