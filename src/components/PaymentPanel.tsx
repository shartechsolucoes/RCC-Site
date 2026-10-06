"use client";

import { Check, Copy, FileUp, Loader2 } from "lucide-react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export interface PaymentInfo {
  registrationId: string;
  token: string;
  eventName: string | null;
  fullName: string;
  total: number;
  items: { name: string; option: string | null; unitPrice: number; quantity: number }[];
  status: "NOT_REQUIRED" | "PENDING" | "PROOF_SENT" | "PAID";
  proofUrl: string | null;
  pix: { copiaECola: string; qrCode: string; key: string; receiverName: string | null } | null;
}

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Pagamento Pix manual: mostra QR/copia-e-cola e recebe o comprovante.
// A coordenação confere o comprovante e confirma o pagamento no painel.
export function PaymentPanel({ eventId, initial }: { eventId: string; initial: PaymentInfo }) {
  const [payment, setPayment] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fee = payment.total - payment.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const returnLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/eventos/${eventId}/pagamento?r=${payment.registrationId}&t=${payment.token}`
      : "";

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleProof(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const upload = await fetch(`${API_URL}/uploads`, { method: "POST", body: formData });
      const uploaded = await upload.json().catch(() => null);
      if (!upload.ok) throw new Error(uploaded?.message ?? "Falha ao enviar o arquivo");

      const response = await fetch(`${API_URL}/registrations/${payment.registrationId}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: payment.token, proofUrl: uploaded.url }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Não foi possível registrar o comprovante");
      setPayment(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-sm border border-zinc-200 p-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Pagamento da inscrição</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {payment.fullName}
          {payment.eventName ? ` — ${payment.eventName}` : ""}
        </p>
      </div>

      <dl className="flex flex-col gap-1.5 text-sm">
        {fee > 0 && (
          <div className="flex justify-between">
            <dt className="text-zinc-500">Inscrição</dt>
            <dd className="text-zinc-800">{brl(fee)}</dd>
          </div>
        )}
        {payment.items.map((item) => (
          <div key={`${item.name}|${item.option ?? ""}`} className="flex justify-between">
            <dt className="text-zinc-500">
              {item.quantity}x {item.name}
              {item.option ? ` (${item.option})` : ""}
            </dt>
            <dd className="text-zinc-800">{brl(item.unitPrice * item.quantity)}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-zinc-100 pt-2 text-base font-semibold">
          <dt className="text-zinc-900">Total</dt>
          <dd className="text-[#8a5a2b]">{brl(payment.total)}</dd>
        </div>
      </dl>

      {payment.status === "PAID" ? (
        <p className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Pagamento confirmado pela coordenação. Obrigado!
        </p>
      ) : payment.pix ? (
        <>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={payment.pix.qrCode} alt="QR Code Pix" className="h-48 w-48 shrink-0 rounded-sm border border-zinc-100" />
            <div className="flex w-full min-w-0 flex-col gap-2 text-sm">
              <p className="text-zinc-700">
                Abra o app do seu banco, escolha <strong>Pix → Ler QR Code</strong> ou <strong>Pix copia e cola</strong>.
                O valor já vem preenchido.
              </p>
              <code className="block break-all rounded-sm bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                {payment.pix.copiaECola}
              </code>
              <button
                type="button"
                onClick={() => copy(payment.pix!.copiaECola)}
                className="flex w-fit items-center gap-1.5 rounded-sm bg-[#8a5a2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#71491f]"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copiado!" : "Copiar código Pix"}
              </button>
              <p className="text-xs text-zinc-400">
                Chave Pix: {payment.pix.key}
                {payment.pix.receiverName ? ` · ${payment.pix.receiverName}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
            <p className="text-sm font-medium text-zinc-800">Depois de pagar, envie o comprovante</p>
            {payment.status === "PROOF_SENT" && (
              <p className="rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Comprovante recebido! A coordenação vai conferir e confirmar o pagamento.
                {payment.proofUrl && (
                  <>
                    {" "}
                    <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="underline">
                      Ver arquivo enviado
                    </a>
                  </>
                )}
              </p>
            )}
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-sm border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
              {uploading ? "Enviando..." : payment.status === "PROOF_SENT" ? "Enviar outro comprovante" : "Enviar comprovante (imagem ou PDF)"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProof(file);
                  e.target.value = "";
                }}
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </>
      ) : (
        <p className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          A coordenação ainda não cadastrou a chave Pix deste evento. Entre em contato com a coordenação para pagar.
        </p>
      )}

      {payment.status !== "PAID" && returnLink && (
        <p className="text-xs text-zinc-400">
          Guarde este link para voltar a esta página e enviar o comprovante depois:{" "}
          <button type="button" onClick={() => copy(returnLink)} className="break-all text-left text-[#8a5a2b] underline">
            {returnLink}
          </button>
        </p>
      )}
    </div>
  );
}
