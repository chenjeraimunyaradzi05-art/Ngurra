import React from 'react';

type BrandLogoProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  alt?: string;
};

export default function BrandLogo({
  alt = 'Tinashe logo',
  width = 96,
  height = 96,
  loading = 'eager',
  decoding = 'async',
  ...props
}: BrandLogoProps) {
  return (
    <img
      src="/tinashe-logo.png"
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
}
