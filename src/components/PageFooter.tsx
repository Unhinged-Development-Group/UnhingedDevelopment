export default function PageFooter() {
  return (
    <footer className="relative z-10 flex items-start justify-between border-t border-zinc-900 px-6 py-5 sm:px-10 lg:px-16">
      <div className="text-xs leading-relaxed text-zinc-400">
        <div className="flex justify-between gap-4">
          <span>© {new Date().getFullYear()}</span>
          <span>All rights reserved.</span>
        </div>
        <div>Unhinged Development Group Ltd.</div>
      </div>
      <p className="text-xs leading-relaxed text-zinc-400">
        Registered in<br />
        <span className="inline-flex items-center gap-1">
          Scotland.
          <svg viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-auto opacity-60" aria-label="Scotland">
            <rect width="18" height="12" rx="1" fill="#003893"/>
            <line x1="-1" y1="-1" x2="19" y2="13" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="19" y1="-1" x2="-1" y2="13" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </span>
      </p>
    </footer>
  );
}
