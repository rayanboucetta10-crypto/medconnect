import React, { useState } from 'react';

export default function StarRating({ rating = 0, size = 16, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);

  const display = interactive ? (hovered || rating) : rating;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="stars" style={{ fontSize: size }}>
      {stars.map((s) => (
        <svg
          key={s}
          width={size} height={size}
          viewBox="0 0 16 16" fill="none"
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform 0.1s' }}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(s)}
        >
          <path
            d="M8 1l1.76 3.56L14 5.27l-3 2.93.71 4.13L8 10.27l-3.71 2.06L5 8.2 2 5.27l4.24-.71L8 1z"
            fill={s <= display ? 'var(--color-accent)' : 'var(--color-border)'}
            stroke={s <= display ? 'var(--color-accent)' : 'var(--color-border)'}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  );
}
