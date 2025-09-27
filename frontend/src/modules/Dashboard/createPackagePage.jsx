import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../Auth/authContext";
import { XIcon } from "../Shared/icons";

function CreatePackagePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(1);
  const [tags, setTags] = useState([]);
  const [availableIncludes, setAvailableIncludes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedIncludes, setSelectedIncludes] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  // --- //
  const [meetingPoint, setMeetingPoint] = useState("Por definir");
  const [meetingTime, setMeetingTime] = useState("12:00:00");
  const [itinerary, setItinerary] = useState([{ day: "", description: "" }]);
  const [variablePrices, setVariablePrices] = useState([
    { type: "", price: "" },
  ]);
  const [whatIsNotIncluded, setWhatIsNotIncluded] = useState([]);

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
        console.error("No se pudieron cargar los datos iniciales", err);
        setError(
          "No se pudieron cargar las opciones. La sesión puede haber expirado."
        );
      }
    };
    fetchInitialData();
  }, []);

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

  const addItineraryDay = () => {
    setItinerary([...itinerary, { day: "", description: "" }]);
  };

  const updateItineraryDay = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  const removeItineraryDay = (index) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  // Función para precios variables
  const addVariablePrice = () => {
    setVariablePrices([...variablePrices, { type: "", price: "" }]);
  };

  const updateVariablePrice = (index, field, value) => {
    const updated = [...variablePrices];
    updated[index][field] = value;
    setVariablePrices(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("destination", destination);
    formData.append("price", price);
    formData.append("duration_days", duration);
    formData.append("meeting_point", "Por definir");
    formData.append("meeting_time", "12:00:00");

    // Itinerario como JSON
    const itineraryObj = {};
    itinerary.forEach((item, index) => {
      if (item.day && item.description) {
        itineraryObj[`Día ${index + 1}`] = item.description;
      }
    });
    formData.append("itinerary", JSON.stringify(itineraryObj));

    // Precios variables como JSON
    const pricesObj = {};
    variablePrices.forEach((item) => {
      if (item.type && item.price) {
        pricesObj[item.type] = parseFloat(item.price);
      }
    });
    formData.append("variable_prices", JSON.stringify(pricesObj));

    // Tags e includes
    selectedTags.forEach((tagId) => formData.append("tag_ids", tagId));
    selectedIncludes.forEach((itemId) =>
      formData.append("included_item_ids", itemId)
    );
    whatIsNotIncluded.forEach((itemId) =>
      formData.append("what_is_not_included", itemId)
    );

    // Imágenes
    if (mainImage) formData.append("main_image", mainImage);
    galleryImages.forEach((image) => formData.append("gallery_images", image));

    try {
      await axiosInstance.post("/tours/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/me");
    } catch (err) {
      console.error("Error al crear el paquete:", err.response?.data);
      setError(
        "Hubo un error al crear el paquete. Revisa que todos los campos estén correctos."
      );
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        Crear Nuevo Paquete Turístico
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-8"
      >
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Información Básica
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title">Título del Paquete</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="location">Ubicación (Región/Estado)</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="destination">
                Destino Específico (Ciudad/Parque)
              </label>
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="price">Precio Base (USD)</label>
              <input
                type="number"
                id="price"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="duration_days">Duración (días)</label>
              <input
                type="number"
                id="duration_days"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description">Descripción Larga</label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            ></textarea>
          </div>
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Lugar y Hora de Encuentro
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="meeting_point"
                className="block text-sm font-medium text-gray-700"
              >
                Lugar de Encuentro
              </label>
              <input
                type="text"
                id="meeting_point"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        </fieldset>

        {/* Nueva sección: Itinerario */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
            Itinerario Detallado
          </legend>
          {itinerary.map((day, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Día {index + 1}
                </label>
                <textarea
                  value={day.description}
                  onChange={(e) =>
                    updateItineraryDay(index, "description", e.target.value)
                  }
                  placeholder={`Descripción del día ${index + 1}`}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows="3"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItineraryDay(index)}
                className="mt-6 text-red-500 hover:text-red-700"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItineraryDay}
            className="text-orange-500 hover:text-orange-700 font-semibold"
          >
            + Añadir día al itinerario
          </button>
        </fieldset>
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
                {/* Nueva sección: Qué NO Incluye */}
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
                  onChange={() => {
                    setWhatIsNotIncluded((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}

        <div className="text-right pt-4">
          <button
            type="submit"
            className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600"
          >
            Publicar Paquete
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePackagePage;
