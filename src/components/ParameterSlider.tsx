import styles from './ParameterSlider.module.css'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  digits?: number
  description?: string
  onChange: (value: number) => void
}

export function ParameterSlider({ label, value, min, max, step, unit, digits = 2, description, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span>{label}</span>
        <span className={styles.value}>
          {value.toFixed(digits)}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className={styles.slider}
        aria-label={label}
        onChange={e => onChange(Number(e.target.value))}
      />
      {description && <div className={styles.hint}>{description}</div>}
    </div>
  )
}
