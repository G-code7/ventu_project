import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckIcon,
  XIcon,
} from "../Shared/icons";
import StarRating from "./starRating";
import { axiosInstance } from "../Auth/authContext";

function TourDetailPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [tickets, setTickets] = useState({
    adults: 1,
    seniors: 0,
    children: 0,
  });
  const [extras, setExtras] = useState({
    meals: false,
    travel_insurance: false,
  });
  const [variableExtras, setVariableExtras] = useState({});
  const [reserving, setReserving] = useState(false);

  // Función para verificar si el tour es válido
  const isValidTour = (tourData) => {
    return tourData && 
           typeof tourData === 'object' && 
           tourData.id && 
           tourData.title;
  };

  // Cargar datos del tour
  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/tours/${tourId}/`);

        if (response.data && response.data.id) {
          setTour(response.data);
          // Inicializar variableExtras
          if (response.data.variable_prices) {
            const initialExtras = {};
            Object.keys(response.data.variable_prices).forEach(key => {
              initialExtras[key] = false;
            });
            setVariableExtras(initialExtras);
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

  // Manejar cambios en tickets
  const handleTicketChange = (type, value) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0),
    }));
  };

  // Manejar cambios en extras fijos
  const handleExtraChange = (extra) => {
    setExtras((prev) => ({
      ...prev,
      [extra]: !prev[extra],
    }));
  };

  // Manejar cambios en extras variables
  const handleVariableExtraChange = (extra) => {
    setVariableExtras((prev) => ({
      ...prev,
      [extra]: !prev[extra],
    }));
  };

  // Función de reserva mejorada
  const handleReservation = async () => {
    if (!selectedDate) {
      alert("Por favor selecciona una fecha");
      return;
    }

    const totalTickets = tickets.adults + tickets.seniors + tickets.children;
    if (totalTickets === 0) {
      alert("Por favor selecciona al menos un ticket");
      return;
    }

    setReserving(true);
    try {
      console.log("Procesando reserva...", {
        tourId,
        selectedDate,
        tickets,
        extras,
        variableExtras,
        total: calculateTotal(),
      });
      // navigate('/checkout'); // Redirigir a checkout
    } catch (err) {
      console.error("Error en reserva:", err);
      alert("Error al procesar la reserva");
    } finally {
      setReserving(false);
    }
  };

  // Helper functions para precios
  const getPriceAsNumber = (priceValue) => {
    if (!priceValue) return 0;

    let price = priceValue;

    if (typeof price === "string") {
      price = parseFloat(price.replace(/[^\d.-]/g, ""));
    }

    return isNaN(price) ? 0 : Math.max(0, price);
  };

  const getFormattedPrice = (priceValue) => {
    const price = getPriceAsNumber(priceValue);
    return new Intl.NumberFormat("es-ES").format(price);
  };

  const getDisplayPrice = () => {
    if (!tour) return 0;
    return getPriceAsNumber(tour.final_price || tour.base_price);
  };

  const calculateTotal = () => {
    const basePrice = getDisplayPrice();
    let total = 0;

    // Precio por tickets
    total += tickets.adults * basePrice;
    total += tickets.seniors * (basePrice * 0.7);
    total += tickets.children * (basePrice * 0.5);

    // Extras fijos
    const extrasPrice = 40;
    const totalPeople = tickets.adults + tickets.seniors + tickets.children;
    
    if (extras.meals) total += extrasPrice * totalPeople;
    if (extras.travel_insurance) total += extrasPrice * totalPeople;

    // Extras variables
    if (tour?.variable_prices) {
      Object.entries(tour.variable_prices).forEach(([key, price]) => {
        if (variableExtras[key]) {
          total += getPriceAsNumber(price) * totalPeople;
        }
      });
    }

    return total;
  };

  // Helper function para mapeo seguro
  const safeMap = (array, renderFunction) => {
    if (!Array.isArray(array)) return null;
    return array.filter((item) => item != null).map(renderFunction);
  };

  // Función helper para manejar imágenes
  const getTourImages = () => {
    if (!tour?.images || !Array.isArray(tour.images)) {
      return { mainImage: null, galleryImages: [] };
    }

    const validImages = tour.images.filter(
      (img) => img && typeof img === "object" && img.image
    );

    const mainImage =
      validImages.find((img) => img.is_main_image) || validImages[0];
    const galleryImages = validImages.filter((img) => img !== mainImage);

    return { mainImage, galleryImages };
  };

  // Función para obtener location display
  const getLocationDisplay = () => {
    if (!tour) return "";
    return `${tour.state_origin} → ${tour.state_destination}`;
  };

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

  // Obtener imágenes
  const { mainImage, galleryImages } = getTourImages();

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
              {tour.destination || tour.location || getLocationDisplay()}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header del tour - Ocupa ancho completo */}
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

          {/* Layout corregido para rating y botones */}
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

        {/* Galería de imágenes - Ocupa ancho completo */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mainImage && (
              <div className="lg:col-span-2">
                <img
                  src={mainImage.image}
                  alt={tour.title}
                  className="w-full h-80 lg:h-96 object-cover rounded-xl shadow-md"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {safeMap(galleryImages.slice(0, 4), (image, index) => (
                <img
                  key={image?.id || `gallery-${index}`}
                  src={image.image}
                  alt={`${tour.title} ${index + 1}`}
                  className="w-full h-36 lg:h-40 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                />
              ))}
            </div>
          </div>
          {galleryImages.length > 4 && (
            <button className="mt-6 text-orange-500 font-semibold hover:text-orange-600 transition-colors duration-200 flex items-center gap-2 mx-auto">
              <span>Ver todas las {galleryImages.length + 1} fotos</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Grid principal para contenido y sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Columna de contenido principal */}
          <div className="xl:col-span-3 space-y-8">
            {/* Información del tour */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
                Información del tour
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-orange-50">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duración</p>
                    <p className="font-semibold text-gray-800">
                      {tour.duration_days} Días y {tour.duration_days - 1 || 1}{" "}
                      Noches
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entorno</p>
                    <p className="font-semibold text-gray-800">
                      {tour.environment === "ADVENTUROUS" ? "Aventurero" : tour.environment || "Festivo, Con música"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-green-50">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tamaño del grupo</p>
                    <p className="font-semibold text-gray-800">
                      {tour.group_size || 10} personas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Descripción general
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {tour.description}
              </p>
            </div>

            {/* Qué incluye y no incluye */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckIcon className="w-6 h-6 text-green-500" />
                    Qué incluye
                  </h3>
                  <div className="space-y-3">
                    {safeMap(tour.what_is_included, (item, index) => (
                      <div
                        key={`included-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <XIcon className="w-6 h-6 text-red-500" />
                    Qué no incluye
                  </h3>
                  <div className="space-y-3">
                    {safeMap(tour.what_is_not_included, (item, index) => (
                      <div
                        key={`not-included-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerario */}
            {tour.itinerary && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Itinerario
                </h2>
                <div className="space-y-8">
                  {Object.entries(tour.itinerary).map(
                    ([day, description], index) => (
                      <div
                        key={`itinerary-${day}-${index}`}
                        className="flex gap-6 group"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          {index < Object.keys(tour.itinerary).length - 1 && (
                            <div className="w-1 h-full bg-gradient-to-b from-orange-200 to-orange-100 my-2 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h3 className="font-bold text-gray-800 text-lg mb-3">
                            {day}
                          </h3>
                          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500 whitespace-pre-line">
                            {description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Widget de reserva */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border border-gray-100">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-orange-500 mb-2">
                  ${getFormattedPrice(getDisplayPrice())}
                </p>
                <p className="text-gray-600 text-lg">por persona</p>
                {tour.final_price && tour.base_price && (
                  <p className="text-sm text-gray-500 line-through mt-1">
                    ${getFormattedPrice(tour.base_price)}
                  </p>
                )}
              </div>

              {/* Selector de fecha */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📅 Fecha del tour
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Información de encuentro */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6 border border-blue-100">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-gray-600 font-medium">
                    🕐 Hora de encuentro:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {tour.meeting_time ? tour.meeting_time.substring(0, 5) : "12:00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">
                    📍 Punto de encuentro:
                  </span>
                  <span className="font-semibold text-gray-800 text-right">
                    {tour.meeting_point || "Por definir"}
                  </span>
                </div>
              </div>

              {/* Selector de tickets */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                  🎫 Tickets
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-800">Adultos</span>
                      <p className="text-sm text-gray-600">Precio base</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleTicketChange("adults", tickets.adults - 1)
                        }
                        disabled={tickets.adults === 0}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg font-bold text-gray-600">
                          -
                        </span>
                      </button>
                      <span className="w-8 text-center font-bold text-lg">
                        {tickets.adults}
                      </span>
                      <button
                        onClick={() =>
                          handleTicketChange("adults", tickets.adults + 1)
                        }
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors"
                      >
                        <span className="text-lg font-bold text-gray-600">
                          +
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-800">
                        Adultos mayores (+65)
                      </span>
                      <p className="text-sm text-gray-600">30% descuento</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleTicketChange("seniors", tickets.seniors - 1)
                        }
                        disabled={tickets.seniors === 0}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg font-bold text-gray-600">
                          -
                        </span>
                      </button>
                      <span className="w-8 text-center font-bold text-lg">
                        {tickets.seniors}
                      </span>
                      <button
                        onClick={() =>
                          handleTicketChange("seniors", tickets.seniors + 1)
                        }
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors"
                      >
                        <span className="text-lg font-bold text-gray-600">
                          +
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-800">
                        Niños (0-12)
                      </span>
                      <p className="text-sm text-gray-600">50% descuento</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleTicketChange("children", tickets.children - 1)
                        }
                        disabled={tickets.children === 0}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg font-bold text-gray-600">
                          -
                        </span>
                      </button>
                      <span className="w-8 text-center font-bold text-lg">
                        {tickets.children}
                      </span>
                      <button
                        onClick={() =>
                          handleTicketChange("children", tickets.children + 1)
                        }
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors"
                      >
                        <span className="text-lg font-bold text-gray-600">
                          +
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extras adicionales - Variables prices */}
              {tour.variable_prices && Object.keys(tour.variable_prices).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                    ✨ Opciones adicionales
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(tour.variable_prices).map(([key, price]) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors">
                        <div>
                          <span className="font-medium text-gray-800">
                            {key.trim()}
                          </span>
                          <p className="text-sm text-gray-600">
                            +${getFormattedPrice(price)} por persona
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={variableExtras[key] || false}
                          onChange={() => handleVariableExtraChange(key)}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras fijos */}
              {/*
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                  🛡️ Seguros y servicios
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors">
                    <div>
                      <span className="font-medium text-gray-800">
                        🍽️ Comidas adicionales
                      </span>
                      <p className="text-sm text-gray-600">+$40 por persona</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={extras.meals}
                      onChange={() => handleExtraChange("meals")}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors">
                    <div>
                      <span className="font-medium text-gray-800">
                        🛡️ Seguro de viaje
                      </span>
                      <p className="text-sm text-gray-600">+$40 por persona</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={extras.travel_insurance}
                      onChange={() => handleExtraChange("travel_insurance")}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div> */}

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-orange-500">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón de reserva */}
              <button 
                onClick={handleReservation}
                disabled={reserving}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {reserving ? "Procesando..." : "Reservar Ahora"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4 flex items-center justify-center gap-2">
                <span className="text-green-500">✓</span>
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