"use client";

interface ColorSwatchesProps {
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
  isAvailable?: (color: string) => boolean;
  colorMap?: Record<string, string>; // Map color name to hex
  className?: string;
}

const DEFAULT_COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  navy: "#001F3F",
  red: "#FF4136",
  blue: "#0074D9",
  green: "#2ECC40",
  yellow: "#FFDC00",
  orange: "#FF851B",
  purple: "#B10DC9",
  pink: "#F012BE",
  gray: "#AAAAAA",
  grey: "#AAAAAA",
  brown: "#8B4513",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  teal: "#39CCCC",
  coral: "#FF7F50",
  maroon: "#800000",
  olive: "#808000",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

export function ColorSwatches({
  colors,
  selectedColor,
  onSelect,
  isAvailable = () => true,
  colorMap = {},
  className = "",
}: ColorSwatchesProps) {
  const getHexColor = (colorName: string): string => {
    const name = colorName.toLowerCase();
    return colorMap[name] || DEFAULT_COLOR_MAP[name] || "#CCCCCC";
  };

  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {colors.map((color) => {
        const hex = getHexColor(color);
        const isSelected = selectedColor === color;
        const available = isAvailable(color);
        const isLight = isLightColor(hex);

        return (
          <button
            key={color}
            onClick={() => onSelect(color)}
            disabled={!available}
            title={color}
            className={`relative w-10 h-10 rounded-full transition-transform ${
              isSelected ? "ring-2 ring-offset-2 ring-blue-600 scale-110" : ""
            } ${!available ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            style={{ backgroundColor: hex }}
          >
            {/* Border for light colors */}
            {isLight && (
              <span className="absolute inset-0 rounded-full border border-gray-300" />
            )}

            {/* Check mark for selected */}
            {isSelected && (
              <svg
                className={`absolute inset-0 w-full h-full p-2 ${
                  isLight ? "text-gray-800" : "text-white"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {/* Strikethrough for unavailable */}
            {!available && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-full h-0.5 bg-gray-400 rotate-45" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

