interface HealthScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  compact?: boolean;
}

export default function HealthScore({ score, size = "md", showLabel = true, compact = false }: HealthScoreProps) {
  const color = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-error";
  const bg = score >= 80 ? "stroke-success" : score >= 50 ? "stroke-warning" : "stroke-error";
  const dims = size === "sm" ? 40 : size === "lg" ? 72 : 56;
  const stroke = dims * 0.1;
  const r = (dims - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  if (compact) {
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="absolute inset-0 transform -rotate-90" width={48} height={48} viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={`hsl(${score >= 80 ? 150 : score >= 50 ? 35 : 350}, 80%, 50%)`} strokeDasharray={`${score}, 100`} strokeWidth="3" />
        </svg>
        <span className="text-[10px] label-caps">{score}</span>
      </div>
    );
  }

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
