import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button = ({ className, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-md border border-blue-500/40 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    />
  );
};

export default Button;
