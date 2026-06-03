import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews,
} from "../../api/breakingNews";

const BreakingNewsAdmin = () => {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: breakingNews = [], isLoading } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: getAllBreakingNews,
  });

  const createMutation = useMutation({
    mutationFn: createBreakingNews,
    onSuccess: () => {
      queryClient.invalidateQueries(["breakingNews"]);
      setNewContent("");
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBreakingNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["breakingNews"]);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBreakingNews,
    onSuccess: () => {
      queryClient.invalidateQueries(["breakingNews"]);
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    createMutation.mutate({ content: newContent, active: true, order: 0 });
  };

  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, data });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this breaking news?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (item) => {
    handleUpdate(item.id, { active: !item.active, order: item.order });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    handleUpdate(editingItem.id, {
      content: editingItem.content,
      active: editingItem.active,
      order: editingItem.order,
    });
  };

  const moveItem = (index, direction) => {
    const newOrder = [...breakingNews];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + direction];
    newOrder[index + direction] = temp;

    // Update order values
    newOrder.forEach((item, idx) => {
      handleUpdate(item.id, { ...item, order: idx });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#e63946] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Breaking News</h1>
          <p className="text-white/50 text-sm mt-1">
            Manage breaking news items displayed in the navigation ticker
          </p>
        </div>
      </div>

      {/* Add New Form */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border-2 border-dashed border-white/20 rounded-lg text-white/50 hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Breaking News
          </button>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Content
              </label>
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Enter breaking news content..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#e63946] transition-colors"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isLoading || !newContent.trim()}
                className="flex-1 bg-[#e63946] hover:bg-red-700 disabled:bg-white/10 disabled:text-white/30 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                {createMutation.isLoading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewContent("");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {breakingNews.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-white/50">No breaking news items yet</p>
            <p className="text-white/30 text-sm mt-1">Add your first breaking news item above</p>
          </div>
        ) : (
          breakingNews.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 ${
                !item.active ? "opacity-50" : ""
              }`}
            >
              {editingItem?.id === item.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <input
                    type="text"
                    value={editingItem.content}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, content: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#e63946] transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updateMutation.isLoading}
                      className="flex-1 bg-[#e63946] hover:bg-red-700 disabled:bg-white/10 disabled:text-white/30 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {updateMutation.isLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{item.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span className={item.active ? "text-green-400" : "text-red-400"}>
                        {item.active ? "Active" : "Inactive"}
                      </span>
                      <span>Order: {item.order}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Move Up */}
                    <button
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/50 transition-colors"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    {/* Move Down */}
                    <button
                      onClick={() => moveItem(index, 1)}
                      disabled={index === breakingNews.length - 1}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/50 transition-colors"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(item)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      title={item.active ? "Deactivate" : "Activate"}
                    >
                      {item.active ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isLoading}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 disabled:opacity-30 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          <strong className="font-semibold">Tip:</strong> Breaking news items are displayed in the navigation ticker with ● separators. Only active items are shown to users.
        </p>
      </div>
    </div>
  );
};

export default BreakingNewsAdmin;
