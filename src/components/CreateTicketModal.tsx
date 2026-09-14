import { FormEvent, useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../api/client';
import { Location, Priority } from '../types';

export function CreateTicketModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [locationId, setLocationId] = useState('');
  const [issueType, setIssueType] = useState('');
  const [priorityId, setPriorityId] = useState('');
  const [detail, setDetail] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [locRes, prioRes] = await Promise.all([
        api.get('/master/locations'),
        api.get('/master/priorities'),
      ]);
      setLocations(locRes.data.items.filter((l: Location) => l.is_active));
      setPriorities(
        prioRes.data.items
          .filter((p: Priority) => p.is_active)
          .sort((a: Priority, b: Priority) => a.level - b.level)
      );
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!locationId || !issueType.trim() || !priorityId) {
      setError('Lokasi, Jenis Gangguan, dan Priority wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('locationId', locationId);
      formData.append('issueType', issueType.trim());
      formData.append('priorityId', priorityId);
      if (detail.trim()) formData.append('detail', detail.trim());
      if (photo) formData.append('photo', photo);

      await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreated();
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal membuat tiket'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Buat Tiket Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih lokasi</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Jenis Gangguan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              required
              placeholder="Contoh: Koneksi terputus"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priorityId}
              onChange={(e) => setPriorityId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih priority</option>
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detail (opsional)</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 text-sm font-semibold"
            >
              {submitting ? 'Menyimpan...' : 'Buat Tiket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
