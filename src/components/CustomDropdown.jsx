import React, { useState, useRef, useEffect } from "react";
import { BiChevronDown, BiCheck } from "react-icons/bi";

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  icon: Icon,
  placeholder = "Select...",
  isActive = false,
  className = "",
  align = "left",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div
      className={`relative inline-block text-left ${isOpen ? "z-50" : "z-20"} ${className}`}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer backdrop-blur-md border outline-none select-none active:scale-95 ${
          isActive
            ? "bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_15px_rgba(255,42,133,0.25)]"
            : "bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border-white/10 hover:border-white/20"
        } ${isOpen ? "ring-2 ring-pink-500/40 border-pink-500/50" : ""}`}
      >
        {Icon && <Icon className="text-sm shrink-0 opacity-80" />}
        <span className="truncate max-w-[140px] sm:max-w-[180px]">{displayLabel}</span>
        <BiChevronDown
          className={`text-base shrink-0 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-pink-400" : ""
          }`}
        />
      </button>

      {/* Floating Curved / Rounded Solid Dark Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-[999] mt-2 min-w-[190px] sm:min-w-[210px] max-w-[280px] rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(255,42,133,0.2)] p-2 focus:outline-none animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: "#11121d",
            opacity: 1,
            ...(align === "right" ? { right: 0 } : { left: 0 }),
          }}
        >
          <div
            className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
            style={{ backgroundColor: "#11121d" }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? "bg-pink-500/25 text-pink-300 border border-pink-500/40 font-bold shadow-sm"
                      : "text-zinc-200 hover:text-white hover:bg-white/10"
                  }`}
                  style={isSelected ? { backgroundColor: "rgba(255, 42, 133, 0.2)" } : {}}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <BiCheck className="text-base text-pink-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
