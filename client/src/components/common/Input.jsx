import React from 'react';

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  id,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id || name} className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-xl p-2.5 outline-none transition-all duration-200 text-sm placeholder-zinc-500 ${
          error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-400 font-mono font-medium">{error}</span>}
    </div>
  );
};

export default Input;
