import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import StarRating from "../Tours/starRating";
import {
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CheckIcon,
  CalendarIcon,
} from "../Shared/icons";

const OperatorPublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/users/operators/${username}/profile/`);
        setProfile(response.data);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        if (err.response?.status === 404) {
          setError("Operador no encontrado");
        } else {
          setError("Error al cargar el perfil del operador");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil del operador...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || "Operador no encontrado"}
          </h2>
          <p className="text-gray-600 mb-4">
            No pudimos encontrar el perfil que buscas
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const { operator, statistics, active_tours, past_tours, recent_reviews } = profile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Perfil */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-[1240px] mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {operator.profile_picture ? (
                <img
                  src={operator.profile_picture}
                  alt={operator.business_name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                  <span className="text-5xl font-bold">
                    {operator.business_name?.charAt(0) || operator.username?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {operator.business_name}
                </h1>
                {operator.is_verified && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <CheckIcon className="w-4 h-4" />
                    Verificado
                  </span>
                )}
              </div>

              <p className="text-white/80 mb-4">@{operator.username}</p>

              {operator.bio && (
                <p className="text-white/90 max-w-2xl mb-4">{operator.bio}</p>
              )}

              {/* Estadísticas */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <StatItem
                  value={statistics.total_active_tours}
                  label="Tours Activos"
                />
                <StatItem
                  value={statistics.total_reviews}
                  label="Reseñas"
                />
                <StatItem
                  value={statistics.average_rating.toFixed(1)}
                  label="Calificación"
                  icon={<span className="text-yellow-300">⭐</span>}
                />
                <StatItem
                  value={new Date(operator.date_joined).getFullYear()}
                  label="Miembro desde"
                />
              </div>
            </div>

            {/* Compartir */}
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("¡Enlace copiado al portapapeles!");
                }}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartir perfil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-[1240px] mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          <TabButton
            active={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            count={active_tours.length}
          >
            Tours Activos
          </TabButton>
          <TabButton
            active={activeTab === "past"}
            onClick={() => setActiveTab("past")}
            count={past_tours.length}
          >
            Tours Anteriores
          </TabButton>
          <TabButton
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
            count={recent_reviews.length}
          >
            Reseñas
          </TabButton>
        </div>

        {/* Contenido de Tabs */}
        {activeTab === "active" && (
          <div>
            {active_tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {active_tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📦"
                title="Sin tours activos"
                message="Este operador no tiene tours activos en este momento"
              />
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div>
            {past_tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past_tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} inactive />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📚"
                title="Sin historial"
                message="No hay tours anteriores para mostrar"
              />
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            {recent_reviews.length > 0 ? (
              <div className="space-y-4">
                {recent_reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="💬"
                title="Sin reseñas"
                message="Este operador aún no tiene reseñas"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes auxiliares

const StatItem = ({ value, label, icon }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-1">
      <span className="text-2xl font-bold">{value}</span>
      {icon}
    </div>
    <p className="text-sm text-white/80">{label}</p>
  </div>
);

const TabButton = ({ children, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium transition-colors relative ${
      active
        ? "text-orange-500 border-b-2 border-orange-500"
        : "text-gray-600 hover:text-gray-800"
    }`}
  >
    {children}
    {count > 0 && (
      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
        active ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-600"
      }`}>
        {count}
      </span>
    )}
  </button>
);

const TourCard = ({ tour, inactive = false }) => (
  <Link
    to={inactive ? "#" : `/tour/${tour.id}`}
    className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
      inactive ? "opacity-75 cursor-default" : "hover:shadow-lg hover:-translate-y-1"
    }`}
  >
    {/* Imagen */}
    <div className="relative h-48">
      <img
        src={tour.main_image?.image_url || tour.main_image?.image || "https://placehold.co/400x300/FF7900/FFFFFF?text=VENTU"}
        alt={tour.title}
        className="w-full h-full object-cover"
      />
      {inactive && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
            Finalizado
          </span>
        </div>
      )}
      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg shadow">
        <span className="font-bold text-orange-500">${tour.final_price || tour.display_price}</span>
      </div>
    </div>

    {/* Info */}
    <div className="p-4">
      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{tour.title}</h3>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <MapPinIcon className="w-4 h-4 text-orange-500" />
        <span>{tour.state_destination}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span>{tour.duration_days} días</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <span>{tour.average_rating?.toFixed(1) || "N/A"}</span>
          <span className="text-gray-400">({tour.rating_count || 0})</span>
        </div>
      </div>
    </div>
  </Link>
);

const ReviewCard = ({ review }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-semibold text-gray-900">{review.traveler_name}</h4>
        <p className="text-sm text-gray-500">
          {new Date(review.created_at).toLocaleDateString("es-VE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <StarRating rating={review.rating} />
        <span className="font-bold text-gray-900">{review.rating}/5</span>
      </div>
    </div>

    <Link
      to={`/tour/${review.tour_id}`}
      className="text-sm text-orange-500 hover:underline mb-2 inline-block"
    >
      📍 {review.tour_title}
    </Link>

    <h5 className="font-medium text-gray-800 mb-2">{review.title}</h5>
    <p className="text-gray-600 leading-relaxed">{review.comment}</p>

    {review.operator_response && (
      <div className="mt-4 bg-orange-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-orange-800 mb-1">
          Respuesta del operador:
        </p>
        <p className="text-sm text-gray-700">{review.operator_response}</p>
        {review.response_date && (
          <p className="text-xs text-gray-500 mt-2">
            {new Date(review.response_date).toLocaleDateString("es-VE")}
          </p>
        )}
      </div>
    )}
  </div>
);

const EmptyState = ({ icon, title, message }) => (
  <div className="text-center py-16 bg-white rounded-xl">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);

export default OperatorPublicProfile;