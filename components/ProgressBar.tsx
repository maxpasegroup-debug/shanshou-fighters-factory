type ProgressBarProps = {
  value: number;
  label?: string;
};

export default function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      {label ? <p className="text-xs text-zinc-300">{label}</p> : null}
      <div className="h-2 w-full rounded-full bg-zinc-800">
        <div
          className="warrior-gradient h-2 rounded-full transition-all"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
