import React, { useState, useEffect } from "react";

const ImageGalleryModal = ({ images, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset al índice inicial cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Manejar navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images?.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay con backdrop blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Contenido del modal */}
      <div className="relative z-10 w-full max-w-7xl mx-4 max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-95 opacity-0 animate-modal-in">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Galería de imágenes ({currentIndex + 1} de {images.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Imagen principal */}
        <div className="relative flex-1 flex items-center justify-center p-4">
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center justify-center max-h-[70vh]">
            <img
              src={currentImage.image}
              alt={`Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
          </div>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Miniaturas */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id || `thumb-${index}`}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? "border-orange-500 scale-105"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={image.image}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estilos para la animación */}
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-in {
          animation: modalIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ImageGalleryModal;
