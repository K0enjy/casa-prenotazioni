import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Errore nel caricamento delle prenotazioni');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      const booking = bookings.find((b) => {
        const start = new Date(b.dataInizio);
        const end = new Date(b.dataFine);
        return date >= start && date < end;
      });

      if (booking) {
        return booking.userId === user.id ? 'my-booking' : 'other-booking';
      }
    }
    return null;
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const booking = bookings.find((b) => {
        const start = new Date(b.dataInizio);
        const end = new Date(b.dataFine);
        return date >= start && date < end;
      });

      if (booking) {
        return (
          <div className="booking-marker" title={`${booking.userNome}: ${booking.note || ''}`}>
            {booking.userNome.split(' ')[0]}
          </div>
        );
      }
    }
    return null;
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const [startDate, endDate] = selectedDates;

      // Aggiungere un giorno alla data di fine per includerla
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

      await bookingsAPI.create(
        startDate.toISOString(),
        adjustedEndDate.toISOString(),
        note || null
      );

      await loadBookings();
      setShowBookingForm(false);
      setNote('');
      setSelectedDates([new Date(), new Date()]);
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Errore nella creazione della prenotazione'
      );
    }

    setFormLoading(false);
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
      return;
    }

    try {
      await bookingsAPI.delete(id);
      await loadBookings();
    } catch (err) {
      alert('Errore nell\'eliminazione della prenotazione');
    }
  };

  const myBookings = bookings.filter((b) => b.userId === user.id);
  const otherBookings = bookings.filter((b) => b.userId !== user.id);

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Casa in Montagna - Prenotazioni</h1>
          <p>Benvenuto, {user.nome}!</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'Admin' && (
            <button onClick={() => navigate('/admin')} className="btn-secondary">
              Pannello Admin
            </button>
          )}
          <button onClick={handleLogout} className="btn-secondary">
            Esci
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <div className="calendar-section">
          <h2>Calendario Prenotazioni</h2>
          <div className="calendar-legend">
            <span className="legend-item">
              <span className="legend-color my-booking-color"></span> Tue Prenotazioni
            </span>
            <span className="legend-item">
              <span className="legend-color other-booking-color"></span> Altri
            </span>
          </div>
          <Calendar
            selectRange
            onChange={setSelectedDates}
            value={selectedDates}
            tileClassName={getTileClassName}
            tileContent={getTileContent}
            minDate={new Date()}
          />
          <button
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
          >
            {showBookingForm ? 'Annulla' : 'Nuova Prenotazione'}
          </button>

          {showBookingForm && (
            <form onSubmit={handleCreateBooking} className="booking-form">
              <h3>Nuova Prenotazione</h3>
              {formError && <div className="error-message">{formError}</div>}

              <div className="form-group">
                <label>Date selezionate:</label>
                <p>
                  Dal {selectedDates[0].toLocaleDateString('it-IT')} al{' '}
                  {selectedDates[1].toLocaleDateString('it-IT')}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="note">Note (opzionale)</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Aggiungi delle note alla prenotazione..."
                  rows="3"
                />
              </div>

              <button type="submit" disabled={formLoading} className="btn-primary">
                {formLoading ? 'Creazione in corso...' : 'Conferma Prenotazione'}
              </button>
            </form>
          )}
        </div>

        <div className="bookings-section">
          <div className="my-bookings">
            <h2>Le Mie Prenotazioni</h2>
            {myBookings.length === 0 ? (
              <p>Non hai ancora prenotazioni.</p>
            ) : (
              <div className="bookings-list">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="booking-card my">
                    <div className="booking-info">
                      <strong>
                        {new Date(booking.dataInizio).toLocaleDateString('it-IT')} -{' '}
                        {new Date(booking.dataFine).toLocaleDateString('it-IT')}
                      </strong>
                      {booking.note && <p className="booking-note">{booking.note}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="btn-danger"
                    >
                      Elimina
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="other-bookings">
            <h2>Altre Prenotazioni</h2>
            {otherBookings.length === 0 ? (
              <p>Nessun altro ha prenotazioni.</p>
            ) : (
              <div className="bookings-list">
                {otherBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-info">
                      <strong>{booking.userNome}</strong>
                      <p>
                        {new Date(booking.dataInizio).toLocaleDateString('it-IT')} -{' '}
                        {new Date(booking.dataFine).toLocaleDateString('it-IT')}
                      </p>
                      {booking.note && <p className="booking-note">{booking.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
