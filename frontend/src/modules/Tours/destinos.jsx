import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import TourCard from "./tourCard";
import { FilterIcon, GridIcon, ListIcon } from "../Shared/icons";

function Destinos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    destination: "",
    max_price: "",
    tags: "",
    environment: "",
    duration_days: "",
    availability_type: "",
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Parsear parámetros de la URL al cargar la página
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialFilters = {
      destination: searchParams.get("destination") || "",
      max_price: searchParams.get("max_price") || "",
      tags: searchParams.get("tags") || "",
      environment: searchParams.get("environment") || "",
      duration_days: searchParams.get("duration_days") || "",
      availability_type: searchParams.get("availability_type") || "",
    };

    setFilters(initialFilters);
    fetchTours(initialFilters);
  }, [location.search]);

  const fetchTours = async (filterParams) => {
    setLoading(true);
    try {
      // Limpiar parámetros vacíos
      const cleanParams = Object.fromEntries(
        Object.entries(filterParams).filter(([_, value]) => value !== "")
      );

      // ✅ CORREGIDO: Eliminar /api duplicado
      const response = await axiosInstance.get("/tours/", {
        params: cleanParams,
      });

      console.log("Tours filtrados:", response.data);

      // Manejar respuesta paginada o array directo
      const toursData = response.data.results || response.data;
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (error) {
      console.error("Error fetching tours:", error);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Actualizar URL sin recargar la página
    const searchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) {
        searchParams.append(filterKey, filterValue);
      }
    });

    navigate(`/destinos?${searchParams.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    const emptyFilters = {
      destination: "",
      max_price: "",
      tags: "",
      environment: "",
      duration_days: "",
      availability_type: "",
    };
    setFilters(emptyFilters);
    navigate("/destinos", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Descubre Experiencias en Venezuela
          </h1>
          <p className="text-gray-600">
            Encuentra el viaje perfecto para tus próximas aventuras
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-6">
                {/* Filtro por Destino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino
                  </label>
                  <input
                    type="text"
                    value={filters.destination}
                    onChange={(e) =>
                      handleFilterChange("destination", e.target.value)
                    }
                    placeholder="Ej: Margarita, Canaima..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Filtro por Precio Máximo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Máximo (USD)
                  </label>
                  <input
                    type="number"
                    value={filters.max_price}
                    onChange={(e) =>
                      handleFilterChange("max_price", e.target.value)
                    }
                    placeholder="Ej: 500"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Filtro por Tipo de Experiencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Experiencia
                  </label>
                  <input
                    type="text"
                    value={filters.tags}
                    onChange={(e) => handleFilterChange("tags", e.target.value)}
                    placeholder="Ej: Playa, Aventura..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Filtro por Ambiente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ambiente
                  </label>
                  <select
                    value={filters.environment}
                    onChange={(e) =>
                      handleFilterChange("environment", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Todos</option>
                    <option value="URBAN">Urbano</option>
                    <option value="NATURE">Naturaleza</option>
                    <option value="BEACH">Playa</option>
                    <option value="MOUNTAIN">Montaña</option>
                  </select>
                </div>

                {/* Filtro por Duración */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (días)
                  </label>
                  <input
                    type="number"
                    value={filters.duration_days}
                    onChange={(e) =>
                      handleFilterChange("duration_days", e.target.value)
                    }
                    placeholder="Ej: 5"
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1">
            {/* Barra de Herramientas */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FilterIcon className="w-4 h-4" />
                    Filtros
                  </button>

                  <span className="text-sm text-gray-600">
                    {tours.length}{" "}
                    {tours.length === 1 ? "resultado" : "resultados"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Vista:</span>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-orange-100 text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    <GridIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-orange-100 text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Resultados */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : tours.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron tours
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar tus filtros de búsqueda o explorar todas
                  nuestras experiencias.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Ver todos los tours
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Destinos;
