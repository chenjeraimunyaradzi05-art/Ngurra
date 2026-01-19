import Image, { ImageProps } from 'next/image';
import { cloudinaryLoader, isCloudinaryUrl } from '@/lib/cloudinary';

export type OptimizedImageProps = ImageProps & {
  /**
   * Force Cloudinary loader even when the src isn't a full Cloudinary URL.
   * Use this when passing a Cloudinary public ID as `src`.
   */
  cloudinary?: boolean;
};

export default function OptimizedImage({ cloudinary, loader, src, ...rest }: OptimizedImageProps) {
  if (loader) {
    return <Image loader={loader} src={src} {...rest} />;
  }

  const shouldUseCloudinary =
    cloudinary || (typeof src === 'string' && isCloudinaryUrl(src));

  if (shouldUseCloudinary && typeof src === 'string') {
    return <Image loader={cloudinaryLoader} src={src} {...rest} />;
  }

  return <Image src={src} {...rest} />;
}
