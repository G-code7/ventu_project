import React from 'react';
import { StarIcon } from '../Shared/icons';

function StarRating({ rating }) {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const emptyStars = totalStars - fullStars;
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} fill="text-yellow-400" />)}
        {[...Array(emptyStars)].map((_, i) => <StarIcon key={`empty-${i}`} fill="text-gray-300" />)}
      </div>
    );
}

export default StarRating;