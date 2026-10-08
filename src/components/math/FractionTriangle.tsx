'use client';

interface FractionTriangleProps {
  className?: string;
}

export default function FractionTriangle({ className = '' }: FractionTriangleProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Triangle */}
      <polygon points="60,14 106,106 14,106" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Shaded Left Slice */}
      <polygon points="60,14 42,106 14,106" fill="#3897FF" stroke="#173B72" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Inner Dividing Lines */}
      <line x1="60" y1="14" x2="60" y2="106" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="14" x2="42" y2="106" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
