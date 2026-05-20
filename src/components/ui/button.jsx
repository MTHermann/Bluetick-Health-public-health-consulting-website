import React from 'react'

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
}

export function Button({ children, variant = 'default', asChild = false, ...props }) {
  const buttonClass = `px-4 py-2 rounded font-medium transition-colors ${buttonVariants[variant]}`
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { className: buttonClass, ...props })
  }
  
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  )
}