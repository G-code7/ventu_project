import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, axiosInstance } from '../Auth/authContext';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../Toast/toastContainer';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  XIcon,
  CheckIcon,
  SpinnerIcon,
  AlertIcon
} from '../Shared/icons';

function MyTripsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toasts, success, error: showError, removeToast } = useToast();

  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // Mostrar mensaje si viene de una nueva reserva
    if (location.state?.newBooking) {
      success('¡Reserva creada exitosamente!');
    }

    fetchMyTrips();
  }, [location.state]);

  const fetchMyTrips = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/bookings/my_trips/');
      
      setUpcomingTrips(response.data.upcoming_trips || []);
      setPastTrips(response.data.past_trips || []);
    } catch (err) {
      console.error('Error cargando reservas:', err);
      showError('Error al cargar tus reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    setCancellingId(bookingId);

    try {
      await axiosInstance.post(`/bookings/${bookingId}/cancel/`, {
        cancellation_reason: 'Cancelado por el usuario'
      });

      success('Reserva cancelada exitosamente');
      
      // Recargar las reservas
      fetchMyTrips();
    } catch (err) {
      console.error('Error cancelando reserva:', err);
      const errorMsg = err.response?.data?.error || 'Error al cancelar la reserva';
      showError(errorMsg);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        label: 'Pendiente'
      },
      CONFIRMED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        label: 'Confirmada'
      },
      CANCELLED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        label: 'Cancelada'
      },
      COMPLETED: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        label: 'Completada'
      }
    };

    const badge = badges[status] || badges.PENDING;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const BookingCard = ({ booking, isPast = false }) => {
    const isCancelling = cancellingId === booking.id;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Imagen */}
          {booking.tour_image && (
            <div className="md:w-64 h-48 md:h-auto">
              <img
                src={booking.tour_image}
                alt={booking.tour_title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Contenido */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {booking.tour_title}
                </h3>
                {getStatusBadge(booking.status)}
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-500">
                  ${parseFloat(booking.total_amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Código: {booking.booking_code}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-2 text-orange-500" />
                <span>{booking.tour_destination}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <CalendarIcon className="w-5 h-5 mr-2 text-orange-500" />
                <span>
                  {new Date(booking.travel_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <UsersIcon className="w-5 h-5 mr-2 text-orange-500" />
                <span>{booking.total_people} {booking.total_people === 1 ? 'persona' : 'personas'}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <CheckIcon className="w-5 h-5 mr-2 text-orange-500" />
                <span>
                  Reservado el{' '}
                  {new Date(booking.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate(`/tours/${booking.tour_package || booking.id}`)}
                className="flex-1 py-2 px-4 rounded-lg bg-orange-100 text-orange-600 font-medium hover:bg-orange-200 transition-colors"
              >
                Ver Detalles del Tour
              </button>

              {booking.can_be_cancelled && !isPast && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  disabled={isCancelling}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCancelling
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {isCancelling ? (
                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <XIcon className="w-5 h-5 inline mr-1" />
                      Cancelar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <SpinnerIcon className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus viajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mis Viajes
          </h1>
          <p className="text-gray-600">
            Gestiona todas tus reservas y aventuras
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-1 font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Próximos Viajes ({upcomingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 px-1 font-semibold transition-all ${
              activeTab === 'past'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Historial ({pastTrips.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'upcoming' && (
            <>
              {upcomingTrips.length > 0 ? (
                upcomingTrips.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isPast={false} />
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-12 h-12 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No tienes viajes programados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ¡Es hora de planear tu próxima aventura!
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Explorar Tours
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'past' && (
            <>
              {pastTrips.length > 0 ? (
                pastTrips.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isPast={true} />
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No tienes historial de viajes
                  </h3>
                  <p className="text-gray-600">
                    Tus viajes completados y cancelados aparecerán aquí
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTripsPage;