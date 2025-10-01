import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { XIcon } from "../Shared/icons";

function CreatePackagePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados del formulario - SIN commission_rate
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    destination: "",
    base_price: "",
    duration_days: 1,
    meeting_point: "Por definir",
    meeting_time: "12:00",
  });

  // Estados para relaciones
  const [tags, setTags] = useState([]);
  const [availableIncludes, setAvailableIncludes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedIncludes, setSelectedIncludes] = useState([]);
  const [whatIsNotIncluded, setWhatIsNotIncluded] = useState([]);

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
        {/* Información Básica */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Información Básica
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: "title",
                label: "Título del Paquete",
                type: "text",
                required: true,
              },
              {
                id: "location",
                label: "Ubicación (Región/Estado)",
                type: "text",
                required: true,
              },
              {
                id: "destination",
                label: "Destino Específico",
                type: "text",
                required: true,
              },
              {
                id: "base_price",
                label: "Precio Base (USD)",
                type: "number",
                step: "0.01",
                required: true,
              },
              {
                id: "duration_days",
                label: "Duración (días)",
                type: "number",
                min: "1",
                required: true,
              },
            ].map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.id}
                  value={formData[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            ))}
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

        {/* Itinerario - VERSIÓN MEJORADA */}
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
