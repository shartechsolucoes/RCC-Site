import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/icons";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

const NAV_LEFT = [
  { label: "Home", href: "/" },
  { label: "RCC", href: "/sobre" },
  { label: "Nossa Jornada", href: "/jornada" },
];

const NAV_RIGHT = [
  { label: "Eventos", href: "/eventos" },
  { label: "Missões", href: "/missoes" },
  { label: "Notícias", href: "/noticias" },
  { label: "Contato", href: "/contato" },
];

export function SiteHeaderV2({ variant = "solid" }: { variant?: "solid" | "overlay" }) {
  const overlay = variant === "overlay";

  return (
    <header
      className={
        overlay
          ? "border-b border-white/30"
          : "border-b border-zinc-200 bg-white"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl items-stretch justify-between gap-6 px-6 py-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <Image
            src="/logo-cropped.png"
            alt="RCC"
            width={555}
            height={287}
            className={`h-8 w-auto ${overlay ? "" : "invert"}`}
            priority
          />
          <span className={`text-sm font-semibold tracking-wide ${overlay ? "text-white" : "text-zinc-900"}`}>
            Renovação com Cristo
          </span>
        </Link>

        <nav
          className={`hidden flex-1 items-center justify-end self-center gap-7 text-sm font-medium sm:flex ${
            overlay ? "text-white/85" : "text-zinc-600"
          }`}
        >
          {[...NAV_LEFT, ...NAV_RIGHT].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${overlay ? "hover:text-white" : "hover:text-zinc-900"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={`flex items-center gap-1 self-center ${overlay ? "text-white" : "text-zinc-700"}`}>
          <a
            href="https://www.facebook.com/share/1DD1nVmcUt/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={`flex h-8 w-8 items-center justify-center transition-colors ${
              overlay ? "hover:text-white" : "hover:text-zinc-900"
            }`}
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.instagram.com/ocaminhoespiritosanto?igsh=Mzd5a3h4OWNoaDky"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={`flex h-8 w-8 items-center justify-center transition-colors ${
              overlay ? "hover:text-white" : "hover:text-zinc-900"
            }`}
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.youtube.com/channel/UCDD5939XpXII7U9g0gEIOUg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className={`flex h-8 w-8 items-center justify-center transition-colors ${
              overlay ? "hover:text-white" : "hover:text-zinc-900"
            }`}
          >
            <YoutubeIcon className="h-4 w-4" />
          </a>
        </div>

        <a
          href={DASHBOARD_URL}
          aria-label="Área do Membro"
          className={`flex h-7 w-7 items-center justify-center self-center transition-colors ${
            overlay ? "text-white hover:text-white/80" : "text-zinc-700 hover:text-zinc-900"
          }`}
        >
          <User size={14} />
        </a>
      </div>
    </header>
  );
}
