import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI, bookingsAPI } from '../services/api';
import './Admin.css';

function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    // Verificare che l'utente sia admin
    if (user && user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [usersRes, bookingsRes, statsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        bookingsAPI.getAll(),
        adminAPI.getStats(),
      ]);

      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      setError('Errore nel caricamento dei dati');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore nell\'eliminazione dell\'utente');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'User' : 'Admin';

    if (!window.confirm(`Sei sicuro di voler cambiare il ruolo in ${newRole}?`)) {
      return;
    }

    try {
      await adminAPI.changeUserRole(userId, newRole);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore nel cambio ruolo');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
      return;
    }

    try {
      await adminAPI.deleteAnyBooking(bookingId);
      await loadData();
    } catch (err) {
      alert('Errore nell\'eliminazione della prenotazione');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div>
          <h1>Pannello Amministratore</h1>
          <p>Benvenuto, {user.nome}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Dashboard
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Esci
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Utenti Totali</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Prenotazioni Totali</h3>
            <p className="stat-number">{stats.totalBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Prenotazioni Attive</h3>
            <p className="stat-number">{stats.activeBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Prenotazioni Passate</h3>
            <p className="stat-number">{stats.pastBookings}</p>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'users' ? 'tab-active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Gestione Utenti
        </button>
        <button
          className={activeTab === 'bookings' ? 'tab-active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          Gestione Prenotazioni
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Utenti Registrati</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Ruolo</th>
                  <th>Prenotazioni</th>
                  <th>Data Registrazione</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.numeroPrenotazioni}</td>
                    <td>{new Date(u.dataCreazione).toLocaleDateString('it-IT')}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleChangeRole(u.id, u.role)}
                        className="btn-small btn-info"
                        disabled={u.id === user.id}
                      >
                        {u.role === 'Admin' ? 'Rendi User' : 'Rendi Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn-small btn-danger"
                        disabled={u.id === user.id}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Tutte le Prenotazioni</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utente</th>
                  <th>Data Inizio</th>
                  <th>Data Fine</th>
                  <th>Note</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.userNome}</td>
                    <td>{new Date(b.dataInizio).toLocaleDateString('it-IT')}</td>
                    <td>{new Date(b.dataFine).toLocaleDateString('it-IT')}</td>
                    <td>{b.note || '-'}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="btn-small btn-danger"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
