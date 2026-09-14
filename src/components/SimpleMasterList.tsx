import { FormEvent, useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../api/client';

interface Item {
  id: string;
  name: string;
  is_active: boolean;
}

export function SimpleMasterList({ endpoint, label }: { endpoint: string; label: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setItems(data.items);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await api.post(endpoint, { name: name.trim() });
      setName('');
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, `Gagal menambah ${label}`));
    }
  }

  async function toggleActive(item: Item) {
    setSavingId(item.id);
    try {
      await api.patch(`${endpoint}/${item.id}`, { isActive: !item.is_active });
      await load();
    } catch (err) {
      alert(apiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Tambah ${label} baru`}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 rounded-lg">
          Tambah
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
              <span className={`text-sm ${item.is_active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                {item.name}
              </span>
              <button
                onClick={() => toggleActive(item)}
                disabled={savingId === item.id}
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  item.is_active
                    ? 'text-green-700 border-green-300 bg-green-50'
                    : 'text-slate-500 border-slate-300 bg-slate-50'
                }`}
              >
                {item.is_active ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-400 px-4 py-3">Belum ada data.</p>}
        </div>
      )}
    </div>
  );
}
