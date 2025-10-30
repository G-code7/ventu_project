import React from 'react';

const TourGallery = ({ mainImage, galleryImages, onImageClick }) => {
  if (!mainImage && (!galleryImages || galleryImages.length === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
          <span className="text-gray-500">No hay imágenes disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {mainImage && (
          <div className="lg:col-span-2 relative group">
            <img
              src={mainImage.image}
              alt="Imagen principal"
              className="w-full h-80 lg:h-96 object-cover rounded-xl shadow-md cursor-pointer group-hover:shadow-lg transition-all duration-300"
              onClick={() => onImageClick(0)}
            />
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300 cursor-pointer"
              onClick={() => onImageClick(0)}
            />
          </div>
        )}
        
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {galleryImages.slice(0, 4).map((image, index) => (
              <div key={image.id || `gallery-${index}`} className="relative group">
                <img
                  src={image.image}
                  alt={`Galería ${index + 1}`}
                  className="w-full h-36 lg:h-40 object-cover rounded-xl shadow-md cursor-pointer group-hover:shadow-lg transition-all duration-300"
                  onClick={() => onImageClick(index + (mainImage ? 1 : 0))}
                />
                <div
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300 cursor-pointer"
                  onClick={() => onImageClick(index + (mainImage ? 1 : 0))}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {galleryImages.length > 4 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => onImageClick(0)}
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Ver todas las fotos</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TourGallery;