import React from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon } from "../Shared/icons";
import StarRating from "./starRating";

function TourCard({ tour }) {
  const navigate = useNavigate();

  let imageUrl = "https://placehold.co/600x400/FF7900/FFFFFF?text=VENTU";
  if (tour.images && tour.images.length > 0) {
    const mainImage = tour.images.find((img) => img.is_main_image);
    imageUrl = mainImage ? mainImage.image : tour.images[0].image;
  }

  const rating = 4.8;
  const reviewCount = 25;
  const displayPrice = tour.final_price || tour.base_price || 0;

  const handleCardClick = () => {
    navigate(`/tour/${tour.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out group flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
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
            e.stopPropagation();
            // Aquí iría la lógica para agregar a favoritos
          }}
        >
          <HeartIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {tour.tags && tour.tags.length > 0 && (
          <span className="self-start bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold mb-2">
            {tour.tags[0].name}
          </span>
        )}
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors duration-200">
          {tour.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 flex-grow">
          {tour.description ? `${tour.description.substring(0, 70)}...` : ""}
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
    </div>
  );
}

export default TourCard;
