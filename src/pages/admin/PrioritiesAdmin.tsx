import { useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../../api/client';
import { Priority } from '../../types';
import { PriorityBadge } from '../../components/PriorityBadge';

const COLORS = ['red', 'yellow', 'green', 'blue'];

export function PrioritiesAdmin() {
  const [items, setItems] = useState<Priority[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/master/priorities');
      setItems(data.items.sort((a: Priority, b: Priority) => a.level - b.level));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(item: Priority) {
    try {
      await api.patch(`/master/priorities/${item.id}`, { isActive: !item.is_active });
      await load();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  async function changeColor(item: Priority, color: string) {
    try {
      await api.patch(`/master/priorities/${item.id}`, { color });
      await load();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Memuat...</p>;

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        Urutan Critical &gt; High &gt; Normal &gt; Low bersifat tetap sesuai level. Warna dapat disesuaikan.
      </p>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-white gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-5">{p.level}</span>
              <PriorityBadge name={p.name} color={p.color} />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={p.color}
                onChange={(e) => changeColor(p, e.target.value)}
                className="text-xs border border-slate-300 rounded-md px-2 py-1"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={() => toggleActive(p)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  p.is_active
                    ? 'text-green-700 border-green-300 bg-green-50'
                    : 'text-slate-500 border-slate-300 bg-slate-50'
                }`}
              >
                {p.is_active ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
