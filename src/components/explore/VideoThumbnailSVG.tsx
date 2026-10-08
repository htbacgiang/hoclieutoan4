'use client';

interface VideoThumbnailSVGProps {
  title?: string;
  num?: string;
  den?: string;
  formula?: string;
}

export default function VideoThumbnailSVG({
  title = 'Phân số là gì?',
  num = '3',
  den = '4',
  formula,
}: VideoThumbnailSVGProps) {
  return (
    <svg
      viewBox="0 0 800 450"
      className="w-full h-full object-cover select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sky Gradient */}
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9ECFF" />
          <stop offset="60%" stopColor="#EBF7FF" />
          <stop offset="100%" stopColor="#F5FAFF" />
        </linearGradient>

        {/* Hill Gradient 1 */}
        <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9DE270" />
          <stop offset="100%" stopColor="#76C444" />
        </linearGradient>

        {/* Hill Gradient 2 */}
        <linearGradient id="hillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#BAF08C" />
          <stop offset="100%" stopColor="#96DC54" />
        </linearGradient>

        {/* Pie Segment Orange */}
        <linearGradient id="pieOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A45" />
          <stop offset="100%" stopColor="#FA541C" />
        </linearGradient>

        {/* Pie Segment Blue */}
        <linearGradient id="pieBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#40A9FF" />
          <stop offset="100%" stopColor="#096DD9" />
        </linearGradient>
      </defs>

      {/* Background Sky */}
      <rect width="800" height="450" fill="url(#skyGrad)" />

      {/* Sun / Rays */}
      <circle cx="700" cy="80" r="120" fill="#FFFBE6" opacity="0.6" />
      <circle cx="700" cy="80" r="70" fill="#FFE58F" opacity="0.4" />

      {/* Sparkles / Stars in Sky */}
      <path d="M 120 60 L 123 68 L 131 71 L 123 74 L 120 82 L 117 74 L 109 71 L 117 68 Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M 620 40 L 622 46 L 628 48 L 622 50 L 620 56 L 618 50 L 612 48 L 618 46 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M 380 70 L 381 74 L 385 75 L 381 76 L 380 80 L 379 76 L 375 75 L 379 74 Z" fill="#40A9FF" opacity="0.7" />

      {/* Clouds */}
      <path d="M 50 110 Q 70 80 100 90 Q 130 70 160 90 Q 180 80 200 100 Q 210 120 180 130 L 60 130 Z" fill="#FFFFFF" opacity="0.85" />
      <path d="M 580 100 Q 600 75 630 85 Q 660 65 690 85 Q 710 75 730 95 L 560 105 Z" fill="#FFFFFF" opacity="0.75" />

      {/* Rolling Hills Background */}
      <path d="M -50 350 Q 150 280 400 340 Q 650 400 850 320 L 850 450 L -50 450 Z" fill="url(#hillGrad1)" />
      <path d="M -50 380 Q 250 320 550 370 Q 720 330 850 360 L 850 450 L -50 450 Z" fill="url(#hillGrad2)" />

      {/* Trees in Background */}
      <ellipse cx="680" cy="330" rx="22" ry="35" fill="#52C41A" />
      <rect x="677" y="360" width="6" height="20" fill="#8C6B3A" />
      <ellipse cx="720" cy="340" rx="18" ry="28" fill="#389E0D" />
      <rect x="718" y="362" width="4" height="18" fill="#8C6B3A" />

      {/* --- TITLE TEXT ON THUMBNAIL --- */}
      <g transform="translate(420, 105)">
        <text
          x="0"
          y="0"
          fontFamily="'Be Vietnam Pro', 'Baloo 2', sans-serif"
          fontWeight="900"
          fontSize="40"
          fill="#0D4285"
          letterSpacing="-0.5"
        >
          {title}
        </text>
        {formula && (
          <text
            x="0"
            y="42"
            fontFamily="'Be Vietnam Pro', sans-serif"
            fontWeight="800"
            fontSize="26"
            fill="#1677D2"
          >
            {formula}
          </text>
        )}
      </g>

      {/* --- FRACTION PIE CHART (VISUAL AID) --- */}
      <g transform="translate(480, 250)">
        {/* Shadow under circle */}
        <ellipse cx="0" cy="75" rx="75" ry="12" fill="#000000" opacity="0.12" />

        {/* Outer White Ring */}
        <circle cx="0" cy="0" r="70" fill="#FFFFFF" stroke="#0D4285" strokeWidth="4" />

        {/* Quadrant 1 (Top Right): Orange */}
        <path d="M 0 0 L 0 -68 A 68 68 0 0 1 68 0 Z" fill="url(#pieOrange)" />

        {/* Quadrant 2 (Bottom Right): Light Blue / Cyan */}
        <path d="M 0 0 L 68 0 A 68 68 0 0 1 0 68 Z" fill="#BAE7FF" />

        {/* Quadrant 3 (Bottom Left): Sky Blue */}
        <path d="M 0 0 L 0 68 A 68 68 0 0 1 -68 0 Z" fill="url(#pieBlue)" opacity="0.9" />

        {/* Quadrant 4 (Top Left): Orange */}
        <path d="M 0 0 L -68 0 A 68 68 0 0 1 0 -68 Z" fill="url(#pieOrange)" />

        {/* Cross Dividing Lines */}
        <line x1="0" y1="-70" x2="0" y2="70" stroke="#0D4285" strokeWidth="3" />
        <line x1="-70" y1="0" x2="70" y2="0" stroke="#0D4285" strokeWidth="3" />
      </g>

      {/* --- FRACTION NUMBERS --- */}
      <g transform="translate(620, 245)">
        {/* Blue Dot Indicator */}
        <circle cx="-25" cy="0" r="6" fill="#1890FF" />

        {/* Numerator */}
        <text
          x="30"
          y="-18"
          textAnchor="middle"
          fontFamily="'Be Vietnam Pro', sans-serif"
          fontWeight="900"
          fontSize={num.length > 2 ? '36' : '52'}
          fill="#0D4285"
        >
          {num}
        </text>

        {/* Fraction Bar */}
        <line x1="0" y1="-5" x2="60" y2="-5" stroke="#0D4285" strokeWidth="6" strokeLinecap="round" />

        {/* Denominator */}
        <text
          x="30"
          y="46"
          textAnchor="middle"
          fontFamily="'Be Vietnam Pro', sans-serif"
          fontWeight="900"
          fontSize={den.length > 2 ? '36' : '52'}
          fill="#0D4285"
        >
          {den}
        </text>
      </g>

      {/* --- CHARACTER: CUTE PRIMARY SCHOOL GIRL --- */}
      <g transform="translate(140, 160)">
        {/* Shadow beneath character */}
        <ellipse cx="120" cy="245" rx="70" ry="14" fill="#000000" opacity="0.15" />

        {/* Left Arm (pointing to the right diagram) */}
        <path d="M 170 170 Q 210 150 230 135" stroke="#FFB09C" strokeWidth="22" strokeLinecap="round" />
        {/* Pointing Hand */}
        <circle cx="232" cy="133" r="12" fill="#FFB09C" />

        {/* Body / Pink Shirt */}
        <path
          d="M 65 170 C 65 150 175 150 175 170 L 185 240 L 55 240 Z"
          fill="#FF6584"
        />
        {/* Shirt Collar / Details */}
        <path d="M 100 160 Q 120 180 140 160" fill="none" stroke="#FFFFFF" strokeWidth="5" />

        {/* Neck */}
        <rect x="110" y="140" width="20" height="25" fill="#FFB09C" rx="5" />

        {/* Head */}
        <ellipse cx="120" cy="100" rx="55" ry="50" fill="#FFC0B0" />

        {/* Ears */}
        <circle cx="65" cy="105" r="12" fill="#FFC0B0" />
        <circle cx="175" cy="105" r="12" fill="#FFC0B0" />

        {/* Hair - Back/Pigtails */}
        <ellipse cx="50" cy="120" rx="22" ry="30" fill="#3D2314" />
        <ellipse cx="190" cy="120" rx="22" ry="30" fill="#3D2314" />

        {/* Pink Bows in Hair */}
        <path d="M 52 90 L 38 80 L 42 98 Z" fill="#FF3366" />
        <path d="M 52 90 L 66 80 L 62 98 Z" fill="#FF3366" />
        <circle cx="52" cy="90" r="5" fill="#FFCC00" />

        <path d="M 188 90 L 174 80 L 178 98 Z" fill="#FF3366" />
        <path d="M 188 90 L 202 80 L 198 98 Z" fill="#FF3366" />
        <circle cx="188" cy="90" r="5" fill="#FFCC00" />

        {/* Hair - Bangs & Front */}
        <path
          d="M 65 85 C 65 45 175 45 175 85 C 160 70 140 68 120 75 C 100 68 80 70 65 85 Z"
          fill="#3D2314"
        />

        {/* Eyes */}
        <ellipse cx="98" cy="98" rx="8" ry="11" fill="#2B1704" />
        <circle cx="96" cy="94" r="3" fill="#FFFFFF" />

        <ellipse cx="142" cy="98" rx="8" ry="11" fill="#2B1704" />
        <circle cx="140" cy="94" r="3" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M 90 82 Q 98 78 106 82" stroke="#3D2314" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 134 82 Q 142 78 150 82" stroke="#3D2314" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="88" cy="112" rx="10" ry="6" fill="#FF6680" opacity="0.4" />
        <ellipse cx="152" cy="112" rx="10" ry="6" fill="#FF6680" opacity="0.4" />

        {/* Happy Smile */}
        <path d="M 108 114 Q 120 130 132 114" fill="#E60039" stroke="#3D2314" strokeWidth="2.5" />
        <path d="M 112 120 Q 120 128 128 120" fill="#FF8099" />
      </g>
    </svg>
  );
}
