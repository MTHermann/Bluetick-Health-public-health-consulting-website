export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`premium-surface rounded-lg border border-slate-200/85 bg-[#fffdf8]/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>
}