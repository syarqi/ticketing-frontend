const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-100 text-red-700 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  green: 'bg-green-100 text-green-700 border-green-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
};

export function PriorityBadge({ name, color }: { name: string; color: string }) {
  const classes = COLOR_MAP[color] ?? 'bg-slate-100 text-slate-700 border-slate-300';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      {name}
    </span>
  );
}
