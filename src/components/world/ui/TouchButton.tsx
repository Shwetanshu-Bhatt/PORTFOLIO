interface TouchButtonProps {
  label: string;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  className?: string;
}

export function TouchButton({ label, onTouchStart, onTouchEnd, className }: TouchButtonProps) {
  return (
    <div
      className={`world-touch-button${className ? ` ${className}` : ''}`}
      onTouchStart={(event) => { event.preventDefault(); onTouchStart(); }}
      onTouchEnd={(event) => { event.preventDefault(); onTouchEnd(); }}
      onTouchCancel={onTouchEnd}
    >
      {label}
    </div>
  );
}
