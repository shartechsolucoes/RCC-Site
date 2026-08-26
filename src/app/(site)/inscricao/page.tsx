import { redirect } from "next/navigation";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export default function InscricaoPage() {
  redirect(`${DASHBOARD_URL}/inscricoes/nova`);
}
