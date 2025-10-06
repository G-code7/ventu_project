import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { EditIcon, TrashIcon, EyeIcon, EyeOffIcon, CalendarIcon, UsersIcon, DollarIcon, TrendingUpIcon } from "../Shared/icons";

// Componente de tarjeta de métricas
const MetricCard = ({ title, value, icon, color, change }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        {change && (
          <div
            className={`flex items-center mt-2 text-sm ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUpIcon
              className={`w-4 h-4 mr-1 ${
                change < 0 ? "transform rotate-180" : ""
              }`}
            />
            <span>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  </div>
);

// Componente de tarjeta de paquete mejorado
const PackageCard = ({ pkg, onDelete, onToggleStatus }) => {
  const [imageError, setImageError] = useState(false);

  const getMainImage = () => {
    if (!pkg.images || !Array.isArray(pkg.images)) return null;
    const mainImage = pkg.images.find((img) => img.is_main_image);
    return mainImage || pkg.images[0];
  };

  const mainImage = getMainImage();
  const displayPrice = pkg.final_price || pkg.base_price;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Imagen del paquete */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-blue-50">
        {mainImage && !imageError ? (
          <img
            src={mainImage.image}
            alt={pkg.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}

        {/* Badge de estado */}
        <div
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
            pkg.is_active
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {pkg.is_active ? "Activo" : "Inactivo"}
        </div>

        {/* Badge de ubicación */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {pkg.state_origin} → {pkg.state_destination}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 leading-tight">
          {pkg.title}
        </h3>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duración:</span>
            <span className="font-semibold text-gray-800">
              {pkg.duration_days} días
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Grupo:</span>
            <span className="font-semibold text-gray-800">
              {pkg.group_size} personas
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Precio base:</span>
            <span className="font-semibold text-orange-600">
              ${pkg.base_price}
            </span>
          </div>
          {displayPrice !== pkg.base_price && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Precio final:</span>
              <span className="font-semibold text-green-600">
                ${displayPrice}
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => onToggleStatus(pkg.id, !pkg.is_active)}
              className={`p-2 rounded-lg transition-colors ${
                pkg.is_active
                  ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={pkg.is_active ? "Desactivar" : "Activar"}
            >
              {pkg.is_active ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>

            <Link
              to={`/operator/edit-package/${pkg.id}`}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Editar"
            >
              <EditIcon className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => onDelete(pkg.id)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de lista de paquetes en grid
const PackageGrid = ({ packages, onDelete, onToggleStatus, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
          >
            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {packages && packages.length > 0 ? (
        packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No hay paquetes creados
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primer paquete turístico
          </p>
        </div>
      )}
    </div>
  );
};

// Colores para gráficos
const CHART_COLORS = {
  primary: "#f97316",
  secondary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const PIE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

function OperatorDashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [packages, setPackages] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    bookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line"); // 'line', 'bar', 'pie'
  const navigate = useNavigate();

  const fetchPackages = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/tours/");
      const packagesData = response.data;

      // Acceder a results
      const packagesArray = packagesData.results || [];
      setPackages(packagesArray);

      // Calcular métricas
      const totalPackages = packagesArray.length;
      const activePackages = packagesArray.filter(pkg => pkg.is_active).length;
      const totalRevenue = packagesArray.reduce((sum, pkg) => {
        const price = parseFloat(pkg.base_price) || 0;
        return sum + price;
      }, 0);
      
      setMetrics({
        totalPackages,
        activePackages,
        totalRevenue: totalRevenue.toFixed(2),
        bookings: Math.floor(totalPackages * 2.5)
      });
      
    } catch (error) {
      console.error("Error al cargar los paquetes:", error);
      setPackages([]); // ← En caso de error, establecer array vacío
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get("/users/dashboard/");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
        setDashboardData([]);
      }
    };

    fetchDashboardData();
    fetchPackages();
  }, [fetchPackages]);

  const handleDeletePackage = async (packageId) => {
  if (window.confirm('¿Estás seguro de que quieres eliminar este paquete? Esta acción no se puede deshacer.')) {
    try {
      await axiosInstance.delete(`/tours/${packageId}/`);
      // Filtrar del array actual
      setPackages(prevPackages => prevPackages.filter(p => p.id !== packageId));
    } catch (error) {
      console.error("Error al eliminar el paquete:", error);
      alert('Error al eliminar el paquete. Inténtalo de nuevo.');
    }
  }
};

const handleToggleStatus = async (packageId, newStatus) => {
  try {
    await axiosInstance.patch(`/tours/${packageId}/`, {
      is_active: newStatus
    });
    
    // Actualizar el estado local
    setPackages(prevPackages => 
      prevPackages.map(pkg => 
        pkg.id === packageId ? { ...pkg, is_active: newStatus } : pkg
      )
    );
  } catch (error) {
    console.error("Error al cambiar estado del paquete:", error);
    alert('Error al cambiar el estado del paquete.');
  }
};

  // Datos para gráfico circular (estado de paquetes)
  const packageStatusData = [
    { name: "Activos", value: metrics.activePackages },
    {
      name: "Inactivos",
      value: metrics.totalPackages - metrics.activePackages,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Panel de Control</h2>
          <p className="text-gray-600 mt-2">
            Gestiona tus paquetes turísticos y visualiza tu rendimiento
          </p>
        </div>
        <button
          onClick={() => navigate("/operator/create-package")}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
        >
          <span>+ Crear Nuevo Paquete</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Paquetes"
          value={metrics.totalPackages}
          icon={<CalendarIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          change={12}
        />
        <MetricCard
          title="Paquetes Activos"
          value={metrics.activePackages}
          icon={<EyeIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
          change={8}
        />
        <MetricCard
          title="Ingresos Totales"
          value={`$${metrics.totalRevenue}`}
          icon={<DollarIcon className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          change={15}
        />
        <MetricCard
          title="Reservas"
          value={metrics.bookings}
          icon={<UsersIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          change={22}
        />
      </div>

      {/* Gráficos */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Rendimiento y Actividad
          </h3>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            {["line", "bar", "pie"].map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === type
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === "line"
                  ? "Línea"
                  : type === "bar"
                  ? "Barras"
                  : "Circular"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          {chartType === "line" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="paquetes_creados"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 6 }}
                  activeDot={{
                    r: 8,
                    stroke: CHART_COLORS.primary,
                    strokeWidth: 2,
                  }}
                  name="Paquetes Creados"
                />
                <Line
                  type="monotone"
                  dataKey="reservas_recibidas"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 6 }}
                  activeDot={{
                    r: 8,
                    stroke: CHART_COLORS.secondary,
                    strokeWidth: 2,
                  }}
                  name="Reservas Recibidas"
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="paquetes_creados"
                  fill={CHART_COLORS.primary}
                  name="Paquetes Creados"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="reservas_recibidas"
                  fill={CHART_COLORS.secondary}
                  name="Reservas Recibidas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === "pie" && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {packageStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Lista de Paquetes */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Mis Paquetes Turísticos
          </h3>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-sm text-gray-600">
              {metrics.activePackages} de {metrics.totalPackages} activos
            </span>
          </div>
        </div>

        <PackageGrid
          packages={packages}
          onDelete={handleDeletePackage}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default OperatorDashboard;
