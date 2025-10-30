import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { XIcon, UploadIcon, SpinnerIcon } from "../Shared/icons";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../Toast/toastContainer";
import { useAuth } from "../Auth/authContext";

// Constantes globales
const VENEZUELA_STATES = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "La Guaira",
  "Yaracuy",
  "Zulia",
];

const ENVIRONMENT_OPTIONS = [
  { value: "RELAXING_NO_MUSIC", label: "😌 Relajante sin Música" },
  { value: "FESTIVE_MUSIC", label: "🎉 Festivo con Música" },
  { value: "ROMANTIC", label: "💝 Romántico/Parejas" },
  { value: "FAMILY", label: "👨‍👩‍👧‍👦 Familiar/Infantil" },
  { value: "LUXURY", label: "🌟 Lujo/Exclusivo" },
  { value: "WELLNESS", label: "💆‍♂️ Wellness/Spa" },
  { value: "NATURE", label: "🌿 Naturaleza y Senderismo" },
  { value: "BEACH", label: "🏖️ Playas y Sol" },
  { value: "ADVENTUROUS", label: "🧗 Aventurero/Extremo" },
  { value: "MOUNTAIN", label: "⛰️ Montaña y Trekking" },
  { value: "CULTURAL", label: "🏛️ Cultural/Educativo" },
  { value: "HISTORICAL", label: "🏺 Histórico/Arqueológico" },
  { value: "GASTRONOMIC", label: "🍷 Gourmet/Gastronómico" },
  { value: "URBAN", label: "🏙️ Urbano/Ciudad" },
]

const AVAILABILITY_TYPES = [
  {
    value: "OPEN_DATES",
    label: "📆 Fechas Abiertas",
    description:
      "El cliente puede elegir la fecha dentro de un rango disponible",
  },
  {
    value: "SPECIFIC_DATE",
    label: "🎯 Fecha Específica",
    description: "Salida única en una fecha y hora determinada",
  },
];

const COMMISSION_RATE = 0.1;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Hook personalizado para manejo de listas dinámicas
const useDynamicList = (initialValue = []) => {
  const [items, setItems] = useState(initialValue);

  const addItem = useCallback((newItem) => {
    setItems((prev) => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSimpleItem = useCallback((index, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  }, []);

  return { items, setItems, addItem, updateItem, removeItem, updateSimpleItem };
};

function CreatePackagePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toasts, success, error: showError, removeToast } = useToast();
  const { user } = useAuth();

  // Estados del formulario principal
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    state_origin: "Distrito Capital",
    specific_origin: "",
    state_destination: "Miranda", 
    specific_destination: "",
    base_price: "",
    duration_days: 1,
    meeting_point: "Por definir",
    meeting_time: "12:00",
    environment: "FESTIVE_MUSIC",
    max_capacity: 10,
    group_size: 10,

    operator: user?.id || "",
    // commission_rate: COMMISSION_RATE, // 0.1
    status: "PUBLISHED", // o "DRAFT"
    is_active: true,
    is_recurring: false,
    current_bookings: 0,

    // Disponibilidad
    availability_type: "OPEN_DATES",
    available_from: "",
    available_until: "",
    departure_date: "",
    departure_time: "",
  });

  // Estados para relaciones
  const [tags, setTags] = useState([]);
  const [availableIncludes, setAvailableIncludes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedIncludes, setSelectedIncludes] = useState([]);
  const [whatIsNotIncluded, setWhatIsNotIncluded] = useState([]);

  // Estados para listas dinámicas usando el hook personalizado
  const {
    items: highlights,
    addItem: addHighlight,
    updateItem: updateHighlight,
    removeItem: removeHighlight,
    updateSimpleItem: updateSimpleHighlight,
  } = useDynamicList([""]);

  const {
    items: itinerary,
    addItem: addItinerary,
    updateItem: updateItinerary,
    removeItem: removeItinerary,
  } = useDynamicList([{ day: 1, description: "" }]);

  const {
    items: variablePrices,
    addItem: addVariablePrice,
    updateItem: updateVariablePrice,
    removeItem: removeVariablePrice,
  } = useDynamicList([{ type: "", price: "" }]);

  // Estados para archivos
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);

  // Referencias para autofoco
  const lastHighlightRef = useRef(null);
  const lastItineraryRef = useRef(null);
  const lastVariablePriceRef = useRef(null);

  // Cargar datos iniciales optimizado
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tagsResponse, includesResponse] = await Promise.all([
          axiosInstance.get("/tags/"),
          axiosInstance.get("/included-items/"),
        ]);

        setTags(tagsResponse.data?.results || tagsResponse.data || []);
        setAvailableIncludes(
          includesResponse.data?.results || includesResponse.data || []
        );
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        showError("No se pudieron cargar las opciones. Verifica tu conexión.");
      }
    };

    fetchInitialData();
  }, [showError]);

  // Autofoco optimizado
  useEffect(() => {
    lastHighlightRef.current?.focus();
  }, [highlights.length]);

  useEffect(() => {
    lastItineraryRef.current?.focus();
  }, [itinerary.length]);

  useEffect(() => {
    lastVariablePriceRef.current?.focus();
  }, [variablePrices.length]);

  // Manejo de inputs del formulario
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Manejo de selecciones (tags, includes, etc.)
  const handleSelectionChange = useCallback((stateSetter, id) => {
    stateSetter((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Manejo de archivos optimizado
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Solo se permiten imágenes JPG, PNG o WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "La imagen no debe superar los 5MB.";
    }
    return null;
  };

  const handleMainImageChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        showError(`Imagen principal: ${error}`);
        return;
      }

      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    },
    [showError]
  );

  const handleGalleryImagesChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      const validFiles = [];
      const validPreviews = [];

      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          showError(`Galería: ${error}`);
          continue;
        }
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }

      if (validFiles.length > 0) {
        setGalleryImages((prev) => [...prev, ...validFiles]);
        setGalleryImagePreviews((prev) => [...prev, ...validPreviews]);
        success(
          `${validFiles.length} imagen(es) agregada(s) a la galería`,
          2000
        );
      }
    },
    [showError, success]
  );

  const removeGalleryImage = useCallback((index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Funciones para manejo de teclado
  const handleKeyDown = useCallback((e, onEnter) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  }, []);

  // Preparación de datos para envío
  const prepareFormData = useCallback(() => {
    const submitData = new FormData();

    // Campos básicos
    const allFormData = {
      ...formData,
      // Asegurar valores por defecto
      current_bookings: formData.current_bookings || 0,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
      is_recurring: formData.is_recurring || false,
      status: formData.status || "PUBLISHED",
      commission_rate: formData.commission_rate || COMMISSION_RATE,
    };

    Object.keys(allFormData).forEach((key) => {
      const value = allFormData[key];
      if (value !== "" && value !== null && value !== undefined) {
        // Convertir booleanos a string
        if (typeof value === "boolean") {
          submitData.append(key, value.toString());
        }
        // Convertir números
        else if (
          [
            "base_price",
            "duration_days",
            "group_size",
            "max_capacity",
            "current_bookings",
            "commission_rate",
          ].includes(key)
        ) {
          submitData.append(key, parseFloat(value) || 0);
        } else {
          submitData.append(key, value);
        }
      }
    });

    // Datos estructurados
    const itineraryObj = {};
    itinerary.forEach((item, index) => {
      if (item.description.trim()) {
        itineraryObj[`Día ${index + 1}`] = item.description;
      }
    });
    if (Object.keys(itineraryObj).length > 0) {
      submitData.append("itinerary", JSON.stringify(itineraryObj));
    }

    const pricesObj = {};
    variablePrices.forEach((item) => {
      if (item.type && item.price) {
        pricesObj[item.type] = parseFloat(item.price);
      }
    });
    if (Object.keys(pricesObj).length > 0) {
      submitData.append("variable_prices", JSON.stringify(pricesObj));
    }

    const highlightsArray = highlights.filter(
      (highlight) => highlight.trim() !== ""
    );
    if (highlightsArray.length > 0) {
      submitData.append("highlights", JSON.stringify(highlightsArray));
    }

    // RELACIONES - USAR LOS NOMBRES CORRECTOS
    selectedTags.forEach((tagId) => submitData.append("tag_ids", tagId));
    selectedIncludes.forEach((itemId) =>
      submitData.append("included_item_ids", itemId)
    );
    whatIsNotIncluded.forEach((itemId) =>
      submitData.append("not_included_item_ids", itemId)
    );

    // Imágenes
    if (mainImage) submitData.append("main_image", mainImage);
    galleryImages.forEach((image) =>
      submitData.append("gallery_images", image)
    );

    return submitData;
  }, [
    formData,
    itinerary,
    variablePrices,
    highlights,
    selectedTags,
    selectedIncludes,
    whatIsNotIncluded,
    mainImage,
    galleryImages,
  ]);

  // Envío del formulario optimizado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validaciones de disponibilidad
      if (formData.availability_type === "OPEN_DATES") {
        if (!formData.available_from || !formData.available_until) {
          throw new Error(
            "Para fechas abiertas, debe especificar el rango completo de fechas."
          );
        }
        if (
          new Date(formData.available_from) >=
          new Date(formData.available_until)
        ) {
          throw new Error(
            "La fecha de inicio debe ser anterior a la fecha de fin."
          );
        }
      } else if (formData.availability_type === "SPECIFIC_DATE") {
        if (!formData.departure_date) {
          throw new Error(
            "Para fecha específica, debe especificar la fecha de salida."
          );
        }
      }

      const submitData = prepareFormData();

      await axiosInstance.post("/tours/", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      success("¡Paquete creado exitosamente!", 3000);
      setTimeout(() => {
        navigate("/me", { state: { message: "Paquete creado exitosamente" } });
      }, 500);
    } catch (err) {
      console.error("Error creando paquete:", err.response?.data);

      let errorMsg = "Error al crear el paquete. Verifica todos los campos.";
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === "object") {
          const errorMessages = Object.entries(errors)
            .slice(0, 3)
            .map(([field, messages]) => {
              const fieldName = field.replace(/_/g, " ");
              const message = Array.isArray(messages) ? messages[0] : messages;
              return `${fieldName}: ${message}`;
            });
          errorMsg = errorMessages.join("\n");
        } else if (typeof errors === "string") {
          errorMsg = errors;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      showError(errorMsg, 5000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // Cálculo del precio final
  const finalPrice = formData.base_price
    ? (parseFloat(formData.base_price) * (1 + COMMISSION_RATE)).toFixed(2)
    : "0.00";

  // Componente reutilizable para checkboxes
  const CheckboxGrid = ({
    items,
    selectedItems,
    onSelectionChange,
    colorClass,
  }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);
        return (
          <div
            key={item.id}
            className={`cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 transform hover:scale-105 ${
              isSelected
                ? `${colorClass.selected} border-current shadow-md`
                : "bg-white border-gray-200 hover:border-current hover:bg-gray-50"
            }`}
            onClick={() => onSelectionChange(item.id)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? "bg-current border-current"
                    : "bg-white border-gray-300"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        Crear Nuevo Paquete Turístico
      </h1>

      {/* Previsualización de precio */}
      {formData.base_price && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800 font-semibold">
            Precio final para clientes:{" "}
            <span className="text-lg">${finalPrice}</span>
            <span className="text-sm text-blue-600 ml-2">
              (Base: ${formData.base_price} + Comisión: {COMMISSION_RATE * 100}
              %)
            </span>
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-8"
      >

        {/* Información Básica */}
        <FormSection title="📋 Información Básica">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Título del Paquete" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                placeholder="Ej: Aventura en Canaima"
              />
            </FormField>

            <FormField label="Precio Base (USD)" required>
              <input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) =>
                  handleInputChange("base_price", e.target.value)
                }
                required
                placeholder="150.00"
              />
            </FormField>

            <FormField label="Estado de Origen">
              <select
                value={formData.state_origin}
                onChange={(e) =>
                  handleInputChange("state_origin", e.target.value)
                }
              >
                {VENEZUELA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Lugar Específico de Origen">
              <input
                type="text"
                value={formData.specific_origin}
                onChange={(e) =>
                  handleInputChange("specific_origin", e.target.value)
                }
                placeholder="Ej: Aeropuerto de Maiquetía"
              />
            </FormField>

            <FormField label="Estado de Destino">
              <select
                value={formData.state_destination}
                onChange={(e) =>
                  handleInputChange("state_destination", e.target.value)
                }
              >
                {VENEZUELA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Destino Específico">
              <input
                type="text"
                value={formData.specific_destination}
                onChange={(e) =>
                  handleInputChange("specific_destination", e.target.value)
                }
                placeholder="Ej: Playa Colorada"
              />
            </FormField>

            <FormField label="Duración (días)" required>
              <input
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) =>
                  handleInputChange("duration_days", e.target.value)
                }
                required
              />
            </FormField>

            <FormField label="Entorno/Ambiente">
              <select
                value={formData.environment}
                onChange={(e) =>
                  handleInputChange("environment", e.target.value)
                }
              >
                {ENVIRONMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Descripción Larga" required>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              placeholder="Describe la experiencia completa del tour..."
            />
          </FormField>
        </FormSection>

        {/* Disponibilidad del Tour */}
        <FormSection
          title="📅 Disponibilidad del Tour"
          className="border-orange-200 bg-orange-50"
        >
          <div className="bg-white p-4 rounded-lg mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Disponibilidad *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABILITY_TYPES.map((type) => (
                <div
                  key={type.value}
                  onClick={() =>
                    handleInputChange("availability_type", type.value)
                  }
                  className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                    formData.availability_type === type.value
                      ? "border-orange-500 bg-orange-100 shadow-md"
                      : "border-gray-300 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={formData.availability_type === type.value}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {type.label}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campos condicionales para fechas abiertas */}
          {formData.availability_type === "OPEN_DATES" && (
            <div className="bg-white p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">
                🗓️ Rango de Fechas Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Disponible Desde" required>
                  <input
                    type="date"
                    value={formData.available_from}
                    onChange={(e) =>
                      handleInputChange("available_from", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </FormField>
                <FormField label="Disponible Hasta" required>
                  <input
                    type="date"
                    value={formData.available_until}
                    onChange={(e) =>
                      handleInputChange("available_until", e.target.value)
                    }
                    min={
                      formData.available_from ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </FormField>
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                ℹ️ Los clientes podrán reservar para cualquier fecha dentro de
                este rango
              </p>
            </div>
          )}

          {/* Campos condicionales para fecha específica */}
          {formData.availability_type === "SPECIFIC_DATE" && (
            <div className="bg-white p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">
                🎯 Fecha y Hora de Salida
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Fecha de Salida" required>
                  <input
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) =>
                      handleInputChange("departure_date", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </FormField>
                <FormField label="Hora de Salida">
                  <input
                    type="time"
                    value={formData.departure_time}
                    onChange={(e) =>
                      handleInputChange("departure_time", e.target.value)
                    }
                  />
                </FormField>
              </div>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                ⚠️ Esta será la única fecha disponible para este tour
              </p>
            </div>
          )}

          <FormField label="👥 Capacidad Máxima" required>
            <input
              type="number"
              min="1"
              value={formData.max_capacity}
              onChange={(e) =>
                handleInputChange("max_capacity", e.target.value)
              }
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número máximo de personas que pueden reservar
            </p>
          </FormField>
        </FormSection>

        {/* Punto de Encuentro */}
        <FormSection title="📍 Punto de Encuentro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Lugar de Encuentro">
              <input
                type="text"
                value={formData.meeting_point}
                onChange={(e) =>
                  handleInputChange("meeting_point", e.target.value)
                }
                placeholder="Ej: Terminal La Bandera"
              />
            </FormField>
            <FormField label="Hora de Encuentro">
              <input
                type="time"
                value={formData.meeting_time}
                onChange={(e) =>
                  handleInputChange("meeting_time", e.target.value)
                }
              />
            </FormField>
          </div>
        </FormSection>

        {/* Resto de las secciones (Puntos Destacados, Precios Variables, Itinerario, Imágenes, etc.) */}
        {/* ... mantén el mismo código para estas secciones, pero usando los nuevos hooks ... */}

        {/* Sección de Puntos Destacados */}
        <FormSection title="⭐ Puntos Destacados">
          <p className="text-sm text-gray-600 mb-4">
            Lista los aspectos más atractivos de tu tour
          </p>
          {highlights.map((highlight, index) => (
            <DynamicField
              key={index}
              index={index}
              value={highlight}
              onChange={(value) => updateSimpleHighlight(index, value)}
              onRemove={() => removeHighlight(index)}
              placeholder="Ej: Playa privada, Buffet incluido, Guía bilingüe..."
              showRemove={highlights.length > 1}
              label={`Punto destacado ${index + 1}`}
              ref={index === highlights.length - 1 ? lastHighlightRef : null}
            />
          ))}
          <AddButton onClick={() => addHighlight("")}>
            + Añadir punto destacado
          </AddButton>
        </FormSection>

        {/* Sección de Precios Variables */}
        <FormSection title="💰 Precios Variables y Extras">
          {variablePrices.map((price, index) => (
            <div
              key={index}
              className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg"
            >
              <input
                ref={
                  index === variablePrices.length - 1
                    ? lastVariablePriceRef
                    : null
                }
                type="text"
                value={price.type}
                onChange={(e) =>
                  updateVariablePrice(index, "type", e.target.value)
                }
                placeholder="Ej: Niños, Adulto Mayor..."
                className="w-1/2 rounded-md border-gray-300"
              />
              <input
                type="number"
                step="0.01"
                value={price.price}
                onChange={(e) =>
                  updateVariablePrice(index, "price", e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, () =>
                    addVariablePrice({ type: "", price: "" })
                  )
                }
                placeholder="Precio (USD)"
                className="w-1/2 rounded-md border-gray-300"
              />
              {variablePrices.length > 1 && (
                <RemoveButton onClick={() => removeVariablePrice(index)} />
              )}
            </div>
          ))}
          <AddButton onClick={() => addVariablePrice({ type: "", price: "" })}>
            + Añadir precio variable
          </AddButton>
        </FormSection>

        {/* Sección de Itinerario */}
        <FormSection title="🗓️ Itinerario Detallado">
          {itinerary.map((day, index) => (
            <div key={index} className="flex gap-4 items-start">
              <span className="font-bold mt-2">Día {index + 1}:</span>
              <textarea
                ref={index === itinerary.length - 1 ? lastItineraryRef : null}
                value={day.description}
                onChange={(e) =>
                  updateItinerary(index, "description", e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, () =>
                    addItinerary({ day: itinerary.length + 1, description: "" })
                  )
                }
                placeholder={`Describe las actividades del día ${index + 1}`}
                className="flex-grow rounded-md"
                rows="3"
              />
              {itinerary.length > 1 && (
                <RemoveButton onClick={() => removeItinerary(index)} />
              )}
            </div>
          ))}
          <AddButton
            onClick={() =>
              addItinerary({ day: itinerary.length + 1, description: "" })
            }
          >
            + Añadir día al itinerario
          </AddButton>
        </FormSection>

        {/* Sección de Imágenes (mantener igual) */}
        <FormSection title="🖼️ Imágenes">
          <ImageUpload
            mainImage={mainImage}
            mainImagePreview={mainImagePreview}
            onMainImageChange={handleMainImageChange}
            galleryImages={galleryImages}
            galleryImagePreviews={galleryImagePreviews}
            onGalleryImagesChange={handleGalleryImagesChange}
            onRemoveGalleryImage={removeGalleryImage}
          />
        </FormSection>

        {/* Secciones de Tags e Includes (mantener estructura similar) */}
        <FormSection title="🏷️ Etiquetas">
          <CheckboxGrid
            items={tags}
            selectedItems={selectedTags}
            onSelectionChange={(id) =>
              handleSelectionChange(setSelectedTags, id)
            }
            colorClass={{ selected: "bg-green-100 text-green-500" }}
          />
        </FormSection>

        <FormSection title="✅ ¿Qué Incluye el Paquete?">
          {availableIncludes.length > 0 ? (
            <CheckboxGrid
              items={availableIncludes}
              selectedItems={selectedIncludes}
              onSelectionChange={(id) =>
                handleSelectionChange(setSelectedIncludes, id)
              }
              colorClass={{ selected: "bg-orange-100 text-orange-500" }}
            />
          ) : (
            <p className="text-sm text-gray-500 italic">Cargando opciones...</p>
          )}
        </FormSection>

        <FormSection title="❌ ¿Qué NO Incluye el Paquete?">
          {availableIncludes.length > 0 ? (
            <CheckboxGrid
              items={availableIncludes}
              selectedItems={whatIsNotIncluded}
              onSelectionChange={(id) =>
                handleSelectionChange(setWhatIsNotIncluded, id)
              }
              colorClass={{ selected: "bg-red-100 text-red-500" }}
            />
          ) : (
            <p className="text-sm text-gray-500 italic">Cargando opciones...</p>
          )}
        </FormSection>

        {/* Sección de Configuración Avanzada (puedes hacerla colapsable) */}
        <FormSection
          title="⚙️ Configuración Avanzada"
          className="border-gray-200 bg-gray-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Estado del Paquete">
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </FormField>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  handleInputChange("is_active", e.target.checked)
                }
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Paquete Activo
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) =>
                  handleInputChange("is_recurring", e.target.checked)
                }
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label
                htmlFor="is_recurring"
                className="ml-2 text-sm text-gray-700"
              >
                Es Recurrente
              </label>
            </div>
          </div>
        </FormSection>

        {/* Mensajes de error y botones de envío */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <SpinnerIcon className="w-5 h-5" />}
            {loading ? "Creando..." : "Publicar Paquete"}
          </button>
        </div>
      </form>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

// Componentes auxiliares para mejorar la legibilidad
const FormSection = ({ title, children, className = "" }) => (
  <fieldset
    className={`space-y-4 border-2 border-gray-200 p-6 rounded-lg ${className}`}
  >
    <legend className="text-xl font-semibold text-gray-700 px-2">
      {title}
    </legend>
    {children}
  </fieldset>
);

const FormField = ({ label, required = false, children, ...props }) => (
  <div {...props}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && "*"}
    </label>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        className: `w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border ${
          child.props.className || ""
        }`,
      })
    )}
  </div>
);

const DynamicField = React.forwardRef(
  (
    { index, value, onChange, onRemove, placeholder, showRemove, label },
    ref
  ) => (
    <div className="flex gap-4 items-start border rounded-lg p-4 bg-green-50">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        />
      </div>
      {showRemove && <RemoveButton onClick={onRemove} />}
    </div>
  )
);

const RemoveButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-6 text-red-500 hover:text-red-700 p-2"
  >
    <XIcon className="w-5 h-5" />
  </button>
);

const AddButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-2 border-2 border-dashed border-green-300 text-green-500 hover:bg-green-50 rounded-lg font-semibold"
  >
    {children}
  </button>
);

const ImageUpload = ({
  mainImage,
  mainImagePreview,
  onMainImageChange,
  galleryImages,
  galleryImagePreviews,
  onGalleryImagesChange,
  onRemoveGalleryImage,
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Imagen Principal
      </label>
      <div className="mt-2 flex items-center gap-4">
        {mainImagePreview ? (
          <img
            src={mainImagePreview}
            alt="Vista previa"
            className="h-24 w-24 object-cover rounded-lg"
          />
        ) : (
          <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            <UploadIcon className="w-8 h-8" />
          </div>
        )}
        <input
          type="file"
          id="main_image"
          onChange={onMainImageChange}
          className="hidden"
        />
        <label
          htmlFor="main_image"
          className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {mainImage ? "Cambiar" : "Seleccionar"}
        </label>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Imágenes de Galería
      </label>
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {galleryImagePreviews.map((preview, index) => (
          <div key={index} className="relative">
            <img
              src={preview}
              alt={`Galería ${index + 1}`}
              className="h-24 w-full object-cover rounded-lg"
            />
            <button
              onClick={() => onRemoveGalleryImage(index)}
              type="button"
              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 leading-none"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <label
          htmlFor="gallery_images"
          className="cursor-pointer h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500"
        >
          <UploadIcon className="w-8 h-8" />
          <span className="text-xs mt-1">Añadir</span>
          <input
            type="file"
            id="gallery_images"
            multiple
            onChange={onGalleryImagesChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  </>
);

export default CreatePackagePage;
