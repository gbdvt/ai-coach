type Props = {
  title?: string;
  lines: string[];
  className?: string;
};

export function GuidanceEmpty({ title, lines, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950/40 px-4 py-10 text-center ${className}`}
    >
      {title ? <p className="text-sm font-medium text-zinc-300">{title}</p> : null}
      <ul className={`mt-2 space-y-1 text-sm text-zinc-500 ${title ? "" : "mt-0"}`}>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
