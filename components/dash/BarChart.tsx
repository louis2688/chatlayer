export default function BarChart({ data }: { data: { day: string; n: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  const W = 640, H = 160, pad = 24, bw = (W - pad * 2) / data.length;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full min-w-[520px]" role="img" aria-label="Messages per day">
        {data.map((d, i) => {
          const h = (d.n / max) * (H - pad * 2);
          return (
            <g key={d.day}>
              <rect x={pad + i * bw + 3} y={H - pad - h} width={bw - 6} height={h} rx="2" className="fill-emerald-500" />
              {i % 2 === 0 && (
                <text x={pad + i * bw + bw / 2} y={H - 6} textAnchor="middle" className="fill-neutral-500 text-[9px]">
                  {d.day.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}