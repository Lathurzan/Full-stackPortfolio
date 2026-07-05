'use client';

import React, { useState } from 'react';

export default function RemoteImage({ src, alt, className, fallback = '/images/blog-placeholder.png' }: { src?: string; alt?: string; className?: string; fallback?: string }) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [errored, setErrored] = useState(false);

  if (!imgSrc) return <img src={fallback} alt={alt || ''} className={className} />;

  return (
    // eslint-disable-next-line jsx-a11y/img-redundant-alt
    <img
      src={imgSrc}
      alt={alt || ''}
      className={className}
      onError={() => {
        if (!errored) {
          setErrored(true);
          setImgSrc(fallback);
        }
      }}
    />
  );
}
