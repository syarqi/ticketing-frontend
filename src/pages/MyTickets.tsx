import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, apiErrorMessage } from '../api/client';
import { Ticket } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

export function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tickets/mine');
      setTickets(data.tickets);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal memuat tiket'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">My Tickets</h1>

      {loading && <p className="text-sm text-slate-500">Memuat...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && tickets.length === 0 && (
        <p className="text-sm text-slate-500">Anda belum mengambil tiket apa pun.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tickets.map((t) => (
          <Link
            key={t.id}
            to={`/tickets/${t.id}`}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs text-slate-500">{t.id}</span>
              <PriorityBadge name={t.priority.name} color={t.priority.color} />
            </div>
            <div className="font-semibold text-slate-800">{t.location.name}</div>
            <div className="text-sm text-slate-600">{t.issueType}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
