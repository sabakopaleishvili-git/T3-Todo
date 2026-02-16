import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-white/20 bg-white/20 px-3 py-2 text-sm text-white transition outline-none placeholder:text-white/60 focus:border-white/50 focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    />
  );
};

export default Input;
