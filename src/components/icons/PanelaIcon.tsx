// components/icons/PanelaIcon.tsx - Ícone de panela customizado
import React from 'react';

interface PanelaIconProps {
  className?: string;
  size?: number;
}

export default function PanelaIcon({ className = 'w-5 h-5', size }: PanelaIconProps) {
  const width = size || 20;
  const height = size || 20;
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Corpo da panela - retângulo com cantos arredondados na parte inferior */}
      <path d="M 5 10 L 5 18 Q 5 20 7 20 L 17 20 Q 19 20 19 18 L 19 10 Z" />
      {/* Alça esquerda - formato C */}
      <path d="M 5 13 Q 3 13 3 15 Q 3 17 5 17" />
      {/* Alça direita - formato C */}
      <path d="M 19 13 Q 21 13 21 15 Q 21 17 19 17" />
      {/* Tampa - elipse mais larga que a abertura */}
      <ellipse cx="12" cy="10" rx="10" ry="2.5" />
      {/* Botão da tampa - oval no topo */}
      <ellipse cx="12" cy="7.5" rx="1.8" ry="1.2" />
    </svg>
  );
}

