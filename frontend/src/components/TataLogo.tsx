import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const TataLogo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 48, 
  showText = true 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {showText ? (
        <img 
          src="/tata_logo.png" 
          alt="Tata Logo" 
          style={{ height: size, width: 'auto' }}
          className="transition-transform duration-300 hover:scale-105 object-contain"
        />
      ) : (
        <img 
          src="/tata_emblem.png" 
          alt="Tata Emblem" 
          style={{ height: size, width: 'auto' }}
          className="transition-transform duration-300 hover:scale-105 object-contain"
        />
      )}
    </div>
  );
};

export const TataEmblem: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 32 
}) => {
  return (
    <TataLogo className={className} size={size} showText={false} />
  );
};

