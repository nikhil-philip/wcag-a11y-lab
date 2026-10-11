import type { RiskLevel } from '../data/wcag-schema'

export interface RiskStyle {
  /** Tinted, low-emphasis surface (badges, unselected pills). */
  soft: string
  softHover: string
  /** Filled, high-emphasis surface (selected pills). */
  solid: string
  solidHover: string
  /** Small colour swatch shown next to the label. */
  dot: string
}

/**
 * Shared risk palette. Every text/background pair meets 4.5:1 contrast.
 * Class strings are written out in full so Tailwind can detect them.
 */
export const RISK_STYLES: Record<RiskLevel, RiskStyle> = {
  Critical: {
    soft: 'border-red-300 bg-red-50 text-red-800',
    softHover: 'hover:bg-red-100',
    solid: 'border-red-700 bg-red-700 text-white',
    solidHover: 'hover:bg-red-800',
    dot: 'bg-red-600',
  },
  High: {
    soft: 'border-orange-300 bg-orange-50 text-orange-800',
    softHover: 'hover:bg-orange-100',
    solid: 'border-orange-700 bg-orange-700 text-white',
    solidHover: 'hover:bg-orange-800',
    dot: 'bg-orange-500',
  },
  Medium: {
    soft: 'border-amber-300 bg-amber-50 text-amber-900',
    softHover: 'hover:bg-amber-100',
    solid: 'border-amber-500 bg-amber-400 text-amber-950',
    solidHover: 'hover:bg-amber-300',
    dot: 'bg-amber-400',
  },
  Low: {
    soft: 'border-slate-300 bg-slate-50 text-slate-700',
    softHover: 'hover:bg-slate-100',
    solid: 'border-slate-700 bg-slate-700 text-white',
    solidHover: 'hover:bg-slate-800',
    dot: 'bg-slate-500',
  },
}
