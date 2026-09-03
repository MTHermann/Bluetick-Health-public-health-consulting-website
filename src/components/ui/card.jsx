export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-lg border border-blue-100 bg-[#f4f8ff] shadow-[0_12px_32px_rgba(15,23,42,0.06)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>
}