import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { XIcon } from "../Shared/icons";

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

  // Estados para arrays dinámicos
  const [itinerary, setItinerary] = useState([{ day: 1, description: "" }]);
  const [variablePrices, setVariablePrices] = useState([
    { type: "", price: "" },
  ]);

  // Estados para archivos
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // Comisión fija - no editable
  const COMMISSION_RATE = 0.1; // 10% fijo

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tagsResponse, includesResponse] = await Promise.all([
          axiosInstance.get("/tags/"),
          axiosInstance.get("/included-items/"),
        ]);
        setTags(tagsResponse.data);
        setAvailableIncludes(includesResponse.data);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        setError("No se pudieron cargar las opciones. Verifica tu conexión.");
      }
    };
    fetchInitialData();
  }, []);

  // Manejar cambios en campos simples
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      // 6. Enviar
      const response = await axiosInstance.post("/tours/", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/me", {
        state: { message: "Paquete creado exitosamente" },
      });
    } catch (err) {
      console.error("Error creando paquete:", err.response?.data);
      const errorMsg = err.response?.data
        ? Object.values(err.response.data).flat().join(", ")
        : "Error al crear el paquete. Verifica todos los campos.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = formData.base_price
    ? (parseFloat(formData.base_price) / (1 - COMMISSION_RATE)).toFixed(2)
    : 0;

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
            <div key={index} className="flex gap-4 items-start border rounded-lg p-4 bg-green-50">
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
          <p className="text-sm text-gray-600 mb-4">
            Define precios especiales para diferentes tipos de participantes o
            servicios extras.
          </p>

          {variablePrices.map((price, index) => (
            <div
              key={index}
              className="flex gap-4 items-start border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Participante o Servicio
                  </label>
                  <input
                    type="text"
                    value={price.type}
                    onChange={(e) =>
                      updateVariablePrice(index, "type", e.target.value)
                    }
                    placeholder="Ej: Niños, Tercera Edad, Seguro, Comidas..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Adicional (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price.price}
                    onChange={(e) =>
                      updateVariablePrice(index, "price", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
              {variablePrices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariablePrice(index)}
                  className="mt-6 text-red-500 hover:text-red-700 p-2"
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
            + Añadir precio variable o extra
          </button>
        </fieldset>
        {/* Itinerario */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Itinerario Detallado
          </legend>
          {itinerary.map((day, index) => (
            <div
              key={index}
              className="flex gap-4 items-start border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día {index + 1}
                </label>
                <textarea
                  value={day.description}
                  onChange={(e) => updateItineraryDay(index, e.target.value)}
                  placeholder={`Describe las actividades del día ${index + 1}`}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  rows="3"
                />
              </div>
              {itinerary.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="mt-6 text-red-500 hover:text-red-700 p-2"
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

        {/* Sección de Imágenes */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Imágenes
          </legend>
          <div>
            <label
              htmlFor="main_image"
              className="block text-sm font-medium text-gray-700"
            >
              Imagen Principal
            </label>
            <input
              type="file"
              name="main_image"
              id="main_image"
              onChange={(e) => setMainImage(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>
          <div>
            <label
              htmlFor="gallery_images"
              className="block text-sm font-medium text-gray-700"
            >
              Imágenes de Galería (selección múltiple)
            </label>
            <input
              type="file"
              name="gallery_images"
              id="gallery_images"
              multiple
              onChange={(e) => setGalleryImages(Array.from(e.target.files))}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </fieldset>

        {/* Etiquetas */}
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

        {/* Qué Incluye */}
        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            ¿Qué Incluye el Paquete?
          </legend>
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
        </fieldset>

        {/* Qué NO Incluye */}
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Publicar Paquete"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePackagePage;
