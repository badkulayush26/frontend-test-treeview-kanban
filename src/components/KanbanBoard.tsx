import React, { useCallback, useState } from "react";

export type Card = {
  id: string;
  title: string;
};

export type ColumnId = "todo" | "in-progress" | "done";

export type Column = {
  id: ColumnId;
  title: string;
  cards: Card[];
};

type KanbanBoardProps = {
  columns: Column[];
  onChange?: (next: Column[]) => void;
};

type DragCardInfo = {
  cardId: string;
  fromColumnId: ColumnId;
};

const DRAG_CARD_TYPE = "KANBAN_CARD";

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, onChange }) => {
  const [state, setState] = useState<Column[]>(columns);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const notifyChange = useCallback(
    (next: Column[]) => {
      setState(next);
      if (onChange) {
        onChange(next);
      }
    },
    [onChange]
  );

  const handleAddCard = useCallback(
    (columnId: ColumnId) => {
      const title = window.prompt("Card title");
      if (!title) {
        return;
      }
      const id = `${columnId}-${Date.now()}`;
      const next = state.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, { id, title }] }
          : col
      );
      notifyChange(next);
    },
    [notifyChange, state]
  );

  const handleDeleteCard = useCallback(
    (columnId: ColumnId, cardId: string) => {
      const next = state.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col
      );
      notifyChange(next);
    },
    [notifyChange, state]
  );

  const handleCardTitleChange = useCallback(
    (cardId: string, title: string) => {
      const next = state.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, title } : card
        ),
      }));
      notifyChange(next);
    },
    [notifyChange, state]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent, columnId: ColumnId, cardId: string) => {
      const payload: DragCardInfo = { cardId, fromColumnId: columnId };
      event.dataTransfer.setData(DRAG_CARD_TYPE, JSON.stringify(payload));
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(DRAG_CARD_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, targetColumnId: ColumnId) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData(DRAG_CARD_TYPE);
      if (!raw) {
        return;
      }
      const payload = JSON.parse(raw) as DragCardInfo;
      const { cardId, fromColumnId } = payload;
      if (!cardId) {
        return;
      }
      if (fromColumnId === targetColumnId) {
        return;
      }
      const next: Column[] = state.map((col) => {
        if (col.id === fromColumnId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === targetColumnId) {
          const movingCard = state
            .find((c) => c.id === fromColumnId)
            ?.cards.find((c) => c.id === cardId);
          if (!movingCard) {
            return col;
          }
          return { ...col, cards: [...col.cards, movingCard] };
        }
        return col;
      });
      notifyChange(next);
    },
    [notifyChange, state]
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        overflowX: "auto",
        padding: 8,
        boxSizing: "border-box",
      }}
      data-kanban-root
    >
      {state.map((column) => (
        <div
          key={column.id}
          style={{
            minWidth: 260,
            maxWidth: 320,
            background: "#f7f7f7",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            flex: 1,
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {column.title}{" "}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#666",
                }}
              >
                {column.cards.length}
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleAddCard(column.id)}
              style={{
                borderRadius: 6,
                border: "none",
                background: "#1e8fff",
                color: "#fff",
                width: 24,
                height: 24,
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleAddCard(column.id)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px dashed #ccc",
              background: "transparent",
              fontSize: 13,
              textAlign: "left",
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            + Add Card
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {column.cards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, column.id, card.id)}
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: "8px 10px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 4,
                    borderRadius: 2,
                    alignSelf: "stretch",
                    background:
                      column.id === "todo"
                        ? "#1e8fff"
                        : column.id === "in-progress"
                        ? "#ffb020"
                        : "#27ae60",
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    cursor: "text",
                  }}
                  onDoubleClick={() => setEditingCardId(card.id)}
                >
                  {editingCardId === card.id ? (
                    <input
                      autoFocus
                      defaultValue={card.title}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value && value !== card.title) {
                          handleCardTitleChange(card.id, value);
                        }
                        setEditingCardId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                        if (e.key === "Escape") {
                          setEditingCardId(null);
                        }
                      }}
                      style={{
                        width: "100%",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        padding: "2px 4px",
                        fontSize: 13,
                      }}
                    />
                  ) : (
                    card.title
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCard(column.id, card.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#c00",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
export default KanbanBoard;
