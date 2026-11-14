import React from 'react';

interface AvatarMonogramProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarMonogram: React.FC<AvatarMonogramProps> = ({
  name,
  color = '#6A55DC',
  size = 'md',
}) => {
  const parts = (name || 'S').trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : (parts[0][0] || 'S').toUpperCase();

  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
        ? 'w-14 h-14 text-lg'
        : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${dimensions} rounded-full flex items-center justify-center font-display font-bold text-white shrink-0 select-none`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};
