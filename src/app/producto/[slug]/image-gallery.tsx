"use client";

import { useState } from "react";

type Props = {
  images: string[];
  name: string;
};

export function ImageGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] w-full bg-muted flex items-center justify-center">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          Sin imagen
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
        <img
          src={images[selected]}
          alt={`${name} ${selected + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`aspect-[3/4] w-20 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                i === selected ? "border-ink" : "border-transparent"
              }`}
            >
              <img
                src={src}
                alt={`${name} miniatura ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
