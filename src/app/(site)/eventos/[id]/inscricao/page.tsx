"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { PaymentPanel, type PaymentInfo } from "@/components/PaymentPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type Status = "idle" | "submitting" | "success" | "error";
type YesNo = "sim" | "nao";
type FieldMode = "hidden" | "optional" | "required";

const inputClass =
  "rounded-sm border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-[#8a5a2b] focus:ring-2 focus:ring-[#8a5a2b]/20";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-zinc-700";
const checkboxLabelClass =
  "flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700 has-[:checked]:border-[#8a5a2b] has-[:checked]:bg-[#8a5a2b]/10 has-[:checked]:text-[#8a5a2b]";

interface EventItem {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  options: string[];
  price: number;
  maxPerPerson: number | null;
}

interface EventInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string | null;
  registration: {
    registrationFee: number;
    form: Record<string, FieldMode>;
    items: EventItem[];
  } | null;
}

// Seções do formulário e os campos configuráveis de cada uma (chaves do catálogo da API).
// Seção sem nenhum campo visível some. Dados pessoais e contato sempre aparecem (nome, celular, e-mail).
const SECTIONS = [
  { key: "pessoais", fields: ["photo", "nomeCracha", "sexo", "dataNascimento", "cpf"], always: true },
  { key: "contato", fields: ["instagram"], always: true },
  { key: "endereco", fields: ["cep", "rua", "numero", "complemento", "bairro", "cidade", "estado"] },
  { key: "formacao", fields: ["escolaridade", "profissao"] },
  { key: "fe", fields: ["sacramentos", "movimentos", "incentivadoPor", "parente", "motivoEncontro"] },
  { key: "encontros", fields: ["encontros"] },
  { key: "saude", fields: ["medicamento", "alergiaMedicamento", "alergiaAlimentar", "cuidadoEspecial"] },
  { key: "familia", fields: ["casado", "filhos"] },
  { key: "emergencia", fields: ["emergencia1", "emergencia2", "emergencia3"] },
  { key: "pagamento", fields: [] },
] as const;

type StepKey = (typeof SECTIONS)[number]["key"];

// Etapas = grupos de seções. Etapa sem seção visível é pulada.
const STEP_GROUPS: { title: string; sections: StepKey[] }[] = [
  { title: "Seus dados", sections: ["pessoais", "contato"] },
  { title: "Endereço e formação", sections: ["endereco", "formacao"] },
  { title: "Vida de fé", sections: ["fe", "encontros"] },
  { title: "Saúde e família", sections: ["saude", "familia", "emergencia"] },
  { title: "Itens e pagamento", sections: ["pagamento"] },
];

// Perguntas sim/não e a chave de campo correspondente.
const YES_NO_FIELDS = ["movimentos", "parente", "medicamento", "alergiaMedicamento", "alergiaAlimentar", "cuidadoEspecial", "casado", "filhos"] as const;
type YesNoKey = (typeof YES_NO_FIELDS)[number];

const YES_NO_LABEL: Record<YesNoKey, string> = {
  movimentos: "Já participou de algum movimento de igreja?",
  parente: "Você tem parentes ou amigos que já fizeram esse encontro?",
  medicamento: "Você usa algum medicamento de forma contínua por indicação médica?",
  alergiaMedicamento: "Você tem restrição/alergia a medicamentos?",
  alergiaAlimentar: "Você tem restrição/alergia alimentar?",
  cuidadoEspecial: "Você necessita de cuidado especial?",
  casado: "Você é casado?",
  filhos: "Você tem filhos?",
};

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Chave da quantidade escolhida: item + opção (tamanho). Item sem opções usa opção "".
const qtyKey = (itemId: string, option: string) => `${itemId}|${option}`;

function Stepper({
  label,
  value,
  canIncrease,
  onChange,
}: {
  label: string;
  value: number;
  canIncrease: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        aria-label={`Diminuir ${label}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-zinc-900" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label={`Aumentar ${label}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function ItemCard({
  item,
  quantities,
  onQuantity,
}: {
  item: EventItem;
  quantities: Record<string, number>;
  onQuantity: (option: string, value: number) => void;
}) {
  const [photo, setPhoto] = useState(0);
  const options = item.options.length > 0 ? item.options : [""];
  const chosen = options.reduce((sum, o) => sum + (quantities[qtyKey(item.id, o)] ?? 0), 0);
  const max = item.maxPerPerson ?? 99;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row">
      {item.images.length > 0 && (
        <div className="flex shrink-0 flex-col gap-2 sm:w-44">
          <a href={item.images[photo]} target="_blank" rel="noreferrer" title="Ver foto ampliada">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.images[photo]}
              alt={item.name}
              className="aspect-square w-full rounded-sm border border-zinc-100 object-cover"
            />
          </a>
          {item.images.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {item.images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPhoto(index)}
                  aria-label={`Foto ${index + 1} de ${item.name}`}
                  className={`h-10 w-10 overflow-hidden rounded-sm border-2 ${index === photo ? "border-[#8a5a2b]" : "border-transparent"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
          {item.description && <p className="text-sm text-zinc-500">{item.description}</p>}
          <p className="mt-0.5 text-sm text-[#8a5a2b]">
            {brl(item.price)}
            {item.maxPerPerson ? <span className="text-xs text-zinc-400"> · até {item.maxPerPerson} por pessoa</span> : null}
          </p>
        </div>

        <div className="flex flex-col divide-y divide-zinc-100">
          {options.map((option) => (
            <div key={option || "único"} className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-sm text-zinc-700">{option ? `Tamanho ${option}` : "Quantidade"}</span>
              <Stepper
                label={option ? `${item.name} tamanho ${option}` : item.name}
                value={quantities[qtyKey(item.id, option)] ?? 0}
                canIncrease={chosen < max}
                onChange={(value) => onQuantity(option, Math.max(0, value))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  active,
  stepKey,
  children,
}: {
  title: string;
  description?: string;
  active: boolean;
  stepKey: StepKey;
  children: React.ReactNode;
}) {
  return (
    <section data-step={stepKey} className={`flex flex-col gap-5 ${active ? "" : "hidden"}`}>
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-[#8a5a2b]" />
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function YesNoField({
  legend,
  value,
  onChange,
  required,
  children,
}: {
  legend: string;
  value: YesNo | "";
  onChange: (value: YesNo) => void;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={labelClass}>
      <span>
        {legend}
        {required && <span className="text-[#8a5a2b]"> *</span>}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("sim")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            value === "sim"
              ? "border-[#8a5a2b] bg-[#8a5a2b] text-white"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-[#8a5a2b]/50"
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange("nao")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            value === "nao"
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
          }`}
        >
          Não
        </button>
      </div>
      {value === "sim" && children}
    </div>
  );
}

export default function EventoInscricaoPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [eventStatus, setEventStatus] = useState<"loading" | "ready" | "not-found">("loading");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [yesNo, setYesNo] = useState<Partial<Record<YesNoKey, YesNo>>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!eventId) return;
    fetch(`${API_URL}/events/${eventId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setEvent(data);
          setEventStatus("ready");
        } else {
          setEventStatus("not-found");
        }
      })
      .catch(() => setEventStatus("not-found"));
  }, [eventId]);

  const form = event?.registration?.form ?? {};
  const fee = event?.registration?.registrationFee ?? 0;
  const items = event?.registration?.items ?? [];
  const mode = (key: string): FieldMode => form[key] ?? "optional";
  const show = (key: string) => mode(key) !== "hidden";
  const req = (key: string) => mode(key) === "required";
  const star = (key: string) => (req(key) ? " *" : "");

  const itemsTotal = items.reduce((sum, item) => {
    const options = item.options.length > 0 ? item.options : [""];
    return sum + options.reduce((s, o) => s + item.price * (quantities[qtyKey(item.id, o)] ?? 0), 0);
  }, 0);
  const total = fee + itemsTotal;
  const hasPaymentStep = fee > 0 || items.length > 0;

  const sectionVisible = (key: StepKey) => {
    const section = SECTIONS.find((s) => s.key === key)!;
    if (key === "pagamento") return hasPaymentStep;
    return ("always" in section && section.always) || section.fields.some((f) => show(f));
  };
  const steps = STEP_GROUPS.map((group) => ({ ...group, sections: group.sections.filter(sectionVisible) })).filter(
    (group) => group.sections.length > 0,
  );
  const lastStep = steps.length - 1;
  const currentSections = steps[step]?.sections ?? [];
  const isActive = (key: StepKey) => currentSections.includes(key);

  function setAnswer(key: YesNoKey, value: YesNo) {
    setYesNo((currentAnswers) => ({ ...currentAnswers, [key]: value }));
  }

  // Perguntas sim/não obrigatórias e visíveis nas seções informadas (todas, se omitido) sem resposta.
  function unansweredRequired(sectionKeys?: StepKey[]) {
    return YES_NO_FIELDS.filter((key) => req(key) && !yesNo[key]).filter(
      (key) => !sectionKeys || sectionKeys.some((s) => SECTIONS.find((x) => x.key === s)?.fields.includes(key as never)),
    );
  }

  function choicesMissing(sectionKeys: StepKey[]) {
    const formEl = formRef.current;
    if (!formEl) return false;
    const checked = (names: string[]) => names.some((n) => (formEl.elements.namedItem(n) as HTMLInputElement | null)?.checked);
    if (sectionKeys.includes("fe") && req("sacramentos") && !checked(["batismo", "eucaristia", "crisma", "semSacramento"]))
      return "Marque a situação sacramental.";
    if (
      sectionKeys.includes("encontros") &&
      req("encontros") &&
      !checked(["resgataMe", "resgatao", "resgataMeConjugal", "outrosEncontros", "nenhumEncontro"])
    )
      return "Marque ao menos uma opção de encontros anteriores.";
    return false;
  }

  function validateCurrentStep() {
    setStepError(null);
    if (currentSections.length === 0) return true;

    for (const key of currentSections) {
      const section = formRef.current?.querySelector<HTMLElement>(`[data-step="${key}"]`);
      const controls = section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea",
      );
      for (const control of controls ?? []) {
        if (!control.reportValidity()) return false;
      }
    }

    if (unansweredRequired(currentSections).length > 0) {
      setStepError("Responda todas as perguntas obrigatórias (*).");
      return false;
    }
    const choiceError = choicesMissing(currentSections);
    if (choiceError) {
      setStepError(choiceError);
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(s + 1, lastStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (!validateCurrentStep()) return;

    if (unansweredRequired().length > 0) {
      setStatus("error");
      setErrorMessage("Há perguntas obrigatórias sem resposta. Volte às etapas anteriores.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const data = new FormData(submitEvent.currentTarget);
    const get = (key: string) => (data.get(key) as string) || undefined;
    const on = (key: string) => data.get(key) === "on";
    // Sim/não: undefined quando não respondida (a API diferencia de "não").
    const answer = (key: YesNoKey) => (yesNo[key] ? yesNo[key] === "sim" : undefined);
    const ifYes = (key: YesNoKey, field: string) => (yesNo[key] === "sim" ? get(field) : undefined);

    const payload = {
      eventId,
      fullName: get("fullName"),
      cpf: get("cpf"),
      email: get("email"),
      phone: get("phone"),
      photoUrl: get("photoUrl"),

      nomeCracha: get("nomeCracha"),
      sexo: get("sexo"),
      dataNascimento: get("dataNascimento"),
      cep: get("cep"),
      rua: get("rua"),
      numero: get("numero"),
      complemento: get("complemento"),
      bairro: get("bairro"),
      cidade: get("cidade"),
      estado: get("estado"),
      instagram: get("instagram"),
      escolaridade: get("escolaridade"),
      profissao: get("profissao"),

      ...(show("sacramentos") && {
        sacramentoBatismo: on("batismo"),
        sacramentoEucaristia: on("eucaristia"),
        sacramentoCrisma: on("crisma"),
        sacramentoNenhum: on("semSacramento"),
      }),

      participouMovimento: answer("movimentos"),
      quaisMovimentos: ifYes("movimentos", "quaisMovimentos"),
      incentivadoPor: get("incentivadoPor"),
      temParenteNoEncontro: answer("parente"),
      nomeParentesco: ifYes("parente", "nomeParentesco"),
      motivoEncontro: get("motivoEncontro"),

      usaMedicamentoContinuo: answer("medicamento"),
      qualMedicamento: ifYes("medicamento", "qualMedicamento"),
      temAlergiaMedicamento: answer("alergiaMedicamento"),
      quaisAlergiaMedicamento: ifYes("alergiaMedicamento", "quaisAlergiaMedicamento"),
      temAlergiaAlimentar: answer("alergiaAlimentar"),
      quaisAlergiaAlimentar: ifYes("alergiaAlimentar", "quaisAlergiaAlimentar"),
      precisaCuidadoEspecial: answer("cuidadoEspecial"),
      qualCuidadoEspecial: ifYes("cuidadoEspecial", "qualCuidadoEspecial"),

      isCasado: answer("casado"),
      dataCasamento: ifYes("casado", "dataCasamento"),
      nomeConjuge: ifYes("casado", "nomeConjuge"),
      temFilhos: answer("filhos"),
      idadesFilhos: ifYes("filhos", "idadesFilhos"),

      emergencia1Nome: get("emergencia1Nome"),
      emergencia1Telefone: get("emergencia1Telefone"),
      emergencia2Nome: get("emergencia2Nome"),
      emergencia2Telefone: get("emergencia2Telefone"),
      emergencia3Nome: get("emergencia3Nome"),
      emergencia3Telefone: get("emergencia3Telefone"),

      ...(show("encontros") && {
        encontrosResgataMe: on("resgataMe"),
        encontrosResgatao: on("resgatao"),
        encontrosResgataMeConjugal: on("resgataMeConjugal"),
        encontrosOutros: on("outrosEncontros"),
        encontrosOutrosQual: get("outrosEncontrosQual"),
        encontrosNenhum: on("nenhumEncontro"),
      }),

      items: Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([key, quantity]) => {
          const [itemId, option] = key.split("|");
          return { itemId, option: option || undefined, quantity };
        }),
    };

    try {
      const response = await fetch(`${API_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível enviar a inscrição");
      }

      setPayment(result?.payment ?? null);
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Erro inesperado");
    }
  }

  if (eventStatus === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center bg-white py-24">
        <p className="text-sm text-zinc-500">Carregando...</p>
      </main>
    );
  }

  if (eventStatus === "not-found") {
    return (
      <main className="flex flex-1 items-center justify-center bg-white px-6 py-24 text-center">
        <p className="text-sm text-zinc-500">Este link de inscrição não é válido ou o evento não existe mais.</p>
      </main>
    );
  }

  const header = (
    <>
      <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-zinc-900">Inscrição</h1>
      <p className="mt-1 text-lg font-medium text-[#8a5a2b]">{event?.name}</p>
      {event?.location && <p className="mt-0.5 text-sm text-zinc-500">{event.location}</p>}
    </>
  );

  if (status === "success") {
    return (
      <main className="flex flex-1 flex-col bg-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
          <div>{header}</div>
          <p className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Inscrição enviada com sucesso! A coordenação irá analisar seus dados.
            {payment && " Para concluir, faça o pagamento abaixo."}
          </p>
          {payment && <PaymentPanel eventId={eventId} initial={payment} />}
        </div>
      </main>
    );
  }

  const yesNoField = (key: YesNoKey, children?: React.ReactNode) =>
    show(key) && (
      <YesNoField
        key={key}
        legend={YES_NO_LABEL[key]}
        value={yesNo[key] ?? ""}
        onChange={(value) => setAnswer(key, value)}
        required={req(key)}
      >
        {children}
      </YesNoField>
    );

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-16">
        {header}
        <p className="mt-3 text-sm text-zinc-500">
          Preencha os dados com atenção. Todas as informações ajudam a coordenação a te acolher melhor no evento.
        </p>
        {hasPaymentStep && (
          <p className="mt-2 text-sm font-medium text-zinc-700">
            {fee > 0 ? `Valor da inscrição: ${brl(fee)}` : "Inscrição gratuita"}
            {items.length > 0 && " · itens opcionais na última etapa"}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>
              Etapa {step + 1} de {steps.length} — {steps[step]?.title}
            </span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-[#8a5a2b] transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onKeyDown={(keyEvent) => {
            if (keyEvent.key === "Enter" && (keyEvent.target as HTMLElement).tagName !== "TEXTAREA" && step !== lastStep) {
              keyEvent.preventDefault();
              goNext();
            }
          }}
          className="mt-6 flex w-full flex-col gap-6"
        >
          <Section title="Dados pessoais" active={isActive("pessoais")} stepKey="pessoais">
            {show("photo") && (
              <div className="flex justify-center">
                <ImageUpload name="photoUrl" label={`Foto${star("photo")}`} shape="circle" />
              </div>
            )}

            <label className={labelClass}>
              Nome completo *
              <input name="fullName" required minLength={3} className={inputClass} />
            </label>

            {show("nomeCracha") && (
              <label className={labelClass}>
                Qual nome prefere no crachá{star("nomeCracha")}
                <input name="nomeCracha" required={req("nomeCracha")} className={inputClass} />
              </label>
            )}

            {(show("sexo") || show("dataNascimento")) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {show("sexo") && (
                  <label className={labelClass}>
                    Sexo{star("sexo")}
                    <select name="sexo" required={req("sexo")} className={inputClass}>
                      <option value="">Selecione</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                    </select>
                  </label>
                )}
                {show("dataNascimento") && (
                  <label className={labelClass}>
                    Data de nascimento{star("dataNascimento")}
                    <input type="date" name="dataNascimento" required={req("dataNascimento")} className={inputClass} />
                  </label>
                )}
              </div>
            )}

            {show("cpf") && (
              <label className={labelClass}>
                CPF{star("cpf")}
                <input name="cpf" required={req("cpf")} minLength={11} className={inputClass} />
              </label>
            )}
          </Section>

          <Section title="Endereço" active={isActive("endereco")} stepKey="endereco">
            {show("cep") && (
              <label className={labelClass}>
                CEP{star("cep")}
                <input name="cep" required={req("cep")} className={inputClass} />
              </label>
            )}
            {(show("rua") || show("numero")) && (
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                {show("rua") && (
                  <label className={labelClass}>
                    Rua / Avenida{star("rua")}
                    <input name="rua" required={req("rua")} className={inputClass} />
                  </label>
                )}
                {show("numero") && (
                  <label className={labelClass}>
                    Número{star("numero")}
                    <input name="numero" required={req("numero")} className={inputClass} />
                  </label>
                )}
              </div>
            )}
            {show("complemento") && (
              <label className={labelClass}>
                Complemento{star("complemento")}
                <input name="complemento" required={req("complemento")} className={inputClass} />
              </label>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              {show("bairro") && (
                <label className={labelClass}>
                  Bairro{star("bairro")}
                  <input name="bairro" required={req("bairro")} className={inputClass} />
                </label>
              )}
              {show("cidade") && (
                <label className={labelClass}>
                  Cidade{star("cidade")}
                  <input name="cidade" required={req("cidade")} className={inputClass} />
                </label>
              )}
              {show("estado") && (
                <label className={labelClass}>
                  Estado{star("estado")}
                  <input name="estado" required={req("estado")} maxLength={30} className={inputClass} />
                </label>
              )}
            </div>
          </Section>

          <Section title="Contato" active={isActive("contato")} stepKey="contato">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Celular *
                <input name="phone" required minLength={8} className={inputClass} />
              </label>
              <label className={labelClass}>
                E-mail *
                <input type="email" name="email" required className={inputClass} />
              </label>
            </div>
            {show("instagram") && (
              <label className={labelClass}>
                Instagram / rede social{star("instagram")}
                <input name="instagram" required={req("instagram")} className={inputClass} />
              </label>
            )}
          </Section>

          <Section title="Formação e profissão" active={isActive("formacao")} stepKey="formacao">
            <div className="grid gap-4 sm:grid-cols-2">
              {show("escolaridade") && (
                <label className={labelClass}>
                  Grau de escolaridade{star("escolaridade")}
                  <select name="escolaridade" required={req("escolaridade")} className={inputClass}>
                    <option value="">Selecione</option>
                    <option value="fundamental_incompleto">Fundamental incompleto</option>
                    <option value="fundamental_completo">Fundamental completo</option>
                    <option value="medio_incompleto">Médio incompleto</option>
                    <option value="medio_completo">Médio completo</option>
                    <option value="superior_incompleto">Superior incompleto</option>
                    <option value="superior_completo">Superior completo</option>
                    <option value="pos_graduacao">Pós-graduação</option>
                  </select>
                </label>
              )}
              {show("profissao") && (
                <label className={labelClass}>
                  Profissão{star("profissao")}
                  <input name="profissao" required={req("profissao")} className={inputClass} />
                </label>
              )}
            </div>
          </Section>

          <Section
            title="Vida de fé"
            description="Sacramentos e trajetória em outros movimentos."
            active={isActive("fe")}
            stepKey="fe"
          >
            {show("sacramentos") && (
              <div className={labelClass}>
                <span>Situação sacramental{star("sacramentos")}</span>
                <div className="flex flex-wrap gap-2">
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="batismo" /> Batismo
                  </label>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="eucaristia" /> Eucaristia
                  </label>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="crisma" /> Crisma
                  </label>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="semSacramento" /> Nenhum
                  </label>
                </div>
              </div>
            )}

            {yesNoField("movimentos", <input name="quaisMovimentos" placeholder="Quais?" className={`${inputClass} mt-2`} />)}

            {show("incentivadoPor") && (
              <label className={labelClass}>
                Quem te incentivou a participar do encontro?{star("incentivadoPor")}
                <input name="incentivadoPor" required={req("incentivadoPor")} className={inputClass} />
              </label>
            )}

            {yesNoField(
              "parente",
              <input name="nomeParentesco" placeholder="Nome e grau de parentesco" className={`${inputClass} mt-2`} />,
            )}

            {show("motivoEncontro") && (
              <label className={labelClass}>
                Por que você deseja fazer esse encontro?{star("motivoEncontro")}
                <textarea name="motivoEncontro" required={req("motivoEncontro")} className={inputClass} rows={3} />
              </label>
            )}
          </Section>

          <Section
            title="Saúde"
            description="Informações importantes para a equipe de cuidado."
            active={isActive("saude")}
            stepKey="saude"
          >
            {yesNoField("medicamento", <input name="qualMedicamento" placeholder="Qual?" className={`${inputClass} mt-2`} />)}
            {yesNoField(
              "alergiaMedicamento",
              <input name="quaisAlergiaMedicamento" placeholder="Quais?" className={`${inputClass} mt-2`} />,
            )}
            {yesNoField(
              "alergiaAlimentar",
              <input name="quaisAlergiaAlimentar" placeholder="Quais?" className={`${inputClass} mt-2`} />,
            )}
            {yesNoField(
              "cuidadoEspecial",
              <input name="qualCuidadoEspecial" placeholder="Qual?" className={`${inputClass} mt-2`} />,
            )}
          </Section>

          <Section title="Situação familiar" active={isActive("familia")} stepKey="familia">
            {yesNoField(
              "casado",
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Data do casamento
                  <input type="date" name="dataCasamento" className={inputClass} />
                </label>
                <label className={labelClass}>
                  Nome do cônjuge
                  <input name="nomeConjuge" className={inputClass} />
                </label>
              </div>,
            )}
            {yesNoField("filhos", <input name="idadesFilhos" placeholder="Idade dos filhos" className={`${inputClass} mt-2`} />)}
          </Section>

          <Section
            title="Contatos de emergência"
            description="Contatos que não estarão no local do evento."
            active={isActive("emergencia")}
            stepKey="emergencia"
          >
            {[1, 2, 3]
              .filter((n) => show(`emergencia${n}`))
              .map((n) => (
                <div key={n} className="grid gap-4 sm:grid-cols-2">
                  <input
                    name={`emergencia${n}Nome`}
                    required={req(`emergencia${n}`)}
                    placeholder={`Contato de emergência ${n} — nome${star(`emergencia${n}`)}`}
                    className={inputClass}
                  />
                  <input
                    name={`emergencia${n}Telefone`}
                    required={req(`emergencia${n}`)}
                    placeholder={`Contato de emergência ${n} — telefone${star(`emergencia${n}`)}`}
                    className={inputClass}
                  />
                </div>
              ))}
          </Section>

          <Section title="Encontros anteriores" active={isActive("encontros")} stepKey="encontros">
            {show("encontros") && (
              <div className={labelClass}>
                <span>Você já fez algum desses encontros?{star("encontros")}</span>
                <div className="flex flex-wrap gap-2">
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="resgataMe" /> Resgata-me
                  </label>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="resgatao" /> Resgatão
                  </label>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="resgataMeConjugal" /> Resgata-me Conjugal
                  </label>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="outrosEncontros" /> Outros
                  </label>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="nenhumEncontro" /> Nenhum
                  </label>
                </div>
                <input name="outrosEncontrosQual" placeholder="Qual outro encontro?" className={`${inputClass} mt-1`} />
              </div>
            )}
          </Section>

          {hasPaymentStep && (
            <Section
              title="Itens e pagamento"
              description="O pagamento é feito por Pix depois de enviar a inscrição."
              active={isActive("pagamento")}
              stepKey="pagamento"
            >
              {items.length > 0 && (
                <div className="flex flex-col divide-y divide-zinc-100 rounded-sm border border-zinc-200">
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      quantities={quantities}
                      onQuantity={(option, value) => setQuantities((q) => ({ ...q, [qtyKey(item.id, option)]: value }))}
                    />
                  ))}
                </div>
              )}

              <dl className="flex flex-col gap-1.5 rounded-sm bg-zinc-50 px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Inscrição</dt>
                  <dd className="text-zinc-800">{fee > 0 ? brl(fee) : "Gratuita"}</dd>
                </div>
                {itemsTotal > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Itens</dt>
                    <dd className="text-zinc-800">{brl(itemsTotal)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-200 pt-1.5 text-base font-semibold">
                  <dt className="text-zinc-900">Total</dt>
                  <dd className="text-[#8a5a2b]">{brl(total)}</dd>
                </div>
              </dl>
            </Section>
          )}

          {stepError && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{stepError}</p>
          )}

          {status === "error" && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
          )}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="rounded-sm border border-zinc-200 px-6 py-3.5 text-sm font-semibold tracking-wide text-zinc-700 transition-colors hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-0"
            >
              Voltar
            </button>

            {step < lastStep ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-sm bg-[#8a5a2b] px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#71491f]"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-sm bg-[#8a5a2b] px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#71491f] disabled:opacity-50"
              >
                {status === "submitting" ? "Enviando..." : total > 0 ? `Enviar e pagar ${brl(total)}` : "Enviar inscrição"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
