import React from 'react';
import Lottie from 'lottie-react';
import robotAnimation from '../../public/lottie-robot.json';

export function Hologram({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: { width: 120, height: 120, mb: 'mb-2' },
    md: { width: 200, height: 200, mb: 'mb-4' },
    lg: { width: 300, height: 300, mb: 'mb-6' }
  };
  
  const { width, height, mb } = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${mb}`} style={{ filter: 'drop-shadow(0 0 15px hsl(var(--theme-primary) / 0.6))' }}>
      <Lottie 
        animationData={robotAnimation} 
        loop={true} 
        style={{ width, height }} 
      />
    </div>
  );
}
