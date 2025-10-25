import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { XIcon, UploadIcon, SpinnerIcon } from "../Shared/icons";

// Lista de estados de Venezuela
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
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function EditPackagePage() {
  const navigate = useNavigate();
  const { packageId } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados del formulario (SINCRONIZADO CON CREATE)
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
    environment: "RELAXING_NO_MUSIC",
    group_size: 10,
    is_active: true,
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
  const [existingImages, setExistingImages] = useState([]);

  // Referencias para autofoco
  const lastHighlightRef = useRef(null);
  const lastItineraryRef = useRef(null);
  const lastVariablePriceRef = useRef(null);

  // Cargar datos del paquete
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const [packageResponse, tagsResponse, includesResponse] =
          await Promise.all([
            axiosInstance.get(`/tours/${packageId}/`),
            axiosInstance.get("/tags/"),
            axiosInstance.get("/included-items/"),
          ]);

        const data = packageResponse.data;

        // 1. Campos básicos (SINCRONIZADO CON CREATE)
        setFormData({
          title: data.title || "",
          description: data.description || "",
          state_origin: data.state_origin || "Distrito Capital",
          specific_origin: data.specific_origin || "",
          state_destination: data.state_destination || "Miranda",
          specific_destination: data.specific_destination || "",
          base_price: data.base_price || "",
          duration_days: data.duration_days || 1,
          meeting_point: data.meeting_point || "Por definir",
          meeting_time: data.meeting_time?.substring(0, 5) || "12:00",
          environment: data.environment || "RELAXING_NO_MUSIC",
          group_size: data.group_size || 10,
          is_active: data.is_active !== undefined ? data.is_active : true,
        });

        // 2. Relaciones
        setSelectedTags(
          data.tags?.map((tag) => tag.id).filter((id) => id) || []
        );
        setSelectedIncludes(
          data.what_is_included?.map((item) => item.id).filter((id) => id) || []
        );
        setWhatIsNotIncluded(
          data.what_is_not_included
            ?.map((item) => item.id)
            .filter((id) => id) || []
        );
        setExistingImages(data.images || []);

        // 3. Highlights
        if (data.highlights && Array.isArray(data.highlights)) {
          setHighlights(data.highlights.length > 0 ? data.highlights : [""]);
        }

        // 4. Itinerario
        if (data.itinerary && typeof data.itinerary === "object") {
          const itineraryArray = Object.entries(data.itinerary).map(
            ([day, description], index) => ({
              day: index + 1,
              description: description || "",
            })
          );
          setItinerary(
            itineraryArray.length > 0
              ? itineraryArray
              : [{ day: 1, description: "" }]
          );
        }

        // 5. Precios variables
        if (data.variable_prices && typeof data.variable_prices === "object") {
          const pricesArray = Object.entries(data.variable_prices).map(
            ([type, price]) => ({
              type,
              price: price.toString(),
            })
          );
          setVariablePrices(
            pricesArray.length > 0 ? pricesArray : [{ type: "", price: "" }]
          );
        }

        // 6. Previsualización de imágenes existentes
        if (data.images && Array.isArray(data.images)) {
          const mainImg = data.images.find((img) => img.is_main_image);
          if (mainImg) {
            setMainImagePreview(mainImg.image);
          }
          const galleryImgs = data.images.filter((img) => !img.is_main_image);
          setGalleryImagePreviews(galleryImgs.map((img) => img.image));
        }

        // 7. Datos disponibles
        setTags(tagsResponse.data || []);
        
        const includesData = includesResponse.data;
        setAvailableIncludes(
          Array.isArray(includesData) 
            ? includesData 
            : (includesData.results || [])
        );
      } catch (err) {
        console.error("Error cargando paquete:", err);
        setError(
          "No se pudo cargar el paquete. Verifica que exista y tengas permisos."
        );
      }
    };

    fetchPackageData();
  }, [packageId]);

  // --- MANEJADORES CORREGIDOS (SINCRONIZADOS CON CREATE) ---

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleIncludeChange = (itemId) => {
    setSelectedIncludes((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNotIncludeChange = (itemId) => {
    setWhatIsNotIncluded((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Highlights
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

  // Itinerario
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

  // Manejo de imágenes (SINCRONIZADO CON CREATE)
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(
          "Imagen principal: Solo se permiten imágenes JPG, PNG o WebP."
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Imagen principal: La imagen no debe superar los 5MB.");
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
    } else {
      setGalleryImages((prev) => [...prev, ...newImages]);
      setGalleryImagePreviews((prev) => [...prev, ...newPreviews]);
      setError("");
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const removeExistingImage = async (imageId) => {
    try {
      await axiosInstance.delete(`/package-images/${imageId}/`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error eliminando imagen:", err);
      setError("Error al eliminar la imagen");
    }
  };

  // Envío del formulario CORREGIDO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();

      // Campos básicos
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === "meeting_time") {
            submitData.append(key, `${formData[key]}:00`);
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Itinerario
      const itineraryObj = {};
      itinerary.forEach((item, index) => {
        if (item.description.trim()) {
          itineraryObj[`Día ${index + 1}`] = item.description;
        }
      });
      if (Object.keys(itineraryObj).length > 0) {
        submitData.append("itinerary", JSON.stringify(itineraryObj));
      }

      // Precios variables
      const pricesObj = {};
      variablePrices.forEach((item) => {
        if (item.type && item.price) {
          pricesObj[item.type] = parseFloat(item.price);
        }
      });
      if (Object.keys(pricesObj).length > 0) {
        submitData.append("variable_prices", JSON.stringify(pricesObj));
      }

      // Highlights
      const highlightsArray = highlights.filter(
        (highlight) => highlight.trim() !== ""
      );
      if (highlightsArray.length > 0) {
        submitData.append("highlights", JSON.stringify(highlightsArray));
      }

      // Relaciones
      selectedTags.forEach((tagId) => submitData.append("tag_ids", tagId));
      selectedIncludes.forEach((itemId) =>
        submitData.append("included_item_ids", itemId)
      );
      whatIsNotIncluded.forEach((itemId) =>
        submitData.append("what_is_not_included_ids", itemId)
      );

      // Imágenes
      if (mainImage) submitData.append("main_image", mainImage);
      galleryImages.forEach((image) =>
        submitData.append("gallery_images", image)
      );

      await axiosInstance.patch(`/tours/${packageId}/`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/me", {
        state: { message: "Paquete actualizado exitosamente" },
      });
    } catch (err) {
      console.error("Error actualizando paquete:", err.response?.data);
      const errorMsg = err.response?.data
        ? Object.values(err.response.data).flat().join(", ")
        : "Error al actualizar el paquete";
      setError(errorMsg);
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
        Editar Paquete Turístico
      </h1>

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
        {/* INFORMACIÓN BÁSICA - COMPLETO */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Información Básica
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

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

        {/* PUNTO Y HORA DE ENCUENTRO */}
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

        {/* PUNTOS DESTACADOS */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Puntos Destacados
          </legend>
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
                  ref={
                    index === highlights.length - 1 ? lastHighlightRef : null
                  }
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

        {/* PRECIOS VARIABLES */}
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
                  updateVariablePrice(index, "type", e.target.value)
                }
                placeholder="Ej: Niños, Adulto Mayor, Extra..."
                className="w-1/2 rounded-md border-gray-300"
              />
              <input
                type="number"
                step="0.01"
                value={price.price}
                onChange={(e) =>
                  updateVariablePrice(index, "price", e.target.value)
                }
                placeholder="Precio Adicional (USD)"
                className="w-1/2 rounded-md border-gray-300"
              />
              {variablePrices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariablePrice(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addVariablePrice}
            className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-500 hover:bg-purple-50 rounded-lg font-semibold"
          >
            + Añadir precio variable
          </button>
        </fieldset>

        {/* ITINERARIO */}
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
                onChange={(e) => updateItineraryDay(index, e.target.value)}
                placeholder={`Describe las actividades del día ${index + 1}`}
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                rows="3"
              />
              {itinerary.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="mt-2 text-red-500 hover:text-red-700 p-2"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItineraryDay}
            className="w-full py-2 border-2 border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-lg font-semibold"
          >
            + Añadir día al itinerario
          </button>
        </fieldset>

        {/* SECCIÓN DE IMÁGENES */}
        <fieldset className="space-y-6">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Imágenes
          </legend>

          {/* Imagen Principal */}
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

          {/* Galería de Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Imágenes de Galería
            </label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {/* Imágenes existentes */}
              {existingImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.image}
                    alt={`Existente ${image.id}`}
                    className="h-24 w-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeExistingImage(image.id)}
                    type="button"
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 leading-none"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Nuevas imágenes de galería */}
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

        {/* ETIQUETAS */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Etiquetas
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">{tag.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* QUÉ INCLUYE */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            ¿Qué Incluye el Paquete?
          </legend>
          {availableIncludes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {availableIncludes.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIncludes.includes(item.id)}
                    onChange={() => handleIncludeChange(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Cargando opciones...</p>
          )}
        </fieldset>

        {/* QUÉ NO INCLUYE */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            ¿Qué NO Incluye el Paquete?
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {availableIncludes.map((item) => (
              <label
                key={item.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={whatIsNotIncluded.includes(item.id)}
                  onChange={() => handleNotIncludeChange(item.id)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* ESTADO ACTIVO/INACTIVO */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Estado del Paquete
          </legend>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-700"
            >
              Paquete activo (visible para clientes)
            </label>
          </div>
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
            {loading ? "Actualizando..." : "Actualizar Paquete"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPackagePage;
