import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance, useAuth } from "../Auth/authContext"; // Agregar useAuth
import {
  HeartIcon,
  ShareIcon,
  CheckIcon,
  XIcon,
  MapPinIcon,
} from "../Shared/icons";
import StarRating from "./starRating";
import ImageGalleryModal from "../Layout/imageGalleryModal";
import TourGallery from "../components/tourGallery";
import BookingWidget from "../components/bookingWidget";
import { useTourPricing } from "../../hooks/useTourPricing";
import { useTourImages } from "../../hooks/useTourImages";

function TourDetailPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Agregar useAuth

  // Estados principales
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reserving, setReserving] = useState(false);

  // Estados de reserva
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  // tickets
  const [tickets, setTickets] = useState(() => {
    return { adults: 1, seniors: 0, children: 0 };
  });

  // price_variations
  useEffect(() => {
    if (tour?.price_variations) {
      const initialTickets = {};
      Object.keys(tour.price_variations).forEach((type, index) => {
        // El primer tipo se inicializa en 1, los demás en 0
        initialTickets[type] = index === 0 ? 1 : 0;
      });
      setTickets(initialTickets);
    }
  }, [tour]);

  const [extras, setExtras] = useState({
    meals: false,
    travel_insurance: false,
  });

  const [variableExtras, setVariableExtras] = useState({});

  // Estados de galería
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hooks personalizados
  const pricing = useTourPricing(tour);
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
          // Inicializar servicios adicionales si existen
          if (response.data.extra_services) {
            const initialExtras = {};
            Object.keys(response.data.extra_services).forEach((key) => {
              initialExtras[key] = false;
            });
            setVariableExtras(initialExtras);
          }
          
          // Inicializar tickets basado en price_variations si existen
          if (response.data.price_variations) {
            const initialTickets = {};
            Object.keys(response.data.price_variations).forEach((type, index) => {
              initialTickets[type] = index === 0 ? 1 : 0; // Primer tipo en 1, otros en 0
            });
            setTickets(initialTickets);
          }
        } else {
          throw new Error("Datos del tour inválidos");
        }
      } catch (err) {
        console.error("Error cargando tour:", err);
        setError(
          err.response?.data?.message ||
            "No se pudo cargar la información del tour"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [tourId]);

  // Handlers optimizados con useCallback
  const handleTicketChange = useCallback((type, value) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0),
    }));
  }, []);

  const handleExtraChange = useCallback((extra) => {
    setExtras((prev) => ({
      ...prev,
      [extra]: !prev[extra],
    }));
  }, []);

  const handleVariableExtraChange = useCallback((extra) => {
    setVariableExtras((prev) => ({
      ...prev,
      [extra]: !prev[extra],
    }));
  }, []);

  const handleReservation = useCallback(() => {
    if (!user) {
      alert('Debes iniciar sesión para hacer una reserva');
      return;
    }
    if (user.role !== 'TRAVELER') {
      alert('Solo los viajeros pueden hacer reservas. Los operadores no pueden reservar sus propios tours.');
      return;
    }

    const totalPeople = Object.values(tickets).reduce((sum, num) => sum + (parseInt(num) || 0), 0);
    
    if (totalPeople === 0) {
      alert('Por favor selecciona al menos una persona para la reserva');
      return;
    }

    if (tour.available_slots < totalPeople) {
      alert(`Solo hay ${tour.available_slots} plazas disponibles`);
      return;
    }

    let total = 0;

    const availableTicketTypes = tour?.price_variations_with_commission 
      ? Object.keys(tour.price_variations_with_commission) 
      : [];

    if (availableTicketTypes.length > 0) {
      Object.entries(tickets).forEach(([type, quantity]) => {
        const qty = parseInt(quantity) || 0;
        if (qty > 0 && tour.price_variations_with_commission[type]) {
          const priceWithCommission = parseFloat(tour.price_variations_with_commission[type]);
          total += qty * priceWithCommission;
        }
      });
    } else if (tour?.final_price) {
      const finalPrice = parseFloat(tour.final_price);
      total += totalPeople * finalPrice;
    }

    // Calcular extras
    if (tour?.extra_services_with_commission) {
      Object.entries(tour.extra_services_with_commission).forEach(([key, priceWithCommission]) => {
        if (variableExtras[key]) {
          total += parseFloat(priceWithCommission) * totalPeople;
        }
      });
    }

    // 5. PREPARAR DATOS PARA EL CHECKOUT
    const bookingData = {
      tour,
      selectedDate,
      tickets,
      variableExtras,
      total,
      totalPeople
    };

    // 6. NAVEGAR AL CHECKOUT
    navigate('/checkout', {
      state: { bookingData }
    });
  }, [user, tour, selectedDate, tickets, variableExtras, navigate]);

  // Handlers de galería
  const openGalleryModal = useCallback((index = 0) => {
    setCurrentImageIndex(index);
    setIsGalleryModalOpen(true);
  }, []);

  const closeGalleryModal = useCallback(() => {
    setIsGalleryModalOpen(false);
  }, []);

  // Helper functions
  const isValidTour = useCallback((tourData) => {
    return (
      tourData && typeof tourData === "object" && tourData.id && tourData.title
    );
  }, []);

  const getLocationDisplay = useCallback(() => {
    if (!tour) return "";
    return `${tour.state_origin} → ${tour.state_destination}`;
  }, [tour]);

  const safeMap = useCallback((array, renderFunction) => {
    if (!Array.isArray(array)) return null;
    return array.filter((item) => item != null).map(renderFunction);
  }, []);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando información del tour...</div>
        </div>
      </div>
    );
  }

  if (error || !isValidTour(tour)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg mb-4">
            {error || "Tour no encontrado"}
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con breadcrumb */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <span className="hover:text-orange-500 cursor-pointer">
              Experiencias
            </span>
            <span className="mx-2">›</span>
            <span className="hover:text-orange-500 cursor-pointer">Tours</span>
            <span className="mx-2">›</span>
            <span className="text-gray-800 font-medium">
              {getLocationDisplay()}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header del tour */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Bestseller
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              Free cancellation
            </span>
            {safeMap(tour.tags, (tag, index) => (
              <span
                key={tag.id || `tag-${index}`}
                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {tour.title}
          </h1>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center">
                <StarRating rating={4.8} />
                <span className="ml-2 font-bold text-gray-700">4.8</span>
                <span className="ml-1 text-gray-600">
                  ({tour.reviews?.length || 0} reviews)
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-1" />
                <span>{getLocationDisplay()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors duration-200 p-2 rounded-lg hover:bg-orange-50">
                <ShareIcon className="w-5 h-5" />
                <span className="font-medium">Compartir</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50">
                <HeartIcon className="w-5 h-5" />
                <span className="font-medium">Lista de deseados</span>
              </button>
            </div>
          </div>
        </div>

        {/* Galería de imágenes */}
        <TourGallery
          mainImage={mainImage}
          galleryImages={galleryImages}
          onImageClick={openGalleryModal}
        />

        {/* Grid principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Contenido principal */}
          <div className="xl:col-span-3 space-y-8">
            {/* Información del tour */}
            <TourInfo tour={tour} />

            {/* Descripción */}
            <TourDescription tour={tour} />

            {/* Puntos destacados */}
            <TourHighlights tour={tour} />

            {/* Punto de encuentro */}
            <MeetingPoint tour={tour} />

            {/* Qué incluye y no incluye */}
            <IncludedExcluded tour={tour} safeMap={safeMap} />

            {/* Itinerario */}
            <TourItinerary tour={tour} />
          </div>

          {/* Widget de reserva - Pasar user como prop adicional si es necesario */}
          <BookingWidget
            tour={tour}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            tickets={tickets}
            onTicketChange={handleTicketChange}
            extras={extras}
            onExtraChange={handleExtraChange}
            variableExtras={variableExtras}
            onVariableExtraChange={handleVariableExtraChange}
            onReservation={handleReservation}
            reserving={reserving}
            pricing={pricing}
            user={user} // Pasar user al BookingWidget si lo necesita
          />
        </div>
      </div>

      {/* Modal de Galería */}
      <ImageGalleryModal
        images={allImages}
        isOpen={isGalleryModalOpen}
        onClose={closeGalleryModal}
        initialIndex={currentImageIndex}
      />
    </div>
  );
}

// Componentes auxiliares (pueden moverse a archivos separados)
const TourInfo = ({ tour }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
      Información del tour
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <InfoCard
        icon="📅"
        title="Duración"
        value={`${tour.duration_days} Días y ${
          tour.duration_days - 1 || 1
        } Noches`}
        color="orange"
      />
      <InfoCard
        icon="🌄"
        title="Entorno"
        value={
          tour.environment === "ADVENTUROUS"
            ? "Aventurero"
            : tour.environment || "Festivo, Con música"
        }
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

const InfoCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
      <div className="flex-shrink-0 text-2xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const TourDescription = ({ tour }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      Descripción general
    </h2>
    <p className="text-gray-700 leading-relaxed text-lg">{tour.description}</p>
  </div>
);

const TourHighlights = ({ tour }) => {
  if (!tour.highlights || tour.highlights.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Puntos Destacados
      </h2>
      <ul className="space-y-3">
        {tour.highlights.map((highlight, index) => (
          <li key={index} className="flex items-start">
            <span className="text-orange-500 mr-3 mt-1">•</span>
            <span className="text-gray-700 text-lg">{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MeetingPoint = ({ tour }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      Punto de Encuentro
    </h2>
    <div className="space-y-4">
      <InfoRow
        icon="📍"
        title="Ubicación:"
        value={`${tour.state_origin} - ${tour.specific_origin}`}
      />
      <InfoRow
        icon="🏁"
        title="Destino:"
        value={`${tour.state_destination} - ${tour.specific_destination}`}
      />
      <InfoRow
        icon="⏰"
        title="Hora de encuentro:"
        value={new Date(`2000-01-01T${tour.meeting_time}`).toLocaleTimeString(
          "es-VE",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )}
      />
      <InfoRow icon="📌" title="Lugar específico:" value={tour.meeting_point} />
    </div>
  </div>
);

const InfoRow = ({ icon, title, value }) => (
  <div className="flex items-start">
    <div className="w-8 text-orange-500 mt-1">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-700">{value}</p>
    </div>
  </div>
);

const IncludedExcluded = ({ tour, safeMap }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <IncludedSection
        title="Qué incluye"
        items={tour.what_is_included}
        icon={<CheckIcon className="w-6 h-6 text-green-500" />}
        color="green"
        safeMap={safeMap}
      />
      <IncludedSection
        title="Qué no incluye"
        items={tour.what_is_not_included}
        icon={<XIcon className="w-6 h-6 text-red-500" />}
        color="red"
        safeMap={safeMap}
      />
    </div>
  </div>
);

const IncludedSection = ({ title, items, icon, color, safeMap }) => {
  // Función para normalizar los items
  const normalizeItems = (itemsArray) => {
    if (!Array.isArray(itemsArray)) return [];

    return itemsArray.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.name) return item.name;
      if (typeof item === "object" && item.text) return item.text;
      return String(item); // Convertir cualquier otro tipo a string
    });
  };

  const normalizedItems = normalizeItems(items);

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">
        {safeMap(normalizedItems, (item, index) => (
          <IncludedItem key={`${title}-${index}`} item={item} color={color} />
        ))}
      </div>
    </div>
  );
};

const IncludedItem = ({ item, color }) => {
  const colorClasses = {
    green: "bg-green-500",
    red: "bg-red-500",
  };

  const getItemText = () => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.name) return item.name;
    if (typeof item === "object" && item.text) return item.text;
    return JSON.stringify(item);
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-2 h-2 ${colorClasses[color]} rounded-full`}></div>
      <span className="text-gray-700 font-medium">{getItemText()}</span>
    </div>
  );
};

const TourItinerary = ({ tour }) => {
  if (!tour.itinerary) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Itinerario</h2>
      <div className="space-y-8">
        {Object.entries(tour.itinerary).map(([day, description], index) => (
          <ItineraryDay
            key={`itinerary-${day}-${index}`}
            day={day}
            description={description}
            dayNumber={index + 1}
            isLast={index === Object.keys(tour.itinerary).length - 1}
          />
        ))}
      </div>
    </div>
  );
};

const ItineraryDay = ({ day, description, dayNumber, isLast }) => (
  <div className="flex gap-6 group">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
        {dayNumber}
      </div>
      {!isLast && (
        <div className="w-1 h-full bg-gradient-to-b from-orange-200 to-orange-100 my-2 rounded-full"></div>
      )}
    </div>
    <div className="flex-1 pb-8">
      <h3 className="font-bold text-gray-800 text-lg mb-3">{day}</h3>
      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500 whitespace-pre-line">
        {description}
      </p>
    </div>
  </div>
);

export default TourDetailPage;