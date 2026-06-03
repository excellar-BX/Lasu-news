import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews,
} from "../../api/breakingNews";

// ── Delete modal ─────────────────────────────────────────────────────
const DeleteModal = ({ item, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-white border border-gray-200 rounded-2xl
                    shadow-2xl p-6 w-full max-w-sm animate-[slideInUp_200ms_ease]">
      <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center
                      justify-center mb-4">
        <svg className="w-5 h-5 text-red-500" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
               01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0
               00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">
        Delete Breaking News?
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        This action cannot be undone.
      </p>
      <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-5
                      border border-gray-100">
        <p className="text-xs text-gray-500 line-clamp-2">
          "{item?.content}"
        </p>
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200
                     text-xs font-semibold text-gray-600 hover:bg-gray-50
                     transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                     text-xs font-bold text-white transition-colors
                     disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {isLoading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none"
                viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Deleting…
            </>
          ) : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Status pill ──────────────────────────────────────────────────────
const StatusPill = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[10px] font-bold
                uppercase tracking-wider px-2.5 py-1 rounded-full
                ${active
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                  : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
                }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
      ${active ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}
    />
    {active ? "Live" : "Draft"}
  </span>
);

// ── Icon button ──────────────────────────────────────────────────────
const IconBtn = ({ onClick, disabled, title, danger, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-8 h-8 rounded-lg flex items-center justify-center
                transition-all active:scale-95 disabled:opacity-25
                disabled:pointer-events-none
                ${danger
                  ? "hover:bg-red-50 text-gray-300 hover:text-red-500"
                  : "hover:bg-gray-100 text-gray-300 hover:text-gray-600"
                }`}
  >
    {children}
  </button>
);

// ── Main component ───────────────────────────────────────────────────
const BreakingNewsAdmin = () => {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Toast ────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Query ────────────────────────────────────────────────────────
  const { data: breakingNews = [], isLoading } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: getAllBreakingNews,
  });

  // ── Mutations ────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createBreakingNews,
    onSuccess: () => {
      queryClient.invalidateQueries(["breakingNews"]);
      setNewContent("");
      setIsAdding(false);
      showToast("Breaking news published successfully");
    },
    onError: () => showToast("Failed to add item", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBreakingNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["breakingNews"]);
      setEditingItem(null);
      showToast("Item updated");
    },
    onError: () => showToast("Update failed", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBreakingNews,
    onSuccess: () => {
      queryClient.invalidateQueries(["breakingNews"]);
      setPendingDelete(null);
      showToast("Item deleted");
    },
    onError: () => showToast("Delete failed", "error"),
  });

  // ── Handlers ─────────────────────────────────────────────────────
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    createMutation.mutate({
      content: newContent.trim(),
      active: true,
      order: 0,
    });
  };

  const handleUpdate = (id, data) => updateMutation.mutate({ id, data });

  const handleToggleActive = (item) =>
    handleUpdate(item.id, { active: !item.active, order: item.order });

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
    const reordered = [...breakingNews];
    [reordered[index], reordered[index + direction]] = [
      reordered[index + direction],
      reordered[index],
    ];
    reordered.forEach((item, idx) =>
      handleUpdate(item.id, { ...item, order: idx })
    );
  };

  const activeCount = breakingNews.filter((n) => n.active).length;

  // ── Loading skeleton ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-14 w-16 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-14 w-16 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i}
            className="bg-white border border-gray-100 rounded-2xl p-5
                       flex items-center gap-4 animate-pulse shadow-sm">
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-8 h-8 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5
                      px-4 py-3 rounded-xl shadow-lg text-sm font-semibold
                      animate-[slideInUp_200ms_ease] border
                      ${toast.type === "error"
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
        >
          {toast.type === "error" ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* ── Delete modal ── */}
      {pendingDelete && (
        <DeleteModal
          item={pendingDelete}
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(pendingDelete.id)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className="space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-[#e63946]/10 rounded-xl flex
                              items-center justify-center">
                <svg className="w-4 h-4 text-[#e63946]" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                Breaking News
              </h1>
            </div>
            <p className="text-gray-400 text-sm pl-11">
              Manage the live ticker displayed across the site
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 bg-gray-50 border border-gray-100
                            rounded-xl text-center shadow-sm">
              <p className="text-lg font-black text-gray-900 leading-none">
                {breakingNews.length}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold
                            uppercase tracking-wider mt-0.5">
                Total
              </p>
            </div>
            <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-100
                            rounded-xl text-center shadow-sm">
              <p className="text-lg font-black text-emerald-600 leading-none">
                {activeCount}
              </p>
              <p className="text-[10px] text-emerald-500 font-semibold
                            uppercase tracking-wider mt-0.5">
                Live
              </p>
            </div>
          </div>
        </div>

        {/* ── Add form card ── */}
        <div className="bg-white border border-gray-100 rounded-2xl
                        overflow-hidden shadow-sm">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-4 flex items-center justify-center gap-2.5
                         text-sm font-semibold text-gray-400 hover:text-gray-600
                         hover:bg-gray-50 transition-all group"
            >
              <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center
                               justify-center group-hover:bg-[#e63946]/10
                               group-hover:text-[#e63946] transition-all">
                <svg className="w-3.5 h-3.5" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              Add Breaking News
            </button>
          ) : (
            <div className="p-5">
              {/* Form header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 bg-[#e63946]/10 rounded-lg flex
                                items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#e63946]" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-800">
                  New Breaking News
                </p>
              </div>

              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400
                                    mb-2 uppercase tracking-wider">
                    Content
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="e.g. LASU announces new academic calendar…"
                      className="w-full px-4 py-3 pr-16 bg-gray-50 border
                                 border-gray-200 rounded-xl text-sm text-gray-900
                                 placeholder:text-gray-300 focus:outline-none
                                 focus:border-[#e63946]/50 focus:bg-white
                                 focus:ring-4 focus:ring-[#e63946]/8
                                 transition-all"
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2
                                     text-xs text-gray-300 font-mono tabular-nums">
                      {newContent.length}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !newContent.trim()}
                    className="flex-1 py-2.5 bg-[#e63946] hover:bg-red-600
                               disabled:opacity-40 disabled:pointer-events-none
                               text-white text-sm font-bold rounded-xl
                               transition-all active:scale-[0.98] shadow-sm
                               shadow-red-100 flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none"
                          viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12"
                            r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Publishing…
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Publish
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setNewContent(""); }}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200
                               text-gray-500 hover:text-gray-700 text-sm
                               font-semibold rounded-xl transition-all
                               active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── List ── */}
        {breakingNews.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200
                          rounded-2xl py-16 text-center shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center
                            justify-center mx-auto mb-4 border border-gray-100">
              <svg className="w-7 h-7 text-gray-300" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-400">
              No breaking news yet
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Add your first item above to start the ticker
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {breakingNews.map((item, index) => (
              <div
                key={item.id}
                className={`group relative bg-white border rounded-2xl
                            overflow-hidden transition-all duration-200
                            shadow-sm hover:shadow-md
                            ${item.active
                              ? "border-gray-100 hover:border-gray-200"
                              : "border-gray-100 opacity-60 hover:opacity-90"
                            }`}
              >
                {/* Active indicator stripe */}
                {item.active && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5
                                  bg-gradient-to-b from-emerald-500
                                  to-emerald-300" />
                )}

                {editingItem?.id === item.id ? (
                  /* ── Edit mode ── */
                  <div className="p-4 pl-5">
                    <p className="text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-3">
                      Editing
                    </p>
                    <form onSubmit={handleSaveEdit} className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={editingItem.content}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              content: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 pr-14 bg-gray-50 border
                                     border-gray-200 rounded-xl text-sm
                                     text-gray-900 focus:outline-none
                                     focus:border-[#e63946]/50 focus:bg-white
                                     focus:ring-4 focus:ring-[#e63946]/8
                                     transition-all"
                          autoFocus
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2
                                         text-xs text-gray-300 font-mono">
                          {editingItem.content.length}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={updateMutation.isPending}
                          className="flex-1 py-2 bg-[#e63946] hover:bg-red-600
                                     disabled:opacity-40 text-white text-xs
                                     font-bold rounded-xl transition-all
                                     active:scale-[0.98] flex items-center
                                     justify-center gap-1.5"
                        >
                          {updateMutation.isPending ? (
                            <>
                              <svg className="w-3 h-3 animate-spin" fill="none"
                                viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12"
                                  r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Saving…
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                  strokeLinejoin="round" strokeWidth={2.5}
                                  d="M5 13l4 4L19 7" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="flex-1 py-2 bg-gray-100 hover:bg-gray-200
                                     text-gray-500 hover:text-gray-700 text-xs
                                     font-semibold rounded-xl transition-all
                                     active:scale-[0.98]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="flex items-center gap-3 p-4 pl-5">
                    {/* Order badge */}
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex
                                    items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-gray-400
                                       tabular-nums">
                        {index + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium
                                    leading-snug truncate">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <StatusPill active={item.active} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0
                                    group-hover:opacity-100 transition-opacity
                                    duration-150 flex-shrink-0">
                      {/* Move up */}
                      <IconBtn
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </IconBtn>

                      {/* Move down */}
                      <IconBtn
                        onClick={() => moveItem(index, 1)}
                        disabled={index === breakingNews.length - 1}
                        title="Move down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </IconBtn>

                      {/* Divider */}
                      <div className="w-px h-4 bg-gray-200 mx-1" />

                      {/* Toggle active */}
                      <IconBtn
                        onClick={() => handleToggleActive(item)}
                        title={item.active ? "Set to Draft" : "Go Live"}
                      >
                        {item.active ? (
                          <svg className="w-3.5 h-3.5 text-emerald-500"
                            fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728
                                 12.728A9 9 0 015.636 5.636m12.728
                                 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </IconBtn>

                      {/* Edit */}
                      <IconBtn
                        onClick={() => setEditingItem(item)}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2
                               2 0 002-2v-5m-1.414-9.414a2 2 0
                               112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </IconBtn>

                      {/* Delete */}
                      <IconBtn
                        onClick={() => setPendingDelete(item)}
                        title="Delete"
                        danger
                      >
                        <svg className="w-3.5 h-3.5" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2
                               2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1
                               1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </IconBtn>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Info strip ── */}
        <div className="flex items-start gap-3 bg-blue-50 border
                        border-blue-100 rounded-xl p-4">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center
                          justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-700 mb-0.5">
              How it works
            </p>
            <p className="text-xs text-blue-500/80 leading-relaxed">
              Only <span className="font-semibold text-blue-700">Live</span>{" "}
              items appear in the navigation ticker, separated by{" "}
              <span className="font-mono text-blue-700">●</span> dots.
              Use the arrows to reorder. Changes save instantly.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default BreakingNewsAdmin;