import Link from "next/link";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/icons";

export function SiteFooterV2() {
  return (
    <footer className="w-full bg-[#c9a97c]">
      <div className="grid w-full grid-cols-1 sm:grid-cols-2">
        <div className="flex justify-end bg-white">
          <div className="flex w-full max-w-lg flex-col gap-6 px-6 py-14 sm:pr-12">
            <div>
              <h2 className="text-3xl font-extrabold uppercase tracking-tighter text-zinc-900">Contatos</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Rua Rosa da Penha, Vista Mar, Cariacica - ES, 29143-236, Brasil
              </p>
            </div>

            <div className="flex flex-wrap gap-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-900">Redes sociais</p>
                <div className="mt-3 flex gap-3">
                  <a
                    href="https://www.facebook.com/share/1DD1nVmcUt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a5a2b] text-white transition-colors hover:bg-[#71491f]"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/ocaminhoespiritosanto?igsh=Mzd5a3h4OWNoaDky"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a5a2b] text-white transition-colors hover:bg-[#71491f]"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UCDD5939XpXII7U9g0gEIOUg"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a5a2b] text-white transition-colors hover:bg-[#71491f]"
                  >
                    <YoutubeIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-900">Contato</p>
                <p className="mt-3 text-sm text-zinc-500">
                  <a href="tel:+5527997315379" className="hover:text-[#8a5a2b]">+55 27 99731-5379</a>
                </p>
                <p className="text-sm text-zinc-500">
                  <a href="mailto:scascalbailao@ocaminho.org" className="hover:text-[#8a5a2b]">
                    scascalbailao@ocaminho.org
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-[280px] items-center justify-center bg-zinc-200 text-sm text-zinc-500">
          Mapa
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Fraternidade</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/80">
            <li><Link href="/eventos" className="hover:text-white">Próximos Encontros</Link></li>
            <li><Link href="/sobre" className="hover:text-white">Nossa Fraternidade</Link></li>
            <li><Link href="/jornada" className="hover:text-white">Nossa História</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Nossos Contatos</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/80">
            <li><Link href="/contato" className="hover:text-white">Fale Conosco</Link></li>
            <li><Link href="/missoes" className="hover:text-white">Missões</Link></li>
            <li><Link href="/noticias" className="hover:text-white">Notícias</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
