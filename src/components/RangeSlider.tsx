import { useState, useCallback, useRef, useEffect } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
}

const DEBOUNCE_MS = 150;

export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (v) => String(v),
}: RangeSliderProps) {
  // Local state for smooth slider movement; debounce propagation to parent
  const [local, setLocal] = useState<[number, number]>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when parent value changes externally (e.g. "Clear filters")
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const propagate = useCallback(
    (next: [number, number]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(next), DEBOUNCE_MS);
    },
    [onChange]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const [low, high] = local;

  // Calculate the position percentages for the highlighted range bar
  const range = max - min || 1;
  const leftPercent = ((low - min) / range) * 100;
  const rightPercent = 100 - ((high - min) / range) * 100;

  const handleLow = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLow = Math.min(parseFloat(e.target.value), high - step);
      const next: [number, number] = [newLow, high];
      setLocal(next);
      propagate(next);
    },
    [high, step, propagate]
  );

  const handleHigh = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHigh = Math.max(parseFloat(e.target.value), low + step);
      const next: [number, number] = [low, newHigh];
      setLocal(next);
      propagate(next);
    },
    [low, step, propagate]
  );

  return (
    <div className="flex items-center gap-3">
      {/* Min label */}
      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem] text-right tabular-nums">
        {formatLabel(low)}
      </span>

      {/* Slider */}
      <div className="range-slider flex-1">
        <div className="range-slider__track" />
        <div
          className="range-slider__range"
          style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLow}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHigh}
        />
      </div>

      {/* Max label */}
      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem] tabular-nums">
        {formatLabel(high)}
      </span>
    </div>
  );
}
