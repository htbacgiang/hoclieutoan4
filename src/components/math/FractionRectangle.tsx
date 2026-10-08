'use client';

interface FractionRectangleProps {
  variant?: '1-2' | '2-3' | '3-5' | '2-4' | '1-4';
  className?: string;
}

export default function FractionRectangle({ variant = '1-2', className = '' }: FractionRectangleProps) {
  if (variant === '2-3') {
    // 3 equal vertical strips, 2 shaded blue
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="12" y="12" width="96" height="96" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" rx="4" />
        <rect x="12" y="12" width="64" height="96" fill="#3897FF" stroke="#173B72" strokeWidth="2.5" />
        <line x1="44" y1="12" x2="44" y2="108" stroke="#173B72" strokeWidth="2.5" />
        <line x1="76" y1="12" x2="76" y2="108" stroke="#173B72" strokeWidth="2.5" />
      </svg>
    );
  }

  if (variant === '3-5') {
    // 5 equal vertical strips, 3 shaded blue
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="10" y="12" width="100" height="96" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" rx="4" />
        <rect x="10" y="12" width="60" height="96" fill="#3897FF" stroke="#173B72" strokeWidth="2.5" />
        <line x1="30" y1="12" x2="30" y2="108" stroke="#173B72" strokeWidth="2.5" />
        <line x1="50" y1="12" x2="50" y2="108" stroke="#173B72" strokeWidth="2.5" />
        <line x1="70" y1="12" x2="70" y2="108" stroke="#173B72" strokeWidth="2.5" />
        <line x1="90" y1="12" x2="90" y2="108" stroke="#173B72" strokeWidth="2.5" />
      </svg>
    );
  }

  if (variant === '2-4' || variant === '1-4') {
    const shadedWidth = variant === '2-4' ? 48 : 24;
    return (
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="12" y="12" width="96" height="96" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" rx="4" />
        <rect x="12" y="12" width={shadedWidth} height="96" fill="#3897FF" stroke="#173B72" strokeWidth="2.5" />
        <line x1="36" y1="12" x2="36" y2="108" stroke="#173B72" strokeWidth="2.5" />
        <line x1="60" y1="12" x2="60" y2="108" stroke="#173B72" strokeWidth="2.5" />
        <line x1="84" y1="12" x2="84" y2="108" stroke="#173B72" strokeWidth="2.5" />
      </svg>
    );
  }

  // Variant 1-2 default: 2 vertical strips, right half shaded blue
  return (
    <svg
      viewBox="0 0 120 120"
      className={`w-full h-full max-w-[120px] max-h-[120px] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="16" y="12" width="88" height="96" fill="#FFFFFF" stroke="#173B72" strokeWidth="2.5" rx="4" />
      <rect x="60" y="12" width="44" height="96" fill="#3897FF" stroke="#173B72" strokeWidth="2.5" />
      <line x1="60" y1="12" x2="60" y2="108" stroke="#173B72" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
