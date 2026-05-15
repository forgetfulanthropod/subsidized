interface DocumentPlaceholderProps {
  label: string;
  className?: string;
}

/** Generic document page placeholder for review UI. */
export function DocumentPlaceholder({
  label,
  className,
}: DocumentPlaceholderProps) {
  return (
    <div
      className={className}
      role="img"
      aria-label={`Document preview: ${label}`}
    >
      <svg
        viewBox="0 0 200 260"
        className="mx-auto h-auto w-full max-w-[200px] text-slate-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="8"
          y="4"
          width="184"
          height="252"
          rx="6"
          className="fill-white stroke-slate-300"
          strokeWidth="2"
        />
        <rect x="24" y="28" width="80" height="10" rx="2" className="fill-slate-200" />
        <rect x="24" y="48" width="152" height="6" rx="2" className="fill-slate-100" />
        <rect x="24" y="62" width="140" height="6" rx="2" className="fill-slate-100" />
        <rect x="24" y="76" width="148" height="6" rx="2" className="fill-slate-100" />
        <rect x="24" y="96" width="60" height="6" rx="2" className="fill-slate-200" />
        <rect x="24" y="116" width="152" height="6" rx="2" className="fill-slate-100" />
        <rect x="24" y="130" width="132" height="6" rx="2" className="fill-slate-100" />
        <rect x="24" y="144" width="145" height="6" rx="2" className="fill-slate-100" />
        <rect x="24" y="164" width="100" height="48" rx="4" className="fill-slate-50 stroke-slate-200" strokeWidth="1" />
        <rect x="24" y="224" width="152" height="6" rx="2" className="fill-slate-100" />
        <rect x="24" y="238" width="120" height="6" rx="2" className="fill-slate-100" />
        <path
          d="M148 4 L184 4 L184 40 L148 4 Z"
          className="fill-slate-100 stroke-slate-300"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-3 text-center text-xs font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-center text-xs text-slate-400">Preview placeholder</p>
    </div>
  );
}
