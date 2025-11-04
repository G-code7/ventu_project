import React from "react";
import { Link } from "react-router-dom";
import { HeartIcon } from "../Shared/icons";
import StarRating from "./starRating";

function TourCard({ tour, viewMode = 'grid' }) {
  let imageUrl = "https://placehold.co/600x400/FF7900/FFFFFF?text=VENTU";
  if (tour.main_image) {
    imageUrl = tour.main_image.image_url || tour.main_image.image;
  }

  const rating = tour.average_rating || 0;
  const reviewCount = tour.rating_count || 0;
  const displayPrice = tour.final_price || tour.base_price || 0;

  // Construir destino combinado
  const destination = `${tour.state_destination}${tour.specific_destination ? `, ${tour.specific_destination}` : ''}`;

  // Vista de lista
  if (viewMode === 'list') {
    return (
      <Link 
        to={`/tour/${tour.id}`}
        className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out group flex flex-col md:flex-row h-full"
      >
        {/* Imagen */}
        <div className="md:w-48 h-48 flex-shrink-0 relative">
          <img
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={tour.title}
          />
          <button
            className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          {tour.environment && (
            <span className="self-start bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold mb-2">
              {tour.environment.replace('_', ' ')}
            </span>
          )}
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition-colors duration-200">
              {tour.title}
            </h3>
            <p className="text-lg font-bold text-gray-900 ml-4">
              Desde{" "}
              <span className="text-orange-500">
                ${parseFloat(displayPrice).toFixed(0)}
              </span>
            </p>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 flex-grow">
            {destination}
          </p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <StarRating rating={rating} />
            <span className="ml-2 font-bold text-gray-700">{rating}</span>
            <span className="ml-1">({reviewCount} reviews)</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {destination}
            </div>
            
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {tour.duration_days} días
            </div>
            
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {tour.available_slots} cupos
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <div className="flex gap-2">
              {tour.environment && (
                <span
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >
                  {tour.environment.replace('_', ' ')}
                </span>
              )}
            </div>
            
            <span className="bg-orange-500 text-white px-6 py-2 rounded-lg group-hover:bg-orange-600 transition-colors">
              Ver Detalles
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Vista grid (default)
  return (
    <Link 
      to={`/tour/${tour.id}`}
      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out group flex flex-col h-full"
    >
      <div className="relative">
        <img
          className="w-full h-52 object-cover"
          src={imageUrl}
          alt={tour.title}
        />
        <button
          className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <HeartIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {tour.environment && (
          <span className="self-start bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold mb-2">
            {tour.environment.replace('_', ' ')}
          </span>
        )}
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors duration-200">
          {tour.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 flex-grow">
          {destination}
        </p>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <StarRating rating={rating} />
          <span className="ml-2 font-bold text-gray-700">{rating}</span>
          <span className="ml-1">({reviewCount} reviews)</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {tour.duration_days} día(s)
          </span>
          <p className="text-lg font-bold text-gray-900">
            Desde{" "}
            <span className="text-orange-500">
              ${parseFloat(displayPrice).toFixed(0)}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default TourCard;