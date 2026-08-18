"use client";

import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.25-1.5 1.55-1.5H16.6V4.35C16.3 4.3 15.3 4.2 14.15 4.2c-2.4 0-4.05 1.46-4.05 4.15V10.5H7.6v3h2.5V21h3.4Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.6a3 3 0 0 0-2.1-2.1C17.7 5 12 5 12 5s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.4 3 3 0 0 0 2.1 2.1C6.3 19 12 19 12 19s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.4ZM10 15V9l5 3-5 3Z" />
    </svg>
  );
}
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "RCC", href: "/sobre" },
  { label: "Nossa Jornada", href: "/jornada" },
  { label: "Missões", href: "/missoes" },
  { label: "Notícias", href: "/noticias" },
  { label: "Eventos", href: "/eventos" },
  { label: "Contato", href: "/contato" },
];

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <>
      <header
        className={`inset-x-0 top-0 z-30 ${
          isHome
            ? "absolute bg-gradient-to-b from-black/60 via-black/10 to-transparent"
            : "sticky border-b border-white/10 bg-zinc-900"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-xs font-medium tracking-widest text-white/90 transition-colors hover:text-white sm:hidden"
          >
            <Menu size={18} />
            MENU
          </button>

          <a href="/" className="flex flex-col items-center text-center leading-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/70 text-sm text-amber-400">
              R
            </span>
            <span className="mt-1 text-sm font-semibold tracking-[0.2em]">RCC</span>
          </a>

          <nav className="hidden items-center gap-5 whitespace-nowrap text-[10px] font-medium tracking-wide text-white/80 sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href ? "text-amber-400" : "hover:text-white"
                }`}
              >
                {link.label.toUpperCase()}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 text-white/80 sm:flex">
              <a href="https://www.facebook.com/share/1DD1nVmcUt/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white hover:text-white">
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a href="https://www.instagram.com/ocaminhoespiritosanto?igsh=Mzd5a3h4OWNoaDky" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white hover:text-white">
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
              <a href="https://www.youtube.com/channel/UCDD5939XpXII7U9g0gEIOUg" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white hover:text-white">
                <YoutubeIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            <a
              href={DASHBOARD_URL}
              className="hidden shrink-0 whitespace-nowrap rounded-full bg-amber-500 px-4 py-2 text-[10px] font-semibold tracking-widest text-zinc-900 transition-colors hover:bg-amber-400 sm:inline-block"
            >
              ÁREA DO MEMBRO
            </a>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-zinc-900/98 px-6 py-6 text-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <span className="text-sm font-semibold tracking-[0.2em]">RCC</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="text-white/80 hover:text-white">
              <X size={22} />
            </button>
          </div>
          <nav className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 text-lg">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-full px-4 py-2 tracking-wide transition-colors ${
                  pathname === link.href ? "bg-amber-400/10 font-medium text-amber-400" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a href={DASHBOARD_URL} onClick={() => setOpen(false)} className="rounded-full px-4 py-2 tracking-wide text-white/80 hover:bg-white/10 hover:text-white">
              Área do Membro
            </a>
            <a
              href="/inscricao"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-amber-500 px-6 py-2 font-medium text-zinc-900 hover:bg-amber-400"
            >
              Inscrição
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
