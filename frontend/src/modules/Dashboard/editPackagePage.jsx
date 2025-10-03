import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { XIcon } from "../Shared/icons";

function EditPackagePage() {
  const navigate = useNavigate();
  const { packageId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const COMMISSION_RATE = 0.1;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    destination: "",
    base_price: "",
    duration_days: 1,
    meeting_point: "Por definir",
    meeting_time: "12:00",
    is_active: true,
  });

  // Estados para relaciones y datos cargados
  const [tags, setTags] = useState([]);
  const [availableIncludes, setAvailableIncludes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedIncludes, setSelectedIncludes] = useState([]);
  const [whatIsNotIncluded, setWhatIsNotIncluded] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Estados para arrays dinámicos
  const [itinerary, setItinerary] = useState([{ day: 1, description: "" }]);
  const [variablePrices, setVariablePrices] = useState([
    { type: "", price: "" },
  ]);

  // Estados para archivos nuevos
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

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

        // 1. Campos básicos
        setFormData({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          destination: data.destination || "",
          base_price: data.base_price || "",
          duration_days: data.duration_days || 1,
          meeting_point: data.meeting_point || "Por definir",
          meeting_time: data.meeting_time?.substring(0, 5) || "12:00",
          is_active: data.is_active !== undefined ? data.is_active : true,
        });

        // 2. Relaciones - Asegurar que solo se guarden números válidos
        setSelectedTags(
          data.tags
            ?.map((tag) => parseInt(tag.id))
            .filter((id) => !isNaN(id)) || []
        );
        setSelectedIncludes(
          data.what_is_included
            ?.map((item) => parseInt(item.id))
            .filter((id) => !isNaN(id)) || []
        );
        setWhatIsNotIncluded(
          data.what_is_not_included
            ?.map((item) => parseInt(item.id))
            .filter((id) => !isNaN(id)) || []
        );
        setExistingImages(data.images || []);

        // 3. Itinerario
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

        // 4. Precios variables
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

        // 5. Datos disponibles
        setTags(tagsResponse.data);
        setAvailableIncludes(includesResponse.data);
      } catch (err) {
        console.error("Error cargando paquete:", err);
        setError(
          "No se pudo cargar el paquete. Verifica que exista y tengas permisos."
        );
      }
    };

    fetchPackageData();
  }, [packageId]);

  // Funciones de manejo (mantienen igual)
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

  // Itinerario (mantiene igual)
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

  // Precios variables (mantiene igual)
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

  // Eliminar imagen existente (mantiene igual)
  const removeExistingImage = async (imageId) => {
    try {
      await axiosInstance.delete(`/package-images/${imageId}/`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error eliminando imagen:", err);
      setError("Error al eliminar la imagen");
    }
  };

  // CORRECCIÓN PRINCIPAL: Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();

      // Agregar campos básicos
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          // Formatear meeting_time correctamente
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

      // CORRECCIÓN: Solo agregar relaciones que tengan valores válidos
      selectedTags.forEach((tagId) => {
        const id = parseInt(tagId);
        if (!isNaN(id)) {
          submitData.append("tag_ids", id);
        }
      });

      selectedIncludes.forEach((itemId) => {
        const id = parseInt(itemId);
        if (!isNaN(id)) {
          submitData.append("included_item_ids", id);
        }
      });

      whatIsNotIncluded.forEach((itemId) => {
        const id = parseInt(itemId);
        if (!isNaN(id)) {
          submitData.append("what_is_not_included_ids", id);
        }
      });

      // Imágenes nuevas
      if (mainImage) submitData.append("main_image", mainImage);
      galleryImages.forEach((image) =>
        submitData.append("gallery_images", image)
      );

      // Usar PATCH para actualización parcial
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

  // Calcular precio final usando la comisión fija (mantiene igual)
  const finalPrice = formData.base_price
    ? (parseFloat(formData.base_price) / (1 - COMMISSION_RATE)).toFixed(2)
    : 0;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        Editar Paquete Turístico
      </h1>

      {/* Previsualización de precio - Con comisión fija */}
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

          {/* Campo para meeting_point y meeting_time */}
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

          {/* Campo para estado activo/inactivo */}
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

        <fieldset>
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            ¿Qué Incluye el Paquete?
          </legend>
          <div className="space-y-2">
            {includes.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleIncludeChange(index, e.target.value)}
                  placeholder={`Elemento ${index + 1}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeInclude(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addInclude}
            className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-800"
          >
            + Añadir elemento
          </button>
        </fieldset>

        {error && (
          <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}

        <div className="text-right pt-4">
          <button
            type="submit"
            className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-colors shadow-lg transform hover:scale-105"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPackagePage;
