import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, ListChecks, FolderCheck, UserCog, ShieldCheck, HardHat } from 'lucide-react';

const linkBase =
  'flex flex-col items-center justify-center gap-0.5 text-xs font-medium px-2 py-2 rounded-lg transition-colors';
const linkActive = 'text-blue-600 bg-blue-50';
const linkInactive = 'text-slate-500 hover:text-slate-700 hover:bg-slate-100';

export function Layout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/tickets', label: 'Tickets', icon: Wrench },
    { to: '/my-tickets', label: 'My Tickets', icon: ListChecks },
    { to: '/closed', label: 'Closed', icon: FolderCheck },
  ];
  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/admin', label: 'Admin', icon: UserCog });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Mobile: profile avatar + name + role, top-left */}
          <div className="flex sm:hidden items-center gap-2 min-w-0">
            {user?.role === 'ADMIN' ? (
              <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />
            ) : (
              <HardHat className="w-7 h-7 text-blue-600 shrink-0" />
            )}
            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">
                {user?.fullName}
              </div>
              <div className="text-[11px] text-slate-500 capitalize">
                {user?.role === 'ADMIN' ? 'Admin' : 'Teknisi'}
              </div>
            </div>
          </div>

          {/* Desktop: app title */}
          <div className="hidden sm:block font-bold text-slate-800 text-sm sm:text-base">
            Network Service Ticketing
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:inline">
              {user?.fullName} <span className="text-slate-400">({user?.role})</span>
            </span>
            <button
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Desktop nav */}
        <nav className="hidden sm:flex max-w-5xl mx-auto px-4 gap-1 pb-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 pb-24 sm:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 flex justify-around px-1 py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive} flex-1`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
