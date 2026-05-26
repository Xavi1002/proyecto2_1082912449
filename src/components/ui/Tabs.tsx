type Tab = { value: string; label: string }
type Props = {
  items: Tab[]
  active: string
  onChange: (value: string) => void
}

export default function Tabs({ items, active, onChange }: Props) {
  return (
    <div className="inline-flex gap-1 p-1 bg-sand-100 rounded-md">
      {items.map((t) => {
        const isActive = active === t.value
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`h-8 px-3 text-sm font-medium rounded-md transition ${
              isActive ? 'bg-white text-ink-900 shadow-paper' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
