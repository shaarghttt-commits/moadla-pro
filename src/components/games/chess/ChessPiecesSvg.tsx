import React from 'react';

export function ChessPieceSvg({
  type,
  color,
  className = 'w-full h-full',
}: {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}) {
  const isWhite = color === 'w';

  // Crisp, world-standard Staunton vector SVGs
  switch (type) {
    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            fillRule="evenodd"
            stroke={isWhite ? '#0f172a' : '#ffffff'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={isWhite ? '#ffffff' : '#1e293b'} />
            <path d="M11.5 37c5.5 3.5 16.5 3.5 22 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-17 4V23.5c-3.5-7.5-13-10.5-17-4-3 6 6 10.5 6 10.5v7z" />
            <path d="M11.5 30c5.5-3 16.5-3 22 0M11.5 33.5c5.5-3 16.5-3 22 0M11.5 37c5.5-3 16.5-3 22 0" />
            <circle cx="22.5" cy="8" r="1.5" fill={isWhite ? '#f59e0b' : '#f59e0b'} stroke="none" />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            fillRule="evenodd"
            stroke={isWhite ? '#0f172a' : '#ffffff'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm17 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14L7 14l2 12z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 21 1 27 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" />
            <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" />
          </g>
        </svg>
      );

    case 'r': // Rook (Castle)
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            fillRule="evenodd"
            stroke={isWhite ? '#0f172a' : '#ffffff'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm2.5-4l1.5-12h13l1.5 12h-16zm-1.5-14l-1.5-4h23l-1.5 4h-20zM9 18h27V9h-4v4h-5V9h-4v4h-5V9h-5v9H9z" />
            <path d="M14 29.5v-13h17v13H14z" strokeLinejoin="miter" />
            <path d="M14 16.5h17M14 29.5h17" fill="none" strokeWidth="1" />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            fillRule="evenodd"
            stroke={isWhite ? '#0f172a' : '#ffffff'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g>
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" strokeLinejoin="miter" />
          </g>
        </svg>
      );

    case 'n': // Knight (Horse)
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            fillRule="evenodd"
            stroke={isWhite ? '#0f172a' : '#ffffff'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.065 1.74-2 2-1 0-2-.5-2-2 0-4 4.01-4 4-9 0-4.5 4-8.5 9-10.5 1.5 1 3.5 1.5 5 1 1.5-.5 3-1.5 3-1.5s-.5 1.5-.5 3c0 1.5 1.5 2.5 2 3.5.5 1 1 2.5 1 3.5z" />
            <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-8.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill={isWhite ? '#0f172a' : '#ffffff'} stroke="none" />
            <path d="M24.55 10.4s-.45 1.45-.45 2.85c0 1.4 1.4 2.35 1.9 3.3.5.95.9 2.35.9 3.3" fill="none" strokeWidth="1" />
            <path d="M9.5 36c3.5-1 10.5-1 14 0M9.5 39c3.5-1 10.5-1 14 0" fill="none" />
          </g>
        </svg>
      );

    case 'p': // Pawn
    default:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={isWhite ? '#ffffff' : '#1e293b'}
            fillRule="evenodd"
            stroke={isWhite ? '#0f172a' : '#ffffff'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.93 3.84 2.38 5.03-3.15 1.34-5.38 4.46-5.38 8.1v4.87h19V34.9c0-3.64-2.23-6.76-5.38-8.1 1.45-1.19 2.38-3 2.38-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
            <path d="M12.5 38.5c5.5-1.5 14.5-1.5 20 0M11 39.5h23" fill="none" />
          </g>
        </svg>
      );
  }
}
