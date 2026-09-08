// widgets.tsx — small reusable UI atoms for the single-page explainer.
// One quiet, light visual language; every atom maps to a real concept.
import { useId, type ReactNode } from 'react'

// ---------- math tokens ------------------------------------------------------
/** Italic serif math variable, with optional real subscript. */
export function M({ children, sub, pre }: { children: ReactNode; sub?: string; pre?: string }) {
  return (
    <span className="m">
      {pre}
      {children}
      {sub && <sub>{sub}</sub>}
    </span>
  )
}

/** Live number — tabular figures so digits don't jitter as values animate. */
export function Lnum({ children }: { children: ReactNode }) {
  return <span className="lnum">{children}</span>
}

// ---------- info tooltip (ⓘ) ---------------------------------------------------
/**
 * ⓘ tip — opens on hover AND keyboard focus, positioned above the anchor and
 * absolutely so it never shifts layout. Use <InfoTip text=…> wrapped around a
 * symbol/label, or standalone via children-less mode with `symbol`.
 */
export function InfoTip({ text, symbol = 'i' }: { text: string; symbol?: string }) {
  const id = useId()
  return (
    <span className="infotip">
      <button
        type="button"
        className="infotip-btn"
        aria-label={`What is ${symbol}?`}
        aria-describedby={id}
        onMouseDown={(e) => e.preventDefault()}
      >
        ⓘ
      </button>
      <span id={id} role="tooltip" className="infotip-pop" aria-hidden={undefined}>
        {text}
      </span>
    </span>
  )
}

/** Slider whose label row embeds an InfoTip on the math symbol. */
export function Slider({
  symbol,
  label,
  tip,
  value,
  min,
  max,
  step,
  onChange,
  format = (v: number) => v.toFixed(2),
  id,
}: {
  symbol: string
  label: string
  tip: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
  id?: string
}) {
  const inputId = id ?? `slider-${symbol}`
  return (
    <div className="ctl-slider">
      <div className="ctl-head">
        <span className="ctl-sym">{symbol}</span>
        <span className="ctl-name">{label}</span>
        <span className="ctl-val"><Lnum>{format(value)}</Lnum></span>
        <InfoTip symbol={symbol} text={tip} />
      </div>
      <input
        id={inputId}
        type="range"
        aria-label={`${symbol} — ${label}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ ['--p' as string]: `${((value - min) / (max - min)) * 100}%` }}
      />
    </div>
  )
}

// ---------- buttons -----------------------------------------------------------
export function Btn({
  children,
  onClick,
  variant = 'ghost',
  disabled,
  title,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'ghost' | 'primary' | 'quiet'
  disabled?: boolean
  title?: string
  className?: string
}) {
  return (
    <button
      type="button"
      className={`btn btn-${variant}${className ? ' ' + className : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

// Re-export icons used across the page so components import from one place.
export { IPlay, IPause, IStep, IReplay } from './icons'
