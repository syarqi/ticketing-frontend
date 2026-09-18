import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiErrorMessage } from '../api/client';
import { Ticket } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDayHeader(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function groupByDay(tickets: Ticket[]) {
  const groups: { dayKey: string; label: string; items: Ticket[] }[] = [];
  for (const t of tickets) {
    const iso = t.closedAt ?? t.createdAt;
    const dayKey = new Date(iso).toISOString().slice(0, 10);
    let group = groups.find((g) => g.dayKey === dayKey);
    if (!group) {
      group = { dayKey, label: formatDayHeader(iso), items: [] };
      groups.push(group);
    }
    group.items.push(t);
  }
  return groups;
}

export function Closed() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ticketId, setTicketId] = useState('');
  const [location, setLocation] = useState('');
  const [issueType, setIssueType] = useState('');
  const [priority, setPriority] = useState('');
  const [technician, setTechnician] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (ticketId) params.ticketId = ticketId;
      if (location) params.location = location;
      if (issueType) params.issueType = issueType;
      if (priority) params.priority = priority;
      if (technician) params.technician = technician;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const { data } = await api.get('/tickets/closed', { params });
      setTickets(data.tickets);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal memuat arsip'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    load();
  }

  function handleReset() {
    setTicketId('');
    setLocation('');
    setIssueType('');
    setPriority('');
    setTechnician('');
    setDateFrom('');
    setDateTo('');
    setTimeout(load, 0);
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Closed Archive</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input placeholder="Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input placeholder="Lokasi" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input placeholder="Jenis gangguan" value={issueType} onChange={(e) => setIssueType(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input placeholder="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input placeholder="Teknisi" value={technician} onChange={(e) => setTechnician(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <div className="flex gap-1">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-2 text-xs w-full" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-2 text-xs w-full" />
        </div>
        <div className="col-span-2 sm:col-span-3 flex gap-2 pt-1">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg py-2">
            Cari
          </button>
          <button type="button" onClick={handleReset} className="flex-1 border border-slate-300 text-slate-600 text-sm font-semibold rounded-lg py-2 hover:bg-slate-50">
            Reset
          </button>
        </div>
      </form>

      {loading && <p className="text-sm text-slate-500">Memuat...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && tickets.length === 0 && <p className="text-sm text-slate-500">Tidak ada tiket yang cocok.</p>}

      <div className="space-y-5">
        {groupByDay(tickets).map((group) => (
          <div key={group.dayKey}>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 sticky top-14 bg-slate-50/95 backdrop-blur py-1">
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.items.map((t) => (
                <Link
                  key={t.id}
                  to={`/tickets/${t.id}`}
                  className="block bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500">{t.id}</span>
                    <PriorityBadge name={t.priority.name} color={t.priority.color} />
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">{t.location.name} — {t.issueType}</div>
                  <div className="text-xs text-slate-500">
                    {t.assignedTo?.fullName} · ditutup {t.closedAt ? formatDate(t.closedAt) : '-'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
