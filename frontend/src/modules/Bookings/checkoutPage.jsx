import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, axiosInstance } from '../Auth/authContext';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../Toast/toastContainer';
import { 
  CheckIcon, 
  XIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon,
  SpinnerIcon 
} from '../Shared/icons';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toasts, success, error: showError, removeToast } = useToast();

  // Datos de la reserva pasados desde TourDetailPage
  const [bookingData, setBookingData] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Formulario de contacto
  const [contactInfo, setContactInfo] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    special_requests: ''
  });

  useEffect(() => {
    // Verificar que hay datos de reserva
    if (!location.state?.bookingData) {
      showError('No hay información de reserva');
      navigate('/');
      return;
    }

    const data = location.state.bookingData;
    setBookingData(data);

    // Pre-llenar información del usuario si está logueado
    if (user) {
      setContactInfo({
        contact_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        contact_email: user.email,
        contact_phone: user.travelerprofile?.phone_number || '',
        special_requests: ''
      });
    }
  }, [location.state, user, navigate, showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmBooking = async () => {
    // Validaciones
    if (!contactInfo.contact_name.trim()) {
      showError('Por favor ingresa tu nombre completo');
      return;
    }

    if (!contactInfo.contact_email.trim()) {
      showError('Por favor ingresa tu email');
      return;
    }

    if (!contactInfo.contact_phone.trim()) {
      showError('Por favor ingresa tu teléfono');
      return;
    }

    setProcessing(true);

    try {
      // Preparar datos para el backend
      const payload = {
        tour_package: bookingData.tour.id,
        travel_date: bookingData.selectedDate,
        tickets_detail: bookingData.tickets,
        selected_extras: bookingData.variableExtras,
        ...contactInfo
      };

      console.log('Enviando reserva:', payload);

      const response = await axiosInstance.post('/bookings/', payload);

      console.log('Respuesta del servidor:', response.data);

      // Mostrar mensaje de éxito
      success('¡Reserva creada exitosamente!');
      success(`Tu código de reserva es: ${response.data.booking.booking_code}`);

      // Redirigir a la página de confirmación o historial
      setTimeout(() => {
        navigate('/my-trips', { 
          state: { 
            newBooking: response.data.booking 
          } 
        });
      }, 2000);

    } catch (err) {
      console.error('Error creando reserva:', err);
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.message || 
                       'Error al procesar la reserva';
      showError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerIcon className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  const { tour, selectedDate, tickets, variableExtras, total, totalPeople } = bookingData;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Confirmar Reserva
          </h1>
          <p className="text-gray-600">
            Estás a un paso de vivir una experiencia increíble
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Resumen */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Tour */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <MapPinIcon className="w-6 h-6 text-orange-500 mr-2" />
                Detalles del Tour
              </h2>
              
              <div className="flex gap-4">
                {/* Imagen */}
                {tour.images && tour.images.length > 0 && (
                  <img
                    src={tour.images[0].image}
                    alt={tour.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                
                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {tour.title}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {tour.state_destination}
                    </p>
                    <p className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(selectedDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="flex items-center">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      {totalPeople} {totalPeople === 1 ? 'persona' : 'personas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desglose de Tickets */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Desglose de Precios
              </h2>
              
              <div className="space-y-3">
                {/* Tickets */}
                {Object.entries(tickets).map(([type, quantity]) => {
                  if (quantity > 0) {
                    const price = tour.price_variations_with_commission?.[type] || tour.final_price;
                    const subtotal = parseFloat(price) * quantity;
                    
                    return (
                      <div key={type} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${parseFloat(price).toFixed(2)} × {quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          ${subtotal.toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Extras */}
                {variableExtras && Object.entries(variableExtras).map(([key, selected]) => {
                  if (selected && tour.extra_services_with_commission?.[key]) {
                    const pricePerPerson = parseFloat(tour.extra_services_with_commission[key]);
                    const subtotal = pricePerPerson * totalPeople;
                    
                    return (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${pricePerPerson.toFixed(2)} × {totalPeople} personas
                          </p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          ${subtotal.toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                  <p className="text-xl font-bold text-gray-800">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-orange-500">
                    ${total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Información de Contacto
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={contactInfo.contact_name}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={contactInfo.contact_email}
                    onChange={handleInputChange}
                    placeholder="juan@ejemplo.com"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={contactInfo.contact_phone}
                    onChange={handleInputChange}
                    placeholder="+58 412 123 4567"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitudes Especiales (Opcional)
                  </label>
                  <textarea
                    name="special_requests"
                    value={contactInfo.special_requests}
                    onChange={handleInputChange}
                    placeholder="Alergias, dietas especiales, necesidades de accesibilidad, etc."
                    rows="4"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Acciones */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Impuestos</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-orange-500">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                onClick={handleConfirmBooking}
                disabled={processing}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-300 flex items-center justify-center ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105'
                }`}
              >
                {processing ? (
                  <>
                    <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Confirmar Reserva
                  </>
                )}
              </button>

              {/* Nota */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Nota:</strong> Al confirmar, recibirás un email con tu código de reserva y los detalles del tour.
                </p>
              </div>

              {/* Botón Cancelar */}
              <button
                onClick={() => navigate(-1)}
                className="w-full mt-4 py-3 rounded-xl font-medium text-gray-600 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Volver al Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;