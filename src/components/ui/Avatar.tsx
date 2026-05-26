type Size = 'sm' | 'md' | 'lg'
const sizes: Record<Size, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '·'
}

export default function Avatar({ name, size = 'md' }: { name: string; size?: Size }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-ink-900 text-white font-medium ${sizes[size]}`}
      aria-label={name}
    >
      {initialsOf(name)}
    </span>
  )
}
