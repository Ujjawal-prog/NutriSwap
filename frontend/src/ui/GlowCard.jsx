import { useRef } from 'react'

// Card with a cursor-following border glow + soft spotlight (styles: .glow in index.css)
export default function GlowCard({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null)
  const move = e => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return <Tag ref={ref} className={`glow ${className}`} onPointerMove={move} {...rest}>{children}</Tag>
}
