'use client';

interface FractionCircleProps {
  variant?: '1-2' | '1-4' | '3-4' | '2-4' | '1-3' | '2-3';
  className?: string;
}

export default function FractionCircle({ variant = '1-2', className = '' }: FractionCircleProps) {
  if (variant === '1-4') {
    // Circle split into 4 equal quadrants, 1 quadrant shaded blue
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="52" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" />
        <path
          d="M60 60 L60 8 A52 52 0 0 0 8 60 Z"
          fill="#3897FF"
          stroke="#173B72"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line x1="60" y1="8" x2="60" y2="112" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="60" x2="112" y2="60" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === '3-4') {
    // Circle split into 4 equal quadrants, 3 quadrants shaded blue
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="52" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" />
        <path
          d="M60 60 L60 8 A52 52 0 1 0 112 60 Z"
          fill="#3897FF"
          stroke="#173B72"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line x1="60" y1="8" x2="60" y2="112" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="60" x2="112" y2="60" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === '2-4') {
    // Circle split into 4 equal quadrants, 2 quadrants shaded blue (top-left & top-right)
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="52" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" />
        <path
          d="M60 60 L8 60 A52 52 0 0 1 112 60 Z"
          fill="#3897FF"
          stroke="#173B72"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line x1="60" y1="8" x2="60" y2="112" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="60" x2="112" y2="60" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === '1-3') {
    // Circle split into 3 equal slices, 1 slice shaded blue
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="52" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" />
        <path
          d="M60 60 L60 8 A52 52 0 0 0 15 86 Z"
          fill="#3897FF"
          stroke="#173B72"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line x1="60" y1="60" x2="60" y2="8" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="60" x2="15" y2="86" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="60" x2="105" y2="86" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === '2-3') {
    // Circle split into 3 equal slices, 2 slices shaded blue
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="52" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" />
        <path
          d="M60 60 L15 86 A52 52 0 1 1 105 86 Z"
          fill="#3897FF"
          stroke="#173B72"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line x1="60" y1="60" x2="60" y2="8" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="60" x2="15" y2="86" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="60" x2="105" y2="86" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Variant 1-2 default: Circle split in half vertically, left half shaded blue
  return (
    <svg
      viewBox="0 0 120 120"
      className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="52" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" />
      <path
        d="M60 8 A52 52 0 0 0 60 112 Z"
        fill="#3897FF"
        stroke="#173B72"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="60" y1="8" x2="60" y2="112" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
