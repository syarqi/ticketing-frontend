import { FormEvent, useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../../api/client';
import { AdminUser, Role } from '../../types';

export function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('TEKNISI');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await api.post('/users', { username: username.trim(), fullName: fullName.trim(), password, role });
      setUsername('');
      setFullName('');
      setPassword('');
      setRole('TEKNISI');
      await load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Gagal membuat user'));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(u: AdminUser) {
    try {
      await api.patch(`/users/${u.id}`, { isActive: !u.is_active });
      await load();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-700">Tambah User</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm col-span-2 sm:col-span-1"
          />
          <input
            placeholder="Nama Lengkap"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm col-span-2 sm:col-span-1"
          />
          <input
            placeholder="Password (min 8 karakter)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm col-span-2 sm:col-span-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm col-span-2 sm:col-span-1"
          >
            <option value="TEKNISI">Teknisi</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2"
        >
          {submitting ? 'Menyimpan...' : 'Tambah User'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-2.5 bg-white gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {u.full_name} <span className="text-xs text-slate-400 font-normal">@{u.username}</span>
                </div>
                <div className="text-xs text-slate-500">{u.role}</div>
              </div>
              <button
                onClick={() => toggleActive(u)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border shrink-0 ${
                  u.is_active
                    ? 'text-green-700 border-green-300 bg-green-50'
                    : 'text-slate-500 border-slate-300 bg-slate-50'
                }`}
              >
                {u.is_active ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
