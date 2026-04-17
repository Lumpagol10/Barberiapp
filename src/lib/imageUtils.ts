import { Area } from 'react-easy-crop';

/**
 * Crea un objeto Imagen de HTML a partir de una URL
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Necesario para evitar problemas de CORS con Canvas
    image.src = url;
  });

/**
 * Procesa el recorte de la imagen usando el API de Canvas
 * Retorna un Blob listo para subir a Supabase
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Establecemos el tamaño del canvas al tamaño del recorte
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Dibujamos el área recortada de la imagen original en el canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convertimos el canvas a un Blob (JPG de alta calidad)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}
