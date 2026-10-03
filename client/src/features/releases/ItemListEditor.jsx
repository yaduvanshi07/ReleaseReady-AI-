import React from 'react';
import { Plus, Trash2, Tag, FileText, AlertCircle } from 'lucide-react';
import { ITEM_CATEGORIES } from '../../lib/constants';
import { StatusBadge } from '../../components/StatusBadge';

export function ItemListEditor({ items = [], onChange, categoryFilter = null, title = "Items" }) {
  const displayedItems = categoryFilter 
    ? items.filter(i => i.category === categoryFilter)
    : items;

  const handleAddItem = (defaultCategory = 'feature') => {
    const nextNum = items.length + 1;
    const newItem = {
      id: `tmp_${Date.now()}_${Math.random()}`,
      code: `REL-${String(nextNum).padStart(3, '0')}`,
      category: categoryFilter || defaultCategory,
      title: '',
      description: '',
      displayOrder: items.length
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (indexInAll, field, value) => {
    const updated = [...items];
    updated[indexInAll] = { ...updated[indexInAll], [field]: value };
    onChange(updated);
  };

  const handleRemoveItem = (indexInAll) => {
    const updated = items.filter((_, idx) => idx !== indexInAll);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <span>{title}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {displayedItems.length}
          </span>
        </h4>
        <button
          type="button"
          onClick={() => handleAddItem(categoryFilter || 'feature')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-saffron-800 bg-saffron-50 hover:bg-saffron-100 border border-saffron-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      {displayedItems.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-surface-border text-center bg-surface-subtle">
          <p className="text-xs text-ink-muted">No items in this section yet.</p>
          <button
            type="button"
            onClick={() => handleAddItem(categoryFilter || 'feature')}
            className="mt-2 text-xs font-semibold text-saffron-700 hover:text-saffron-800"
          >
            + Add first item
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            if (categoryFilter && item.category !== categoryFilter) return null;

            return (
              <div
                key={item.id || item.code || idx}
                className="p-3.5 rounded-lg border border-surface-border bg-white shadow-xs space-y-2.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shrink-0">
                    {item.code || `REL-${String(idx + 1).padStart(3, '0')}`}
                  </div>

                  {!categoryFilter && (
                    <select
                      value={item.category}
                      onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                      className="text-xs rounded-md border-surface-border px-2 py-1 bg-surface-subtle text-ink-secondary focus:ring-1 focus:ring-saffron-500 font-medium"
                    >
                      {ITEM_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  )}

                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                    placeholder="Item title or headline summary (e.g. Added OAuth2 Login)..."
                    className="flex-1 text-xs sm:text-sm font-medium rounded-md border border-surface-border px-2.5 py-1.5 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={item.description || ''}
                  onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                  placeholder="Detailed description, technical context, or rationale (optional)..."
                  rows={2}
                  className="w-full text-xs rounded-md border border-surface-border px-2.5 py-1.5 text-ink-secondary placeholder:text-slate-400 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
