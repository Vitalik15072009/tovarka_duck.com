"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
}: {
  images: { url: string; alt: string | null }[];
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-line">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? "Фото товару"}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Фото відсутнє</div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border ${
                index === active ? "border-ink" : "border-line"
              }`}
              aria-label={`Показати фото ${index + 1}`}
              aria-pressed={index === active}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
