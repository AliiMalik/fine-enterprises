import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, hint, error, children, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-teal-400 dark:focus:ring-teal-400'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} ${className}`} {...props} />
}
