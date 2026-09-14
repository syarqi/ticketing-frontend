import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Tickets } from './pages/Tickets';
import { MyTickets } from './pages/MyTickets';
import { TicketDetail } from './pages/TicketDetail';
import { Closed } from './pages/Closed';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/closed" element={<Closed />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/tickets" replace />} />
      </Routes>
    </AuthProvider>
  );
}
