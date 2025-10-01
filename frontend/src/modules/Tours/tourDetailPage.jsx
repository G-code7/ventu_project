import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartIcon, ShareIcon, MapPinIcon, CalendarIcon, UserGroupIcon, CheckIcon, XIcon } from '../Shared/icons';
import StarRating from './starRating';
import { axiosInstance } from '../Auth/authContext';

function TourDetailPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [tickets, setTickets] = useState({
    adults: 1,
    seniors: 0,
    children: 0
  });
  const [extras, setExtras] = useState({
    meals: false,
    travel_insurance: false
  });

  // Cargar datos del tour
  useEffect(() => {
    const fetchTourData = async () => {
      try {
        const response = await axiosInstance.get(`/tours/${tourId}/`);
        setTour(response.data);
      } catch (err) {
        console.error('Error cargando tour:', err);
        setError('No se pudo cargar la información del tour');
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [tourId]);

  // Manejar cambios en tickets
  const handleTicketChange = (type, value) => {
    setTickets(prev => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0)
    }));
  };

  // Manejar cambios en extras
  const handleExtraChange = (extra) => {
    setExtras(prev => ({
      ...prev,
      [extra]: !prev[extra]
    }));
  };

  // CORRECCIÓN: Función robusta para obtener precio como número
  const getPriceAsNumber = () => {
    if (!tour) return 0;
    
    let price = tour.final_price || tour.base_price;
    
    // Si el precio es string, convertir a número
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^\d.-]/g, ''));
    }
    
    // Si no es un número válido, retornar 0
    return isNaN(price) ? 0 : price;
  };

  // CORRECCIÓN: Función para obtener precio formateado
  const getFormattedPrice = () => {
    const price = getPriceAsNumber();
    return price.toFixed(0);
  };

  // CORRECCIÓN: Calcular precio total
  const calculateTotal = () => {
    const basePrice = getPriceAsNumber();
    let total = 0;
    
    // Precio por tickets
    total += tickets.adults * basePrice;
    total += tickets.seniors * (basePrice * 0.7);
    total += tickets.children * (basePrice * 0.5);
    
    // Extras
    if (extras.meals) total += 40;
    if (extras.travel_insurance) total += 40;
    
    return total;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="animate-pulse">Cargando información del tour...</div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="text-red-500">{error || 'Tour no encontrado'}</div>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Obtener imagen principal
  const mainImage = tour.images?.find(img => img.is_main_image) || tour.images?.[0];
  const galleryImages = tour.images?.filter(img => !img.is_main_image) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <span className="hover:text-orange-500 cursor-pointer">Experiencias</span>
            <span className="mx-2">›</span>
            <span className="hover:text-orange-500 cursor-pointer">Tours</span>
            <span className="mx-2">›</span>
            <span className="text-gray-800">{tour.destination || tour.location}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Contenido del tour */}
          <div className="lg:col-span-2">
            {/* Header del tour */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Bestseller
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Free cancellation
                </span>
                {/* CORRECCIÓN: Usar index como fallback para key */}
                {tour.tags?.map((tag, index) => (
                  <span 
                    key={tag?.id || `tag-${index}`}
                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">{tour.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <StarRating rating={4.8} />
                  <span className="ml-2 font-bold text-gray-700">4.8</span>
                  <span className="ml-1 text-gray-600">(269 reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-1" />
                  <span>{tour.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500">
                  <ShareIcon className="w-5 h-5" />
                  <span>Compartir</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-500">
                  <HeartIcon className="w-5 h-5" />
                  <span>Lista de deseados</span>
                </button>
              </div>
            </div>

            {/* Galería de imágenes */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mainImage && (
                  <div className="md:col-span-2">
                    <img
                      src={mainImage.image}
                      alt={tour.title}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {/* CORRECCIÓN: Usar index como fallback para key */}
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <img
                      key={image?.id || `gallery-${index}`}
                      src={image.image}
                      alt={`${tour.title} ${index + 1}`}
                      className="w-full h-36 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
              <button className="mt-4 text-orange-500 font-semibold hover:text-orange-600">
                Ver todas las fotos
              </button>
            </div>

            {/* Información básica */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Información del tour</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Duración</p>
                    <p className="font-semibold">{tour.duration_days} Días y {tour.duration_days - 1 || 1} Noches</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Entorno</p>
                    <p className="font-semibold">Festivo, Con música</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tamaño del grupo</p>
                    <p className="font-semibold">10 personas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Descripción general</h2>
              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>

            {/* Qué incluye y no incluye */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Qué incluye</h3>
                  <div className="space-y-2">
                    {/* CORRECCIÓN: Usar index como fallback para key */}
                    {tour.what_is_included?.map((item, index) => (
                      <div key={item?.id || `included-${index}`} className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Qué no incluye</h3>
                  <div className="space-y-2">
                    {/* CORRECCIÓN: Usar index como fallback para key */}
                    {tour.what_is_not_included?.map((item, index) => (
                      <div key={item?.id || `not-included-${index}`} className="flex items-center gap-3">
                        <XIcon className="w-5 h-5 text-red-500" />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerario */}
            {tour.itinerary && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Itinerario</h2>
                <div className="space-y-6">
                  {/* CORRECCIÓN: Key mejorada para itinerario */}
                  {Object.entries(tour.itinerary).map(([day, description], index) => (
                    <div key={`itinerary-${day}-${index}`} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        {index < Object.keys(tour.itinerary).length - 1 && (
                          <div className="w-1 h-full bg-orange-200 my-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h3 className="font-bold text-gray-800 mb-2">{day}</h3>
                        <p className="text-gray-700">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Widget de reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                {/* CORRECCIÓN: Usar la función robusta de precio */}
                <p className="text-3xl font-bold text-orange-500">
                  ${getFormattedPrice()}
                </p>
                <p className="text-gray-600">por persona</p>
              </div>

              {/* Selector de fecha */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del tour
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Información de encuentro */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Hora de encuentro:</span>
                  <span className="font-semibold">{tour.meeting_time || '12:00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Punto de encuentro:</span>
                  <span className="font-semibold text-right">{tour.meeting_point || 'Por definir'}</span>
                </div>
              </div>

              {/* Selector de tickets */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Tickets</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Adultos</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleTicketChange('adults', tickets.adults - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{tickets.adults}</span>
                      <button 
                        onClick={() => handleTicketChange('adults', tickets.adults + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Adultos mayores (+65)</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleTicketChange('seniors', tickets.seniors - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{tickets.seniors}</span>
                      <button 
                        onClick={() => handleTicketChange('seniors', tickets.seniors + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Niños (0-12)</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleTicketChange('children', tickets.children - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{tickets.children}</span>
                      <button 
                        onClick={() => handleTicketChange('children', tickets.children + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Extras adicionales</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Comidas ($40)</span>
                    <input
                      type="checkbox"
                      checked={extras.meals}
                      onChange={() => handleExtraChange('meals')}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Seguro de viaje ($40)</span>
                    <input
                      type="checkbox"
                      checked={extras.travel_insurance}
                      onChange={() => handleExtraChange('travel_insurance')}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de reserva */}
              <button className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors">
                Reservar Ahora
              </button>

              <p className="text-center text-sm text-gray-600 mt-3">
                Cancelación gratuita hasta 24 horas antes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TourDetailPage;