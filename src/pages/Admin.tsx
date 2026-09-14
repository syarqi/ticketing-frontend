import { useState } from 'react';
import { SimpleMasterList } from '../components/SimpleMasterList';
import { PrioritiesAdmin } from './admin/PrioritiesAdmin';
import { UsersAdmin } from './admin/UsersAdmin';

type Tab = 'locations' | 'priorities' | 'update-types' | 'users';

const TABS: { key: Tab; label: string }[] = [
  { key: 'locations', label: 'Lokasi' },
  { key: 'priorities', label: 'Priority' },
  { key: 'update-types', label: 'Update Type' },
  { key: 'users', label: 'Users' },
];

export function Admin() {
  const [tab, setTab] = useState<Tab>('locations');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Admin — Master Data</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-lg ${
              tab === t.key ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'locations' && <SimpleMasterList endpoint="/master/locations" label="lokasi" />}
      {tab === 'priorities' && <PrioritiesAdmin />}
      {tab === 'update-types' && <SimpleMasterList endpoint="/master/update-types" label="update type" />}
      {tab === 'users' && <UsersAdmin />}
    </div>
  );
}
