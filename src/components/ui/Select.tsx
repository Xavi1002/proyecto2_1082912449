import { SelectHTMLAttributes, forwardRef } from 'react'

type Option = { value: string; label: string }
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: Option[]
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, options, id, className = '', ...rest }, ref
) {
  const selectId = id || rest.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>
      )}
      <select
        {...rest}
        ref={ref}
        id={selectId}
        className={`w-full h-10 px-3 bg-white border ${error ? 'border-danger-500' : 'border-sand-200'} rounded-md text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900 transition ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
    </div>
  )
})
export default Select
