interface HealthScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function HealthScore({ score, size = "md", showLabel = true }: HealthScoreProps) {
  const color = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-error";
  const bg = score >= 80 ? "stroke-success" : score >= 50 ? "stroke-warning" : "stroke-error";
  const dims = size === "sm" ? 40 : size === "lg" ? 72 : 56;
  const stroke = dims * 0.1;
  const r = (dims - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex items-center gap-2">
      <svg width={dims} height={dims} className="transform -rotate-90">
        <circle cx={dims / 2} cy={dims / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/5" />
        <circle cx={dims / 2} cy={dims / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className={`${bg} transition-all`} />
      </svg>
      {showLabel && <span className={`text-sm font-bold ${color}`}>{score}/100</span>}
    </div>
  );
}
