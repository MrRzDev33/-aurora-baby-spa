import React, { useState } from 'react';
import logoImg from '../../assets/images/aurora_logo_transparent.png';

interface AuroraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AuroraLogo: React.FC<AuroraLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative rounded-xl overflow-hidden shrink-0 bg-white border border-[#4eafde]/30 flex items-center justify-center shadow-xs p-1 ${dimension} ${className}`}
      title="Aurora Mom & Baby Spa"
    >
      {!hasError ? (
        <img
          src={logoImg}
          alt="Aurora Mom & Baby Spa Logo"
          className="w-full h-full object-contain filter drop-shadow-xs"
          loading="eager"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#e8f5fb] text-[#4eafde] rounded-lg font-bold text-xs">
          A
        </div>
      )}
    </div>
  );
};
