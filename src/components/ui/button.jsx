import React from 'react'

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
  outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
}

export function Button({ children, variant = 'default', asChild = false, ...props }) {
  const buttonClass = `button-shift inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium transition-colors ${buttonVariants[variant]}`
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { className: buttonClass, ...props })
  }
  
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  )
}