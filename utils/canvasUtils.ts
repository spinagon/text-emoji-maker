/**
 * Processes the raw SVG data URI:
 * 1. Draws it onto a 96x96 canvas
 * 2. Returns PNG data URL
 */
export const processImage = (
  dataUrl: string,
  // removeBackground argument is kept for compatibility but ignored for SVG
  removeBackground: boolean = false 
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const TARGET_SIZE = 96;
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;

      // Clear canvas (transparent background)
      ctx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      // Draw image
      ctx.drawImage(img, 0, 0, TARGET_SIZE, TARGET_SIZE);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
};