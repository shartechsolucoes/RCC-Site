"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { PaymentPanel, type PaymentInfo } from "@/components/PaymentPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

// Volta à página de pagamento pelo link guardado após a inscrição (?r=<inscrição>&t=<token>).
function PagamentoContent() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const registrationId = search.get("r");
  const token = search.get("t");
  const hasLink = Boolean(registrationId && token);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [fetchStatus, setStatus] = useState<"loading" | "ready" | "not-found">("loading");
  const status = hasLink ? fetchStatus : "not-found";

  useEffect(() => {
    if (!registrationId || !token) return;
    fetch(`${API_URL}/registrations/${registrationId}/payment?token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setPayment(data);
        setStatus(data ? "ready" : "not-found");
      })
      .catch(() => setStatus("not-found"));
  }, [registrationId, token]);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-6 py-16">
        {status === "loading" && <p className="text-sm text-zinc-500">Carregando...</p>}
        {status === "not-found" && (
          <p className="text-sm text-zinc-500">Link de pagamento inválido. Confira o link recebido após a inscrição.</p>
        )}
        {status === "ready" && payment && <PaymentPanel eventId={params.id} initial={payment} />}
      </div>
    </main>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={null}>
      <PagamentoContent />
    </Suspense>
  );
}
