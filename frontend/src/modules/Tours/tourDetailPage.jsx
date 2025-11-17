import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance, useAuth } from "../Auth/authContext";
import {
  HeartIcon,
  ShareIcon,
  CheckIcon,
  XIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
} from "../Shared/icons";
import StarRating from "./starRating";
import BookingWidget from "../components/bookingWidget";
import ImageGalleryModal from "../Layout/imageGalleryModal";
import { useTourImages } from "../../hooks/useTourImages";

function TourDetailPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados principales
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reserving, setReserving] = useState(false);

  // Estados de galería
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  // Estados de reserva
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [tickets, setTickets] = useState({});
  const [extras, setExtras] = useState({});
  const [variableExtras, setVariableExtras] = useState({});

  // Estado para modal móvil
  const [showMobileBooking, setShowMobileBooking] = useState(false);

  // Hook de imágenes
  const { mainImage, galleryImages, allImages } = useTourImages(tour);

  // Cargar datos del tour
  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/tours/${tourId}/`);

        if (response.data?.id) {
          setTour(response.data);

          // Inicializar tickets
          if (response.data.price_variations_with_commission) {
            const initialTickets = {};
            Object.keys(response.data.price_variations_with_commission).forEach((type, index) => {
              initialTickets[type] = index === 0 ? 1 : 0;
            });
            setTickets(initialTickets);
          } else {
            setTickets({ default: 1 });
          }

          // Inicializar extras
          if (response.data.extra_services_with_commission) {
            const initialExtras = {};
            Object.keys(response.data.extra_services_with_commission).forEach((key) => {
              initialExtras[key] = false;
            });
            setVariableExtras(initialExtras);
          }
        } else {
          throw new Error("Datos del tour inválidos");
        }
      } catch (err) {
        console.error("Error cargando tour:", err);
        setError(err.response?.data?.message || "No se pudo cargar la información del tour");
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [tourId]);

  // Calcular total
  const calculateTotal = useCallback(() => {
    if (!tour) return 0;

    let total = 0;
    const totalPeople = Object.values(tickets).reduce((sum, num) => sum + (parseInt(num) || 0), 0);

    if (tour.price_variations_with_commission && Object.keys(tour.price_variations_with_commission).length > 0) {
      Object.entries(tickets).forEach(([type, quantity]) => {
        const qty = parseInt(quantity) || 0;
        if (qty > 0 && tour.price_variations_with_commission[type]) {
          total += qty * parseFloat(tour.price_variations_with_commission[type]);
        }
      });
    } else if (tour?.final_price) {
      total += totalPeople * parseFloat(tour.final_price);
    }

    if (tour?.extra_services_with_commission) {
      Object.entries(tour.extra_services_with_commission).forEach(([key, price]) => {
        if (variableExtras[key]) {
          total += parseFloat(price) * totalPeople;
        }
      });
    }

    return total;
  }, [tour, tickets, variableExtras]);

  const handleTicketChange = useCallback((type, value) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0),
    }));
  }, []);

  const handleReservation = useCallback(() => {
    if (!user) {
      alert("Debes iniciar sesión para hacer una reserva");
      return;
    }
    if (user.role !== "TRAVELER") {
      alert("Solo los viajeros pueden hacer reservas");
      return;
    }

    const totalPeople = Object.values(tickets).reduce((sum, num) => sum + (parseInt(num) || 0), 0);

    if (totalPeople === 0) {
      alert("Por favor selecciona al menos una persona");
      return;
    }

    if (tour.available_slots < totalPeople) {
      alert(`Solo hay ${tour.available_slots} plazas disponibles`);
      return;
    }

    const bookingData = {
      tour,
      selectedDate,
      tickets,
      variableExtras,
      total: calculateTotal(),
      totalPeople,
    };

    navigate("/checkout", { state: { bookingData } });
  }, [user, tour, selectedDate, tickets, variableExtras, calculateTotal, navigate]);

  const openGallery = (index = 0) => {
    setGalleryInitialIndex(index);
    setShowGalleryModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del tour...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg mb-4">{error || "Tour no encontrado"}</div>
          <button onClick={() => navigate("/")} className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const totalPeople = Object.values(tickets).reduce((sum, num) => sum + (parseInt(num) || 0), 0);
  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-[1240px] mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500 flex items-center gap-2">
            <span className="hover:text-orange-500 cursor-pointer" onClick={() => navigate("/")}>
              Inicio
            </span>
            <span>›</span>
            <span className="hover:text-orange-500 cursor-pointer" onClick={() => navigate("/destinos")}>
              Experiencias
            </span>
            <span>›</span>
            <span className="text-gray-800">{tour.state_destination}</span>
          </nav>
        </div>
      </div>

      {/* Header con Precio */}
      <div className="bg-white border-b">
        <div className="max-w-[1240px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            {/* Info izquierda */}
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{tour.title}</h1>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {tour.environment && (
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {tour.environment.replace(/_/g, " ")}
                  </span>
                )}
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Cancelación gratuita
                </span>
                {tour.tags?.map((tag) => (
                  <span key={tag.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded font-bold">
                    {tour.average_rating?.toFixed(1) || "4.8"}
                  </span>
                  <StarRating rating={tour.average_rating || 4.8} />
                  <span className="text-gray-600">({tour.rating_count || 0} opiniones)</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <span className="text-gray-600 hidden sm:inline">{tour.available_slots} plazas disponibles</span>
              </div>
            </div>

            {/* Precio derecha */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-sm text-gray-500">Desde</p>
                <p className="text-3xl font-bold text-orange-500">
                  ${parseFloat(tour.final_price || tour.base_price).toFixed(0)}
                  <span className="text-base font-normal text-gray-500"> USD</span>
                </p>
                <p className="text-xs text-gray-500">por persona</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-gray-600 hover:text-orange-500 p-2 rounded-lg hover:bg-gray-50">
                  <ShareIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Compartir</span>
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-gray-50">
                  <HeartIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Favoritos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GALERÍA */}
      <div className="w-full bg-white py-6">
        {allImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-[400px] md:h-[600px] max-w-[1240px] mx-auto px-4">
            {/* Imagen Principal */}
            <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => openGallery(0)}>
              <img
                src={allImages[0]?.image || allImages[0]?.image_url}
                alt={tour.title}
                className="w-full h-full object-cover rounded-l-xl"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-l-xl" />
            </div>

            {/* Imágenes secundarias */}
            {allImages.slice(1, 5).map((img, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer ${index === 1 ? "rounded-tr-xl" : ""} ${index === 3 ? "rounded-br-xl" : ""}`}
                onClick={() => openGallery(index + 1)}
              >
                <img
                  src={img.image || img.image_url}
                  alt={`Vista ${index + 2}`}
                  className={`w-full h-full object-cover ${index === 1 ? "rounded-tr-xl" : ""} ${index === 3 ? "rounded-br-xl" : ""}`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                {index === 3 && allImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-br-xl">
                    <span className="text-white font-bold text-xl">+{allImages.length - 5} fotos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[400px] bg-gray-200 rounded-xl flex items-center justify-center max-w-[1240px] mx-auto px-4">
            <span className="text-gray-500">No hay imágenes disponibles</span>
          </div>
        )}
      </div>

      {/* INFORMACIÓN DEL TOUR - 3 CARDS */}
      <div className="max-w-[1240px] mx-auto px-4 py-6">
        <TourInfo tour={tour} />
      </div>

      {/* CONTENIDO PRINCIPAL - 2 COLUMNAS */}
      <div className="max-w-[1240px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Contenido */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descripción + Incluye */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción general</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">{tour.description}</p>

              {/* Puntos Destacados */}
              {tour.highlights && tour.highlights.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">✨ Puntos destacados</h3>
                  <ul className="space-y-2">
                    {tour.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qué incluye / No incluye */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">✅ Qué incluye</h3>
                  <ul className="space-y-2">
                    {tour.what_is_included?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-sm">{typeof item === "string" ? item : item.name || item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">❌ Qué no incluye</h3>
                  <ul className="space-y-2">
                    {tour.what_is_not_included?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-sm">{typeof item === "string" ? item : item.name || item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Punto de Encuentro */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Punto de encuentro</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Salida</p>
                    <p className="font-semibold text-gray-900">{tour.specific_origin}</p>
                    <p className="text-sm text-gray-600">{tour.state_origin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Destino</p>
                    <p className="font-semibold text-gray-900">{tour.specific_destination}</p>
                    <p className="text-sm text-gray-600">{tour.state_destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Hora</p>
                    <p className="font-semibold text-gray-900">
                      {tour.meeting_time
                        ? new Date(`2000-01-01T${tour.meeting_time}`).toLocaleTimeString("es-VE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Por confirmar"}
                    </p>
                    <p className="text-sm text-gray-600">{tour.duration_days} días</p>
                  </div>
                </div>
              </div>
              {tour.meeting_point && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Lugar específico:</strong> {tour.meeting_point}
                  </p>
                </div>
              )}
            </div>

            {/* Itinerario */}
            {tour.itinerary && Object.keys(tour.itinerary).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🗓️ Itinerario</h2>
                <div className="space-y-6">
                  {Object.entries(tour.itinerary).map(([day, description], index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        {index < Object.keys(tour.itinerary).length - 1 && <div className="w-0.5 h-full bg-orange-200 my-2"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{day}</h4>
                        <p className="text-gray-600 whitespace-pre-line">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha - Booking Widget (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <BookingWidget
                tour={tour}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                tickets={tickets}
                onTicketChange={handleTicketChange}
                extras={extras}
                onExtraChange={() => {}}
                variableExtras={variableExtras}
                onVariableExtraChange={(key) => setVariableExtras((prev) => ({ ...prev, [key]: !prev[key] }))}
                onReservation={handleReservation}
                reserving={reserving}
                hidePrice={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra Móvil de Reserva */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-orange-500">${totalPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{totalPeople} personas</p>
          </div>
          <button
            onClick={() => setShowMobileBooking(true)}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all"
          >
            Reservar ahora
          </button>
        </div>
      </div>

      {/* Modal Móvil de Reserva */}
      {showMobileBooking && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Completar reserva</h3>
              <button onClick={() => setShowMobileBooking(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <BookingWidget
                tour={tour}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                tickets={tickets}
                onTicketChange={handleTicketChange}
                extras={extras}
                onExtraChange={() => {}}
                variableExtras={variableExtras}
                onVariableExtraChange={(key) => setVariableExtras((prev) => ({ ...prev, [key]: !prev[key] }))}
                onReservation={handleReservation}
                reserving={reserving}
                hidePrice={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Galería */}
      <ImageGalleryModal images={allImages} isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} initialIndex={galleryInitialIndex} />

      {/* Estilos adicionales */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      <div className="lg:hidden h-20"></div>
    </div>
  );
}

// Componente TourInfo - 3 Cards de Información
const TourInfo = ({ tour }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
      Información del tour
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <InfoCard
        icon="📅"
        title="Duración"
        value={`${tour.duration_days} Días y ${tour.duration_days - 1 || 1} Noches`}
        color="orange"
      />
      <InfoCard
        icon="🌄"
        title="Entorno"
        value={formatEnvironment(tour.environment)}
        color="blue"
      />
      <InfoCard
        icon="👥"
        title="Tamaño del grupo"
        value={`${tour.group_size || 10} personas`}
        color="green"
      />
    </div>
  </div>
);

// Componente InfoCard
const InfoCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    orange: "bg-orange-50 border-orange-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-4 text-center`}>
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
};

// Función para formatear el entorno
const formatEnvironment = (environment) => {
  const environments = {
    ADVENTUROUS: "Aventurero",
    RELAXING: "Relajante",
    CULTURAL: "Cultural",
    FESTIVE_MUSIC: "Festivo, Con música",
    ROMANTIC: "Romántico",
    FAMILY_FRIENDLY: "Familiar",
    EXTREME: "Extremo",
  };

  return environments[environment] || environment?.replace(/_/g, " ") || "No especificado";
};

export default TourDetailPage;