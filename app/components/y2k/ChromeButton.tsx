'use client';

import React from 'react';
import { retroAudio } from '../../utils/retroAudio';

type Variant = 'pink' | 'silver' | 'accent';

interface BaseProps {
  variant?: Variant;
  /** Overrides the button colour (used by the media player skin). */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const SIZES = {
  sm: 'px-3 py-1 text-base',
  md: 'px-5 py-1.5 text-xl',
  lg: 'px-7 py-2.5 text-2xl',
};

/** Glossy Aqua/XP-era pill button. Renders an <a> when given href. */
export function ChromeButton(props: ButtonProps | AnchorProps) {
  const { variant = 'pink', color, size = 'md', className = '', children, ...rest } = props;
  const cls = `y2k-gloss ${variant === 'silver' ? 'y2k-gloss-silver' : ''} inline-flex items-center justify-center gap-2 rounded-full font-pixel leading-none uppercase tracking-wide cursor-pointer select-none ${SIZES[size]} ${className}`;
  const style = {
    ...(variant === 'pink' ? { '--btn': '#ff2e93' } : {}),
    ...(color ? { '--btn': color } : {}),
  } as React.CSSProperties;

  if ('href' in rest && rest.href !== undefined) {
    const { onClick, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        {...anchorRest}
        className={cls}
        style={style}
        onClick={(e) => {
          retroAudio.playHover();
          onClick?.(e);
        }}
      >
        {children}
      </a>
    );
  }

  const { onClick, type = 'button', ...buttonRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...buttonRest}
      type={type}
      className={cls}
      style={style}
      onClick={(e) => {
        retroAudio.playButtonClack();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
