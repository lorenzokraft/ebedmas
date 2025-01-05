/**
 * Utility function to get the full URL for an image path
 * @param imagePath - The relative path to the image
 * @returns The full URL to the image
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';

  // Clean the path by removing any quotes and extra whitespace
  const cleanPath = imagePath.replace(/['"]/g, '').trim();

  // Use the appropriate base URL based on the environment
  const baseUrl = import.meta.env.PROD 
    ? import.meta.env.VITE_UPLOADS_URL_PROD 
    : import.meta.env.VITE_UPLOADS_URL;

  // If the path already starts with http(s), return it as is
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Remove '/uploads' from the path since it's included in the API route
  const pathWithoutUploads = cleanPath.replace(/^\/uploads/, '');

  // Construct the full URL with /api/uploads prefix
  return `${baseUrl}/api/uploads${pathWithoutUploads}`;
};

/**
 * Utility function to get full URLs for an array of image paths
 * @param imagePaths - Array of relative paths to images
 * @returns Array of full URLs to images
 */
export const getImageUrls = (imagePaths: string[] | null | undefined): string[] => {
  if (!imagePaths || !Array.isArray(imagePaths)) return [];
  return imagePaths.map(path => getImageUrl(path));
};
