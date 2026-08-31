import React from 'react';

interface Chess3dPieceProps {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export function Chess3dPieceSvg({ type, color, className = 'w-full h-full' }: Chess3dPieceProps) {
  const isWhite = color === 'w';

  // Realistic 3D Carved Wood Gradients
  const gradId = `${color}_${type}_woodGrad`;
  const shadowGradId = `${color}_${type}_shadowGrad`;
  const highlightGradId = `${color}_${type}_highlightGrad`;

  return (
    <div className={`relative ${className} flex items-center justify-center filter drop-shadow-[0_8px_5px_rgba(0,0,0,0.55)] transition-transform duration-200 select-none pointer-events-none`}>
      <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
        <defs>
          {/* Base Wood Body Gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isWhite ? (
              <>
                <stop offset="0%" stopColor="#fffaed" />
                <stop offset="25%" stopColor="#f5e6cc" />
                <stop offset="60%" stopColor="#dfc299" />
                <stop offset="100%" stopColor="#bfa075" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#5c361e" />
                <stop offset="35%" stopColor="#3d2111" />
                <stop offset="75%" stopColor="#291408" />
                <stop offset="100%" stopColor="#140802" />
              </>
            )}
          </linearGradient>

          {/* 3D Cylindrical Highlight */}
          <linearGradient id={highlightGradId} x1="20%" y1="0%" x2="80%" y2="0%">
            {isWhite ? (
              <>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#9c7b52" stopOpacity="0.4" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#8c5832" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#4a2a16" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
              </>
            )}
          </linearGradient>

          {/* Specular White Shine */}
          <radialGradient id={`${gradId}_shine`} cx="35%" cy="30%" r="45%">
            <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#a36d45'} stopOpacity="0.85" />
            <stop offset="50%" stopColor={isWhite ? '#ffffff' : '#3d2111'} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Pedestal Base Ring (Common to all 3D pieces) */}
        <g>
          {/* Bottom Rim */}
          <ellipse cx="50" cy="106" rx="34" ry="10" fill={isWhite ? '#a68254' : '#140802'} />
          <ellipse cx="50" cy="103" rx="33" ry="9" fill={`url(#${gradId})`} />
          <ellipse cx="50" cy="103" rx="33" ry="9" fill={`url(#${highlightGradId})`} />
          <ellipse cx="50" cy="101" rx="28" ry="7" fill={isWhite ? '#f7edd8' : '#4d2a14'} />

          {/* Stepped Pedestal */}
          <path
            d="M 26 100 Q 50 106 74 100 L 70 88 Q 50 93 30 88 Z"
            fill={`url(#${gradId})`}
          />
          <path
            d="M 26 100 Q 50 106 74 100 L 70 88 Q 50 93 30 88 Z"
            fill={`url(#${highlightGradId})`}
          />
          <ellipse cx="50" cy="88" rx="20" ry="5" fill={isWhite ? '#fffaed' : '#5c361e'} />
        </g>

        {/* 2. Specific 3D Carved Top Piece Anatomy */}
        {type === 'p' && (
          <g>
            {/* Pawn Waist & Stem */}
            <path
              d="M 33 88 Q 42 66 38 48 Q 50 51 62 48 Q 58 66 67 88 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 33 88 Q 42 66 38 48 Q 50 51 62 48 Q 58 66 67 88 Z"
              fill={`url(#${highlightGradId})`}
            />
            {/* Neck Collar */}
            <ellipse cx="50" cy="48" rx="16" ry="4.5" fill={isWhite ? '#dfc299' : '#291408'} />
            <ellipse cx="50" cy="46" rx="15" ry="4" fill={`url(#${gradId})`} />

            {/* Pawn Top Sphere */}
            <circle cx="50" cy="30" r="15" fill={`url(#${gradId})`} />
            <circle cx="50" cy="30" r="15" fill={`url(#${gradId}_shine)`} />
          </g>
        )}

        {type === 'r' && (
          <g>
            {/* Rook Tower Stem */}
            <path
              d="M 32 88 L 35 48 Q 50 51 65 48 L 68 88 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 32 88 L 35 48 Q 50 51 65 48 L 68 88 Z"
              fill={`url(#${highlightGradId})`}
            />
            {/* Tower Corbel / Flaired Top */}
            <path
              d="M 30 48 L 24 30 Q 50 34 76 30 L 70 48 Z"
              fill={`url(#${gradId})`}
            />
            {/* Castle Crenellations (Battlements) */}
            <rect x="25" y="16" width="10" height="15" rx="1.5" fill={`url(#${gradId})`} />
            <rect x="45" y="16" width="10" height="15" rx="1.5" fill={`url(#${gradId})`} />
            <rect x="65" y="16" width="10" height="15" rx="1.5" fill={`url(#${gradId})`} />
            <ellipse cx="50" cy="22" rx="25" ry="6" fill={isWhite ? '#bfa075' : '#140802'} opacity="0.6" />
          </g>
        )}

        {type === 'n' && (
          <g>
            {/* 3D Carved Horse Knight */}
            <path
              d="M 33 88 Q 28 65 24 50 Q 18 42 16 35 Q 26 28 35 34 Q 38 18 54 16 Q 64 24 68 38 Q 72 58 67 88 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 33 88 Q 28 65 24 50 Q 18 42 16 35 Q 26 28 35 34 Q 38 18 54 16 Q 64 24 68 38 Q 72 58 67 88 Z"
              fill={`url(#${highlightGradId})`}
            />
            {/* Mane & Ear */}
            <path
              d="M 48 16 L 55 8 L 60 18 Q 74 38 70 65 L 66 65 Q 68 44 58 28 Z"
              fill={isWhite ? '#dfc299' : '#291408'}
            />
            {/* Eye & Muzzle Detail */}
            <circle cx="32" cy="36" r="2.5" fill={isWhite ? '#291408' : '#dfc299'} />
            <path d="M 20 44 Q 28 42 32 46" stroke={isWhite ? '#a68254' : '#140802'} strokeWidth="1.5" fill="none" />
          </g>
        )}

        {type === 'b' && (
          <g>
            {/* Bishop Stem */}
            <path
              d="M 33 88 Q 44 65 39 52 Q 50 55 61 52 Q 56 65 67 88 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 33 88 Q 44 65 39 52 Q 50 55 61 52 Q 56 65 67 88 Z"
              fill={`url(#${highlightGradId})`}
            />
            {/* Collar */}
            <ellipse cx="50" cy="52" rx="16" ry="4.5" fill={isWhite ? '#dfc299' : '#291408'} />

            {/* Mitre (Bishop Head) */}
            <path
              d="M 32 52 C 30 32 40 18 50 14 C 60 18 70 32 68 52 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 32 52 C 30 32 40 18 50 14 C 60 18 70 32 68 52 Z"
              fill={`url(#${gradId}_shine)`}
            />
            {/* Mitre Slash (Cut) */}
            <path d="M 42 26 L 56 36" stroke={isWhite ? '#7a5336' : '#000000'} strokeWidth="3" strokeLinecap="round" />
            {/* Top Cross / Finial */}
            <circle cx="50" cy="12" r="3.5" fill={isWhite ? '#ffffff' : '#a36d45'} />
          </g>
        )}

        {type === 'q' && (
          <g>
            {/* Queen Gown Stem */}
            <path
              d="M 32 88 Q 45 62 38 48 Q 50 52 62 48 Q 55 62 68 88 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 32 88 Q 45 62 38 48 Q 50 52 62 48 Q 55 62 68 88 Z"
              fill={`url(#${highlightGradId})`}
            />
            {/* Queen Flared Coronet Body */}
            <path
              d="M 28 48 L 22 24 Q 50 28 78 24 L 72 48 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 28 48 L 22 24 Q 50 28 78 24 L 72 48 Z"
              fill={`url(#${gradId}_shine)`}
            />
            {/* Coronet Crown Points & Pearls */}
            <circle cx="24" cy="22" r="3.5" fill={isWhite ? '#ffffff' : '#f59e0b'} />
            <circle cx="37" cy="24" r="3.5" fill={isWhite ? '#ffffff' : '#f59e0b'} />
            <circle cx="50" cy="21" r="4.5" fill={isWhite ? '#ffffff' : '#f59e0b'} />
            <circle cx="63" cy="24" r="3.5" fill={isWhite ? '#ffffff' : '#f59e0b'} />
            <circle cx="76" cy="22" r="3.5" fill={isWhite ? '#ffffff' : '#f59e0b'} />
          </g>
        )}

        {type === 'k' && (
          <g>
            {/* King Robust Stem */}
            <path
              d="M 32 88 Q 46 62 37 46 Q 50 50 63 46 Q 54 62 68 88 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 32 88 Q 46 62 37 46 Q 50 50 63 46 Q 54 62 68 88 Z"
              fill={`url(#${highlightGradId})`}
            />
            {/* Royal Crown Head */}
            <path
              d="M 28 46 L 24 24 Q 50 29 76 24 L 72 46 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M 28 46 L 24 24 Q 50 29 76 24 L 72 46 Z"
              fill={`url(#${gradId}_shine)`}
            />
            {/* Cross on King Top */}
            <g transform="translate(50, 14)">
              <rect x="-3" y="-10" width="6" height="16" rx="1.5" fill={isWhite ? '#ffffff' : '#d97706'} />
              <rect x="-8" y="-7" width="16" height="6" rx="1.5" fill={isWhite ? '#ffffff' : '#d97706'} />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
