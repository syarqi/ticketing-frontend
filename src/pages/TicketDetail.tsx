import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, apiErrorMessage } from '../api/client';
import { Ticket, TicketUpdateEntry, UpdateType } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { useAuth } from '../context/AuthContext';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [updates, setUpdates] = useState<TicketUpdateEntry[]>([]);
  const [updateTypes, setUpdateTypes] = useState<UpdateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updateTypeId, setUpdateTypeId] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);
  const [closing, setClosing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data.ticket);
      setUpdates(data.updates);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal memuat detail tiket'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    api.get('/master/update-types').then(({ data }) => {
      setUpdateTypes(data.items.filter((u: UpdateType) => u.is_active));
    });
  }, [load]);

  const isOwner = ticket?.assignedTo?.id === user?.id;
  const canManage = ticket?.status === 'IN_PROGRESS' && (isOwner || user?.role === 'ADMIN');

  async function handleTake() {
    if (!id) return;
    setTaking(true);
    try {
      await api.post(`/tickets/${id}/take`);
      await load();
    } catch (err) {
      alert(apiErrorMessage(err, 'Gagal mengambil tiket'));
    } finally {
      setTaking(false);
    }
  }

  async function handleAddUpdate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!updateTypeId) {
      setFormError('Pilih jenis update terlebih dahulu');
      return;
    }
    if (!id) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('updateTypeId', updateTypeId);
      if (note.trim()) formData.append('note', note.trim());
      if (photo) formData.append('photo', photo);

      await api.post(`/tickets/${id}/updates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUpdateTypeId('');
      setNote('');
      setPhoto(null);
      await load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Gagal menyimpan update'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose() {
    if (!id) return;
    if (!confirm('Tutup tiket ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setClosing(true);
    try {
      await api.post(`/tickets/${id}/close`);
      await load();
    } catch (err) {
      alert(apiErrorMessage(err, 'Gagal menutup tiket'));
    } finally {
      setClosing(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (error || !ticket) return <p className="text-sm text-red-600">{error ?? 'Tiket tidak ditemukan'}</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 mb-3 hover:text-slate-700">
        ← Kembali
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-4">
        <div className="flex items-start justify-between mb-2">
          <span className="font-mono text-sm text-slate-500">{ticket.id}</span>
          <PriorityBadge name={ticket.priority.name} color={ticket.priority.color} />
        </div>
        <h1 className="text-lg font-bold text-slate-800">{ticket.location.name}</h1>
        <p className="text-sm text-slate-600 mb-3">{ticket.issueType}</p>

        {ticket.detail && (
          <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mb-3 whitespace-pre-wrap">
            {ticket.detail}
          </p>
        )}

        {ticket.initialAttachments && ticket.initialAttachments.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {ticket.initialAttachments.map((a) => (
              <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
                <img src={a.url} alt={a.originalName} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
              </a>
            ))}
          </div>
        )}

        <div className="text-xs text-slate-500 space-y-1">
          <div>
            Status: <span className="font-semibold">{ticket.status.replace('_', ' ')}</span>
          </div>
          <div>Dibuat oleh {ticket.createdBy.fullName} — {formatDate(ticket.createdAt)}</div>
          {ticket.assignedTo && <div>Ditangani oleh {ticket.assignedTo.fullName}</div>}
          {ticket.closedAt && <div>Ditutup {formatDate(ticket.closedAt)}</div>}
        </div>

        {ticket.status === 'OPEN' && (
          <button
            onClick={handleTake}
            disabled={taking}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg py-2.5"
          >
            {taking ? 'Memproses...' : 'AMBIL'}
          </button>
        )}
      </div>

      {/* Timeline */}
      <h2 className="text-sm font-bold text-slate-700 mb-2">Riwayat Update</h2>
      <div className="space-y-3 mb-4">
        {updates.length === 0 && <p className="text-sm text-slate-400">Belum ada update.</p>}
        {updates.map((u) => (
          <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-800">{u.updateType?.name ?? '—'}</span>
              <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
            </div>
            <div className="text-xs text-slate-500 mb-1">oleh {u.user.fullName}</div>
            {u.note && <p className="text-sm text-slate-700 whitespace-pre-wrap">{u.note}</p>}
            {u.attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {u.attachments.map((a) => (
                  <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
                    <img src={a.url} alt={a.originalName} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Update form / close, only for the assigned technician (or admin) while in progress */}
      {canManage && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Tambah Update</h2>
          <form onSubmit={handleAddUpdate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Update <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {updateTypes.map((ut) => (
                  <button
                    type="button"
                    key={ut.id}
                    onClick={() => setUpdateTypeId(ut.id)}
                    className={`text-xs font-medium px-3 py-2 rounded-lg border ${
                      updateTypeId === ut.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {ut.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan tambahan (opsional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Foto (opsional)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
            </div>

            {formError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg py-2.5"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Update'}
            </button>
          </form>

          <button
            onClick={handleClose}
            disabled={closing}
            className="w-full mt-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-semibold text-sm rounded-lg py-2.5"
          >
            {closing ? 'Memproses...' : 'Tutup Tiket (CLOSED)'}
          </button>
        </div>
      )}
    </div>
  );
}
