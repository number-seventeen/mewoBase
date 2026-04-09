import React from 'react';

export const HogwartsIllustration = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="magic-particle w-3 h-3" style={{ top: '15%', left: '30%', animationDelay: '0s' }}></div>
    <div className="magic-particle w-2 h-2" style={{ top: '25%', left: '70%', animationDelay: '1s' }}></div>
    <div className="magic-particle w-4 h-4" style={{ top: '45%', left: '20%', animationDelay: '2s' }}></div>
    <img 
      src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/fort-awesome.svg" 
      alt="Hogwarts Castle"
      className="w-full h-full object-contain drop-shadow-[0_0_15px_hsl(var(--theme-primary)/0.5)] wand-glow"
      style={{ filter: 'invert(0.5) sepia(1) saturate(5) hue-rotate(180deg)' }}
    />
  </div>
);

export const MagicBookIllustration = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="magic-particle w-2 h-2" style={{ top: '20%', left: '30%', animationDelay: '0s' }}></div>
    <div className="magic-particle w-1.5 h-1.5" style={{ top: '40%', left: '75%', animationDelay: '1s' }}></div>
    <div className="magic-particle w-3 h-3" style={{ top: '10%', left: '55%', animationDelay: '2s' }}></div>
    <img 
      src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/book-journal-whills.svg" 
      alt="Magic Spellbook"
      className="w-full h-full object-contain drop-shadow-[0_0_15px_hsl(var(--theme-secondary)/0.5)] wand-glow"
      style={{ filter: 'invert(0.6) sepia(1) saturate(3) hue-rotate(20deg)' }}
    />
  </div>
);

export const CauldronIllustration = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    {/* Potion Bubbles */}
    <div className="potion-bubble w-4 h-4" style={{ top: '25%', left: '45%', animationDelay: '0s' }}></div>
    <div className="potion-bubble w-2 h-2" style={{ top: '35%', left: '60%', animationDelay: '0.8s' }}></div>
    <div className="potion-bubble w-3 h-3" style={{ top: '15%', left: '52%', animationDelay: '1.5s' }}></div>
    
    <img 
      src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/flask.svg" 
      alt="Magic Potion"
      className="w-full h-full object-contain drop-shadow-[0_0_15px_hsl(var(--theme-primary)/0.5)]"
      style={{ filter: 'invert(0.4) sepia(1) saturate(4) hue-rotate(280deg)' }}
    />
    
    {/* Fire under Cauldron */}
    <div className="absolute bottom-[-10px] left-[50%] -translate-x-1/2 w-24 h-12 goblet-fire opacity-80 mix-blend-screen pointer-events-none">
       <svg viewBox="0 0 100 100" fill="none">
         <path d="M50 100 C 20 100 30 50 50 20 C 70 50 80 100 50 100 Z" fill="hsl(var(--theme-secondary))" opacity="0.6"/>
         <path d="M50 100 C 35 100 40 60 50 40 C 60 60 65 100 50 100 Z" fill="hsl(var(--theme-primary))" opacity="0.8"/>
       </svg>
    </div>
  </div>
);

export const OwlIllustration = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-full h-full drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)] relative z-10 flex items-center justify-center">
      <img 
        src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/crow.svg" 
        alt="Magic Owl"
        className="w-[80%] h-[80%] object-contain"
        style={{ filter: 'invert(1)' }}
      />
    </div>
  </div>
);