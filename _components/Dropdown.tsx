"use client";

import React from "react";

type DropdownOption = {
  label: string;
  value: string;
  image?: string | null;
};

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  className?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

const Dropdown = ({
  value,
  options,
  onChange,
  className,
  disabled = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        className={`w-full rounded-md border border-white/20 bg-white/20 px-3 py-2 text-left text-sm text-white transition outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
      >
        <span className="block truncate pr-8">
          {selectedOption?.label ?? ""}
        </span>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-white/80">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && !disabled ? (
        <div className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-md border border-white/20 bg-[#2b2348] p-1 shadow-xl backdrop-blur">
          <ul role="listbox">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.image ? (
                        <img
                          src={option.image}
                          alt={option.label}
                          className="h-4 w-4 rounded-full"
                        />
                      ) : null}
                      <span className="text-sm">{option.label}</span>
                    </div>
                    {isSelected ? <span className="text-sm">✓</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <input type="hidden" value={value} readOnly />
    </div>
  );
};

export default Dropdown;
