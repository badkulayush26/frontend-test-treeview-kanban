import React, { useCallback, useMemo, useState } from "react";

export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
  hasChildren?: boolean;
};

type TreeViewProps = {
  data: TreeNode[];
  onChange?: (next: TreeNode[]) => void;
};

type DragInfo = {
  nodeId: string;
};

const DRAG_TYPE = "TREE_NODE";

function cloneTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => ({
    ...n,
    children: n.children ? cloneTree(n.children) : undefined,
  }));
}

function removeNode(
  nodes: TreeNode[],
  nodeId: string
): { next: TreeNode[]; removed?: TreeNode } {
  const result: TreeNode[] = [];
  let removed: TreeNode | undefined;
  for (const node of nodes) {
    if (node.id === nodeId) {
      removed = node;
      continue;
    }
    if (node.children) {
      const { next, removed: childRemoved } = removeNode(node.children, nodeId);
      if (childRemoved) {
        removed = childRemoved;
      }
      result.push({ ...node, children: next });
    } else {
      result.push(node);
    }
  }
  return { next: result, removed };
}

function insertAsChild(
  nodes: TreeNode[],
  parentId: string | null,
  child: TreeNode
): TreeNode[] {
  if (parentId === null) {
    return [...nodes, child];
  }
  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = node.children ? [...node.children, child] : [child];
      return { ...node, children };
    }
    if (node.children) {
      return {
        ...node,
        children: insertAsChild(node.children, parentId, child),
      };
    }
    return node;
  });
}

function updateNodeLabel(
  nodes: TreeNode[],
  nodeId: string,
  label: string
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, label };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeLabel(node.children, nodeId, label),
      };
    }
    return node;
  });
}

function attachChildren(
  nodes: TreeNode[],
  nodeId: string,
  children: TreeNode[]
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, children };
    }
    if (node.children) {
      return {
        ...node,
        children: attachChildren(node.children, nodeId, children),
      };
    }
    return node;
  });
}

function generateChildren(parentId: string, depth: number): TreeNode[] {
  const count = 2;
  const letters = ["A", "B", "C", "D", "E"];
  const result: TreeNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const id = `${parentId}-${i + 1}`;
    const label = letters[(i + depth) % letters.length];
    result.push({
      id,
      label,
      hasChildren: depth < 3,
    });
  }
  return result;
}

const TreeView: React.FC<TreeViewProps> = ({ data, onChange }) => {
  const [tree, setTree] = useState<TreeNode[]>(() => cloneTree(data));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const notifyChange = useCallback(
    (next: TreeNode[]) => {
      setTree(next);
      if (onChange) {
        onChange(next);
      }
    },
    [onChange]
  );

  const toggleExpand = useCallback(
    (node: TreeNode) => {
      const nextExpanded = new Set(expanded);
      if (expanded.has(node.id)) {
        nextExpanded.delete(node.id);
        setExpanded(nextExpanded);
        return;
      }
      nextExpanded.add(node.id);
      setExpanded(nextExpanded);
      if (!node.children && node.hasChildren && !loading.has(node.id)) {
        const nextLoading = new Set(loading);
        nextLoading.add(node.id);
        setLoading(nextLoading);
        const depth = node.id.split("-").length;
        const generated = generateChildren(node.id, depth);
        setTimeout(() => {
          setLoading((prev) => {
            const copy = new Set(prev);
            copy.delete(node.id);
            return copy;
          });
          setTree((prevTree) => {
            const nextTree = attachChildren(prevTree, node.id, generated);
            if (onChange) {
              onChange(nextTree);
            }
            return nextTree;
          });
        }, 500);
      }
    },
    [expanded, loading, onChange]
  );

  const handleAddChild = useCallback(
    (parentId: string | null) => {
      const label = window.prompt("New node name");
      if (!label) {
        return;
      }
      const id = `${parentId ?? "root"}-${Date.now()}`;
      const nextNode: TreeNode = {
        id,
        label,
        hasChildren: false,
      };
      notifyChange(insertAsChild(tree, parentId, nextNode));
      if (parentId) {
        setExpanded((prev) => {
          const next = new Set(prev);
          next.add(parentId);
          return next;
        });
      }
    },
    [notifyChange, tree]
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      const confirmed = window.confirm("Delete this node and its children?");
      if (!confirmed) {
        return;
      }
      const { next } = removeNode(tree, nodeId);
      notifyChange(next);
      setExpanded((prev) => {
        const nextExpanded = new Set(prev);
        nextExpanded.delete(nodeId);
        return nextExpanded;
      });
    },
    [notifyChange, tree]
  );

  const handleLabelChange = useCallback(
    (nodeId: string, label: string) => {
      notifyChange(updateNodeLabel(tree, nodeId, label));
    },
    [notifyChange, tree]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent, nodeId: string) => {
      const payload: DragInfo = { nodeId };
      event.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload));
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent, targetId: string | null) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData(DRAG_TYPE);
      if (!raw) {
        return;
      }
      const payload = JSON.parse(raw) as DragInfo;
      if (payload.nodeId === targetId) {
        return;
      }
      const { next, removed } = removeNode(tree, payload.nodeId);
      if (!removed) {
        return;
      }
      const nextTree = insertAsChild(next, targetId, removed);
      notifyChange(nextTree);
      if (targetId) {
        setExpanded((prev) => {
          const nextExpanded = new Set(prev);
          nextExpanded.add(targetId);
          return nextExpanded;
        });
      }
    },
    [notifyChange, tree]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const renderNode = (node: TreeNode, depth: number) => {
    const isExpanded = expanded.has(node.id);
    const isLoading = loading.has(node.id);
    const canExpand =
      node.hasChildren || (node.children && node.children.length > 0);
    const showChildren =
      isExpanded && node.children && node.children.length > 0;

    const circleColor = depth === 0 ? "#1e8fff" : "#9be15d";

    return (
      <div key={node.id}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            margin: "4px 0",
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            background: "#fff",
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node.id)}
        >
          <button
            type="button"
            onClick={() => toggleExpand(node)}
            disabled={!canExpand}
            style={{
              width: 20,
              height: 20,
              marginRight: 8,
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: canExpand ? "pointer" : "default",
              fontSize: 14,
            }}
          >
            {canExpand ? (isExpanded ? "▾" : "▸") : ""}
          </button>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: circleColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 600,
              marginRight: 8,
            }}
          >
            {node.label[0] ?? "?"}
          </div>
          <div
            onDoubleClick={() => setEditingId(node.id)}
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}
          >
            {editingId === node.id ? (
              <input
                autoFocus
                defaultValue={node.label}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== node.label) {
                    handleLabelChange(node.id, value);
                  }
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                  if (e.key === "Escape") {
                    setEditingId(null);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "2px 4px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
            ) : (
              <span style={{ fontSize: 14 }}>{node.label}</span>
            )}
            <span style={{ fontSize: 12, color: "#999" }}>Level A</span>
          </div>
          <button
            type="button"
            onClick={() => handleAddChild(node.id)}
            style={{
              marginLeft: 8,
              width: 24,
              height: 24,
              borderRadius: 6,
              border: "none",
              background: "#f5f5f5",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleDelete(node.id)}
            style={{
              marginLeft: 4,
              width: 24,
              height: 24,
              borderRadius: 6,
              border: "none",
              background: "#ffe5e5",
              cursor: "pointer",
              fontSize: 14,
              color: "#c00",
            }}
          >
            ×
          </button>
          {isLoading && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#999" }}>
              Loading...
            </span>
          )}
        </div>
        {showChildren && (
          <div
            style={{
              marginLeft: 40,
              borderLeft: "1px dashed #ddd",
              paddingLeft: 16,
            }}
          >
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootDropZone = useMemo(
    () => (
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
        style={{ minHeight: 24 }}
      />
    ),
    [handleDragOver, handleDrop]
  );

  return (
    <div
      style={{
        background: "#fafafa",
        padding: 16,
        borderRadius: 12,
        border: "1px solid #eee",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16 }}>Tree View</h3>
        <button
          type="button"
          onClick={() => handleAddChild(null)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "none",
            background: "#1e8fff",
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Add root node
        </button>
      </div>
      {tree.map((node) => renderNode(node, 0))}
      {rootDropZone}
    </div>
  );
};
export default TreeView;
