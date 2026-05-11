"use client";

import { useState } from "react";

export type UserRoleOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

type UserRoleDropdownProps<TValue extends string = string> = {
  className?: string;
  onChange: (value: TValue) => void;
  options: readonly UserRoleOption<TValue>[];
  value: TValue;
};

export default function UserRoleDropdown<TValue extends string = string>({
  className = "",
  onChange,
  options,
  value,
}: UserRoleDropdownProps<TValue>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className={`relative min-w-0 ${className}`}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;

        if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border bg-gray-800 px-4 py-2 text-left text-white shadow-lg shadow-black/10 outline-none transition-all duration-200 ${
          open ? "border-purple-500 ring-2 ring-purple-500/20" : "border-gray-700 hover:border-purple-500/70"
        }`}
        aria-expanded={open}
      >
        <span className="truncate">{selected.label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180 text-purple-400" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`absolute left-0 top-full z-40 mt-2 w-full origin-top overflow-hidden rounded-xl border border-purple-500/40 bg-gray-900 shadow-2xl shadow-black/40 transition-all duration-200 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="p-1.5">
          {options.map((option) => {
            const active = option.value === selected.value;

            return (
              <button
                key={option.value || option.label}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                  active ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {active ? <span className="shrink-0 text-xs">✓</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
