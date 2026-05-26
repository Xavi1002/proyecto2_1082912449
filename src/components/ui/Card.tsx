import { HTMLAttributes, ReactNode } from 'react'

type Padding = 'sm' | 'md' | 'lg'
type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: Padding
  children: ReactNode
}

const paddings: Record<Padding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({ padding = 'md', children, className = '', ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`bg-white border border-sand-200 rounded-xl shadow-paper ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
