import { SiteHeaderV2 } from "@/components/SiteHeaderV2";
import { SiteFooterV2 } from "@/components/SiteFooterV2";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeaderV2 variant="solid" />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooterV2 />
    </div>
  );
}
