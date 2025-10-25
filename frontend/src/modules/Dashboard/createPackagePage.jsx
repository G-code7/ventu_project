import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { XIcon, UploadIcon, SpinnerIcon } from "../Shared/icons";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../Toast/toastContainer";

// Estados de Venezuela
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

// Opciones de entorno/ambiente
const ENVIRONMENT_OPTIONS = [
  { value: "FESTIVE_MUSIC", label: "🎉 Festivo con Música" },
  { value: "RELAXING_NO_MUSIC", label: "😌 Relajante sin Música" },
  { value: "ADVENTUROUS", label: "🧗 Aventurero/Extremo" },
  { value: "CULTURAL", label: "🏛️ Cultural/Educativo" },
  { value: "ROMANTIC", label: "💝 Romántico" },
  { value: "FAMILY", label: "👨‍👩‍👧‍👦 Familiar" },
  { value: "LUXURY", label: "🌟 Lujo/Exclusivo" },
];

// Comisión fija
const COMMISSION_RATE = 0.1;
// Manejo de imagenes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function CreatePackagePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados del formulario
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
    // campos nuevos
    environment: "RELAXING_NO_MUSIC",
    group_size: 10,
  });

  // Estados para relaciones
  const [tags, setTags] = useState([]);
  const [availableIncludes, setAvailableIncludes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedIncludes, setSelectedIncludes] = useState([]);
  const [whatIsNotIncluded, setWhatIsNotIncluded] = useState([]);
  const [highlights, setHighlights] = useState([""]);
  const [itinerary, setItinerary] = useState([{ day: 1, description: "" }]);
  const [variablePrices, setVariablePrices] = useState([
    { type: "", price: "" },
  ]);

  // Estados para archivos
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const { toasts, success, error: showError, removeToast } = useToast();

  // --- Referencias para Autofoco ---
  const lastHighlightRef = useRef(null);
  const lastItineraryRef = useRef(null);
  const lastVariablePriceRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tagsResponse, includesResponse] = await Promise.all([
          axiosInstance.get("/tags/"),
          axiosInstance.get("/included-items/"),
        ]);

        // Para tags
        const tagsData = tagsResponse.data;
        setTags(Array.isArray(tagsData) ? tagsData : tagsData.results || []);

        // Para included-items
        const includesData = includesResponse.data;
        setAvailableIncludes(
          Array.isArray(includesData)
            ? includesData
            : includesData.results || []
        );
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        setError("No se pudieron cargar las opciones. Verifica tu conexión.");
        setTags([]);
        setAvailableIncludes([]);
      }
    };
    fetchInitialData();
  }, []);

  // --- Autofoco ---
  useEffect(() => {
    if (lastHighlightRef.current) {
      lastHighlightRef.current.focus();
    }
  }, [highlights.length]);

  useEffect(() => {
    if (lastItineraryRef.current) {
      lastItineraryRef.current.focus();
    }
  }, [itinerary.length]);

  useEffect(() => {
    if (lastVariablePriceRef.current) {
      lastVariablePriceRef.current.focus();
    }
  }, [variablePrices.length]);

  // Manejar cambios en campos simples
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (stateSetter, id) => {
    stateSetter((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // --- Manejadores de Listas Dinámicas (con "Enter" y autofoco) ---
  const handleDynamicListChange = (stateSetter, index, value, field = null) => {
    stateSetter((prev) =>
      prev.map((item, i) =>
        i === index ? (field ? { ...item, [field]: value } : value) : item
      )
    );
  };

  const addDynamicItem = (stateSetter, newItem) => {
    stateSetter((prev) => [...prev, newItem]);
  };

  const removeDynamicItem = (stateSetter, index) => {
    stateSetter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e, onEnter) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  };

  // --- Manejo de Imágenes con Previsualización ---
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        const errorMsg =
          "Imagen principal: Solo se permiten imágenes JPG, PNG o WebP.";
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = "Imagen principal: La imagen no debe superar los 5MB.";
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];
    let galleryError = "";

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        galleryError = "Galería: Solo se permiten imágenes JPG, PNG o WebP.";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        galleryError = "Galería: Una o más imágenes superan los 5MB.";
        return;
      }
      newImages.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (galleryError) {
      setError(galleryError);
      showError(galleryError);
    } else {
      setGalleryImages((prev) => [...prev, ...newImages]);
      setGalleryImagePreviews((prev) => [...prev, ...newPreviews]);
      setError("");

      success(`${newImages.length} imagen(es) agregada(s) a la galería`, 2000);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revocar el Object URL para liberar memoria
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  // Manejar tags
  const handleTagChange = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Manejar items incluidos
  const handleIncludeChange = (itemId) => {
    setSelectedIncludes((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Manejar items NO incluidos
  const handleNotIncludeChange = (itemId) => {
    setWhatIsNotIncluded((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Itinerario - funciones optimizadas
  const addItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      { day: prev.length + 1, description: "" },
    ]);
  };

  const updateItineraryDay = (index, value) => {
    setItinerary((prev) =>
      prev.map((day, i) => (i === index ? { ...day, description: value } : day))
    );
  };

  const removeItineraryDay = (index) => {
    if (itinerary.length > 1) {
      setItinerary((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Highlights - funciones
  const addHighlight = () => {
    setHighlights((prev) => [...prev, ""]);
  };

  const updateHighlight = (index, value) => {
    setHighlights((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  const removeHighlight = (index) => {
    if (highlights.length > 1) {
      setHighlights((prev) => prev.filter((_, i) => i !== index));
    }
  };
  // Precios variables
  const addVariablePrice = () => {
    setVariablePrices((prev) => [...prev, { type: "", price: "" }]);
  };

  const updateVariablePrice = (index, field, value) => {
    setVariablePrices((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeVariablePrice = (index) => {
    if (variablePrices.length > 1) {
      setVariablePrices((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];

  //   if (!ALLOWED_TYPES.includes(file.type)) {
  //     setError("Solo se permiten imágenes JPG, PNG o WebP");
  //     return;
  //   }

  //   if (file.size > MAX_FILE_SIZE) {
  //     setError("La imagen no debe superar 5MB");
  //     return;
  //   }

  //   setMainImage(file);
  // };

  // Envío del formulario - OPTIMIZADO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();

      // 1. Campos básicos (NO incluir commission_rate - se maneja automáticamente en el backend)
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      // 2. Itinerario como JSON válido
      const itineraryObj = {};
      itinerary.forEach((item, index) => {
        if (item.description.trim()) {
          itineraryObj[`Día ${index + 1}`] = item.description;
        }
      });
      if (Object.keys(itineraryObj).length > 0) {
        submitData.append("itinerary", JSON.stringify(itineraryObj));
      }

      // 3. Precios variables como JSON válido
      const pricesObj = {};
      variablePrices.forEach((item) => {
        if (item.type && item.price) {
          pricesObj[item.type] = parseFloat(item.price);
        }
      });
      if (Object.keys(pricesObj).length > 0) {
        submitData.append("variable_prices", JSON.stringify(pricesObj));
      }

      // Highlights como JSON válido
      const highlightsArray = highlights.filter(
        (highlight) => highlight.trim() !== ""
      );
      if (highlightsArray.length > 0) {
        submitData.append("highlights", JSON.stringify(highlightsArray));
      }

      // 4. Relaciones
      selectedTags.forEach((tagId) => submitData.append("tag_ids", tagId));
      selectedIncludes.forEach((itemId) =>
        submitData.append("included_item_ids", itemId)
      );
      whatIsNotIncluded.forEach((itemId) =>
        submitData.append("what_is_not_included_ids", itemId)
      );

      // 5. Imágenes
      if (mainImage) submitData.append("main_image", mainImage);
      galleryImages.forEach((image) =>
        submitData.append("gallery_images", image)
      );

      const response = await axiosInstance.post("/tours/", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // toast success
      success("¡Paquete creado exitosamente!", 3000);
      setTimeout(() => {
        navigate("/me", {
          state: { message: "Paquete creado exitosamente" },
        });
      }, 500);
    } catch (err) {
      console.error("Error creando paquete:", err.response?.data);
      let errorMsg = "Error al crear el paquete. Verifica todos los campos.";

      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === "object") {
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => {
              const fieldName = field.replace(/_/g, " ");
              const message = Array.isArray(messages) ? messages[0] : messages;
              return `${fieldName}: ${message}`;
            })
            .slice(0, 3); // Mostrar máximo 3 errores

          errorMsg = errorMessages.join("\n");
        } else if (typeof errors === "string") {
          errorMsg = errors;
        }
      }
      setError(errorMsg);
      showError(errorMsg, 5000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = formData.base_price
    ? (parseFloat(formData.base_price) / (1 - COMMISSION_RATE)).toFixed(2)
    : "0.00";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        Crear Nuevo Paquete Turístico
      </h1>

      {/* Previsualización de precio*/}
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
          <p className="text-xs text-blue-600 mt-1">
            * La comisión del {COMMISSION_RATE * 100}% es fija y se aplica
            automáticamente
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-8"
      >
        {/* Información Básica  */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Información Básica
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Título del Paquete
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Precio Base */}
            <div>
              <label
                htmlFor="base_price"
                className="block text-sm font-medium text-gray-700"
              >
                Precio Base (USD)
              </label>
              <input
                type="number"
                id="base_price"
                step="0.01"
                value={formData.base_price}
                onChange={(e) =>
                  handleInputChange("base_price", e.target.value)
                }
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Estado de Origen */}
            <div>
              <label
                htmlFor="state_origin"
                className="block text-sm font-medium text-gray-700"
              >
                Estado de Origen
              </label>
              <select
                id="state_origin"
                value={formData.state_origin}
                onChange={(e) =>
                  handleInputChange("state_origin", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                {VENEZUELA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Lugar Específico de Origen */}
            <div>
              <label
                htmlFor="specific_origin"
                className="block text-sm font-medium text-gray-700"
              >
                Lugar Específico de Origen
              </label>
              <input
                type="text"
                id="specific_origin"
                value={formData.specific_origin}
                onChange={(e) =>
                  handleInputChange("specific_origin", e.target.value)
                }
                placeholder="Ej: Aeropuerto de Maiquetía, Terminal de La Bandera"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Estado de Destino */}
            <div>
              <label
                htmlFor="state_destination"
                className="block text-sm font-medium text-gray-700"
              >
                Estado de Destino
              </label>
              <select
                id="state_destination"
                value={formData.state_destination}
                onChange={(e) =>
                  handleInputChange("state_destination", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                {VENEZUELA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Destino Específico */}
            <div>
              <label
                htmlFor="specific_destination"
                className="block text-sm font-medium text-gray-700"
              >
                Destino Específico
              </label>
              <input
                type="text"
                id="specific_destination"
                value={formData.specific_destination}
                onChange={(e) =>
                  handleInputChange("specific_destination", e.target.value)
                }
                placeholder="Ej: Playa Colorada, Parque Nacional Morrocoy"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Duración */}
            <div>
              <label
                htmlFor="duration_days"
                className="block text-sm font-medium text-gray-700"
              >
                Duración (días)
              </label>
              <input
                type="number"
                id="duration_days"
                min="1"
                value={formData.duration_days}
                onChange={(e) =>
                  handleInputChange("duration_days", e.target.value)
                }
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Tamaño del Grupo */}
            <div>
              <label
                htmlFor="group_size"
                className="block text-sm font-medium text-gray-700"
              >
                Tamaño Máximo del Grupo
              </label>
              <input
                type="number"
                id="group_size"
                min="1"
                value={formData.group_size}
                onChange={(e) =>
                  handleInputChange("group_size", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Entorno/Ambiente */}
            <div>
              <label
                htmlFor="environment"
                className="block text-sm font-medium text-gray-700"
              >
                Entorno/Ambiente
              </label>
              <select
                id="environment"
                value={formData.environment}
                onChange={(e) =>
                  handleInputChange("environment", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                {ENVIRONMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción Larga */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción Larga
            </label>
            <textarea
              id="description"
              rows="4"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </fieldset>

        {/* Punto y Hora de Encuentro */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Punto y Hora de Encuentro
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="meeting_point"
                className="block text-sm font-medium text-gray-700"
              >
                Punto de Encuentro
              </label>
              <input
                type="text"
                id="meeting_point"
                value={formData.meeting_point}
                onChange={(e) =>
                  handleInputChange("meeting_point", e.target.value)
                }
                placeholder="Ej: Aeropuerto Internacional de Maiquetía"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label
                htmlFor="meeting_time"
                className="block text-sm font-medium text-gray-700"
              >
                Hora de Encuentro
              </label>
              <input
                type="time"
                id="meeting_time"
                value={formData.meeting_time}
                onChange={(e) =>
                  handleInputChange("meeting_time", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
        </fieldset>
        {/* Puntos Destacados */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Puntos Destacados
          </legend>
          <p className="text-sm text-gray-600 mb-4">
            Lista los aspectos más atractivos de tu tour que quieres resaltar.
          </p>

          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex gap-4 items-start border rounded-lg p-4 bg-green-50"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punto destacado {index + 1}
                </label>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  placeholder="Ej: Playa privada, Buffet incluido, Guía bilingüe..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              {highlights.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="mt-6 text-red-500 hover:text-red-700 p-2"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addHighlight}
            className="w-full py-2 border-2 border-dashed border-green-300 text-green-500 hover:bg-green-50 rounded-lg font-semibold"
          >
            + Añadir punto destacado
          </button>
        </fieldset>

        {/* Precios Variables - PARA EXTRAS */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Precios Variables y Extras
          </legend>
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
                  handleDynamicListChange(
                    setVariablePrices,
                    index,
                    e.target.value,
                    "type"
                  )
                }
                placeholder="Ej: Niños, Adulto Mayor, Extra..."
                className="w-1/2 rounded-md border-gray-300"
              />
              <input
                type="number"
                step="0.01"
                value={price.price}
                onChange={(e) =>
                  handleDynamicListChange(
                    setVariablePrices,
                    index,
                    e.target.value,
                    "price"
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, () =>
                    addDynamicItem(setVariablePrices, { type: "", price: "" })
                  )
                }
                placeholder="Precio Adicional (USD)"
                className="w-1/2 rounded-md border-gray-300"
              />
              {variablePrices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDynamicItem(setVariablePrices, index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addDynamicItem(setVariablePrices, { type: "", price: "" })
            }
            className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-500 hover:bg-purple-50 rounded-lg font-semibold"
          >
            + Añadir precio variable
          </button>
        </fieldset>

        {/* Itinerario */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Itinerario Detallado
          </legend>
          {itinerary.map((day, index) => (
            <div key={index} className="flex gap-4 items-start">
              <span className="font-bold mt-2">Día {index + 1}:</span>
              <textarea
                ref={index === itinerary.length - 1 ? lastItineraryRef : null}
                value={day.description}
                onChange={(e) =>
                  handleDynamicListChange(
                    setItinerary,
                    index,
                    e.target.value,
                    "description"
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, () =>
                    addDynamicItem(setItinerary, {
                      day: itinerary.length + 1,
                      description: "",
                    })
                  )
                }
                placeholder={`Describe las actividades del día ${index + 1}`}
                className="flex-grow rounded-md"
                rows="3"
              />
              {itinerary.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDynamicItem(setItinerary, index)}
                  className="mt-2 text-red-500 hover:text-red-700 p-2"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addDynamicItem(setItinerary, {
                day: itinerary.length + 1,
                description: "",
              })
            }
            className="w-full py-2 border-2 border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-lg font-semibold"
          >
            + Añadir día al itinerario
          </button>
        </fieldset>

        {/* Sección de Imágenes */}
        <fieldset className="space-y-6">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Imágenes
          </legend>
          {/* Main Image */}
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
                onChange={handleMainImageChange}
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

          {/* Gallery Images */}
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
                    onClick={() => removeGalleryImage(index)}
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
                  onChange={handleGalleryImagesChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </fieldset>

        {/* Etiquetas */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Etiquetas
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <div
                  key={tag.id}
                  className={`cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 transform hover:scale-105 ${
                    isSelected
                      ? "bg-green-100 border-green-500 shadow-md"
                      : "bg-white border-gray-200 hover:border-green-300 hover:bg-green-50"
                  }`}
                  onClick={() => handleTagChange(tag.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {tag.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-green-500 border-green-500"
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
        </fieldset>

        {/* Qué Incluye */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            ¿Qué Incluye el Paquete?
          </legend>
          {availableIncludes && availableIncludes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
              {availableIncludes.map((item) => {
                const isSelected = selectedIncludes.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 transform hover:scale-105 ${
                      isSelected
                        ? "bg-orange-100 border-orange-500 shadow-md"
                        : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                    onClick={() => handleIncludeChange(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-orange-500 border-orange-500"
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
          ) : (
            <p className="text-sm text-gray-500 italic">
              {availableIncludes === null
                ? "Cargando opciones..."
                : "No hay opciones disponibles"}
            </p>
          )}
        </fieldset>

        {/* Qué NO Incluye */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            ¿Qué NO Incluye el Paquete?
          </legend>
          {availableIncludes && availableIncludes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
              {availableIncludes.map((item) => {
                const isSelected = whatIsNotIncluded.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 transform hover:scale-105 ${
                      isSelected
                        ? "bg-red-100 border-red-500 shadow-md"
                        : "bg-white border-gray-200 hover:border-red-300 hover:bg-red-50"
                    }`}
                    onClick={() => handleNotIncludeChange(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-red-500 border-red-500"
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
          ) : (
            <p className="text-sm text-gray-500 italic">
              {availableIncludes === null
                ? "Cargando opciones..."
                : "No hay opciones disponibles"}
            </p>
          )}
        </fieldset>

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

export default CreatePackagePage;
