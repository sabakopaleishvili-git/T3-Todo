import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button = ({ className, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-md border border-white/20 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    />
  );
};

export default Button;
