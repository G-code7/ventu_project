import { useMemo } from 'react';

export const useTourImages = (tour) => {
  return useMemo(() => {
    if (!tour?.images || !Array.isArray(tour.images)) {
      return { mainImage: null, galleryImages: [], allImages: [] };
    }

    const validImages = tour.images.filter(
      (img) => img && typeof img === 'object' && img.image
    );

    const mainImage = validImages.find((img) => img.is_main_image) || validImages[0];
    const galleryImages = validImages.filter((img) => img !== mainImage);
    const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages;

    return { mainImage, galleryImages, allImages };
  }, [tour?.images]);
};