import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import { api, apiErrorMessage } from '../api/client';
import { Ticket } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { CreateTicketModal } from '../components/CreateTicketModal';

export function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [takingId, setTakingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tickets');
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

  async function handleTake(id: string) {
    setTakingId(id);
    try {
      await api.post(`/tickets/${id}/take`);
      await load();
    } catch (err) {
      alert(apiErrorMessage(err, 'Gagal mengambil tiket'));
    } finally {
      setTakingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Tickets</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Buat Tiket
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Memuat...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && tickets.length === 0 && (
        <p className="text-sm text-slate-500">Tidak ada tiket OPEN atau IN PROGRESS.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tickets.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs text-slate-500">{t.id}</span>
              <PriorityBadge name={t.priority.name} color={t.priority.color} />
            </div>
            <div className="font-semibold text-slate-800">{t.location.name}</div>
            <div className="text-sm text-slate-600 mb-3">{t.issueType}</div>

            {t.status === 'IN_PROGRESS' ? (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <HardHat className="w-3.5 h-3.5" /> {t.assignedTo?.fullName} — <span className="font-medium">IN PROGRESS</span>
                </span>
                <Link
                  to={`/tickets/${t.id}`}
                  className="text-xs font-semibold text-blue-600 border border-blue-200 rounded-md px-3 py-1.5 hover:bg-blue-50 transition-colors"
                >
                  DETAIL
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to={`/tickets/${t.id}`}
                  className="flex-1 text-center text-xs font-semibold text-slate-600 border border-slate-300 rounded-md px-3 py-2 hover:bg-slate-50 transition-colors"
                >
                  DETAIL
                </Link>
                <button
                  onClick={() => handleTake(t.id)}
                  disabled={takingId === t.id}
                  className="flex-1 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-md px-3 py-2 transition-colors"
                >
                  {takingId === t.id ? '...' : 'AMBIL'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}
