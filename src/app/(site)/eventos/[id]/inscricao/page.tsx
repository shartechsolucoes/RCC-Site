"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";

const STEP_TITLES = [
  "Dados pessoais",
  "Endereço",
  "Contato",
  "Formação e profissão",
  "Vida de fé",
  "Saúde",
  "Situação familiar",
  "Contatos de emergência",
  "Encontros anteriores",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type Status = "idle" | "submitting" | "success" | "error";
type YesNo = "sim" | "nao";

const inputClass =
  "rounded-sm border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-[#8a5a2b] focus:ring-2 focus:ring-[#8a5a2b]/20";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-zinc-700";
const checkboxLabelClass =
  "flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700 has-[:checked]:border-[#8a5a2b] has-[:checked]:bg-[#8a5a2b]/10 has-[:checked]:text-[#8a5a2b]";

interface EventInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string | null;
}

function Section({
  title,
  description,
  active,
  registerRef,
  children,
}: {
  title: string;
  description?: string;
  active: boolean;
  registerRef?: (el: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section ref={registerRef} className={`flex flex-col gap-5 ${active ? "" : "hidden"}`}>
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

  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const lastStep = STEP_TITLES.length - 1;

  const [usaMedicamento, setUsaMedicamento] = useState<YesNo | "">("");
  const [alergiaMedicamento, setAlergiaMedicamento] = useState<YesNo | "">("");
  const [alergiaAlimentar, setAlergiaAlimentar] = useState<YesNo | "">("");
  const [cuidadoEspecial, setCuidadoEspecial] = useState<YesNo | "">("");
  const [participouMovimento, setParticipouMovimento] = useState<YesNo | "">("");
  const [temParenteNoEncontro, setTemParenteNoEncontro] = useState<YesNo | "">("");
  const [isCasado, setIsCasado] = useState<YesNo | "">("");
  const [temFilhos, setTemFilhos] = useState<YesNo | "">("");

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usaMedicamento || !alergiaMedicamento || !alergiaAlimentar || !cuidadoEspecial) {
      setStatus("error");
      setErrorMessage("Responda todas as perguntas de saúde obrigatórias.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const get = (key: string) => (form.get(key) as string) || undefined;

    const payload = {
      eventId: params.id,
      fullName: get("fullName"),
      cpf: get("cpf"),
      email: get("email"),
      phone: get("phone"),
      photoUrl: get("photoUrl") || undefined,

      nomeCracha: get("nomeCracha"),
      sexo: get("sexo"),
      dataNascimento: get("dataNascimento"),
      rua: get("rua"),
      numero: get("numero"),
      bairro: get("bairro"),
      cidade: get("cidade"),
      cep: get("cep"),
      instagram: get("instagram"),
      escolaridade: get("escolaridade"),
      profissao: get("profissao"),

      sacramentoBatismo: form.get("batismo") === "on",
      sacramentoEucaristia: form.get("eucaristia") === "on",
      sacramentoCrisma: form.get("crisma") === "on",
      sacramentoNenhum: form.get("semSacramento") === "on",

      participouMovimento: participouMovimento === "sim",
      quaisMovimentos: participouMovimento === "sim" ? get("quaisMovimentos") : undefined,
      incentivadoPor: get("incentivadoPor"),
      temParenteNoEncontro: temParenteNoEncontro === "sim",
      nomeParentesco: temParenteNoEncontro === "sim" ? get("nomeParentesco") : undefined,
      motivoEncontro: get("motivoEncontro"),

      usaMedicamentoContinuo: usaMedicamento === "sim",
      qualMedicamento: usaMedicamento === "sim" ? get("qualMedicamento") : undefined,
      temAlergiaMedicamento: alergiaMedicamento === "sim",
      quaisAlergiaMedicamento: alergiaMedicamento === "sim" ? get("quaisAlergiaMedicamento") : undefined,
      temAlergiaAlimentar: alergiaAlimentar === "sim",
      quaisAlergiaAlimentar: alergiaAlimentar === "sim" ? get("quaisAlergiaAlimentar") : undefined,
      precisaCuidadoEspecial: cuidadoEspecial === "sim",
      qualCuidadoEspecial: cuidadoEspecial === "sim" ? get("qualCuidadoEspecial") : undefined,

      emergencia1Nome: get("emergencia1Nome"),
      emergencia1Telefone: get("emergencia1Telefone"),
      emergencia2Nome: get("emergencia2Nome"),
      emergencia2Telefone: get("emergencia2Telefone"),
      emergencia3Nome: get("emergencia3Nome"),
      emergencia3Telefone: get("emergencia3Telefone"),

      isCasado: isCasado === "sim",
      dataCasamento: isCasado === "sim" ? get("dataCasamento") : undefined,
      nomeConjuge: isCasado === "sim" ? get("nomeConjuge") : undefined,
      temFilhos: temFilhos === "sim",
      idadesFilhos: temFilhos === "sim" ? get("idadesFilhos") : undefined,

      encontrosResgataMe: form.get("resgataMe") === "on",
      encontrosResgatao: form.get("resgatao") === "on",
      encontrosResgataMeConjugal: form.get("resgataMeConjugal") === "on",
      encontrosOutros: form.get("outrosEncontros") === "on",
      encontrosOutrosQual: get("outrosEncontrosQual"),
      encontrosNenhum: form.get("nenhumEncontro") === "on",
    };

    try {
      const response = await fetch(`${API_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Não foi possível enviar a inscrição");
      }

      setStatus("success");
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Erro inesperado");
    }
  }

  function validateCurrentStep() {
    setStepError(null);

    const section = stepRefs.current[step];
    const controls = section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    );

    if (controls) {
      for (const control of controls) {
        if (!control.reportValidity()) {
          return false;
        }
      }
    }

    if (step === 5 && (!usaMedicamento || !alergiaMedicamento || !alergiaAlimentar || !cuidadoEspecial)) {
      setStepError("Responda todas as perguntas de saúde obrigatórias.");
      return false;
    }

    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, lastStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStepError(null);
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-16">
        <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-zinc-900">
          Inscrição
        </h1>
        <p className="mt-1 text-lg font-medium text-[#8a5a2b]">{event?.name}</p>
        {event?.location && <p className="mt-0.5 text-sm text-zinc-500">{event.location}</p>}
        <p className="mt-3 text-sm text-zinc-500">
          Preencha os dados com atenção. Todas as informações ajudam a coordenação a te acolher
          melhor no evento.
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>
              Etapa {step + 1} de {STEP_TITLES.length} — {STEP_TITLES[step]}
            </span>
            <span>{Math.round(((step + 1) / STEP_TITLES.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-[#8a5a2b] transition-all"
              style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
            />
          </div>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.target as HTMLElement).tagName !== "TEXTAREA" && step !== lastStep) {
              event.preventDefault();
              goNext();
            }
          }}
          className="mt-6 flex w-full flex-col gap-6"
        >
          <Section title="Dados pessoais" active={step === 0} registerRef={(el) => (stepRefs.current[0] = el)}>
            <div className="flex justify-center">
              <ImageUpload name="photoUrl" label="Foto" shape="circle" />
            </div>

            <label className={labelClass}>
              Nome completo *
              <input name="fullName" required minLength={3} className={inputClass} />
            </label>

            <label className={labelClass}>
              Qual nome prefere no crachá *
              <input name="nomeCracha" required className={inputClass} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Sexo *
                <select name="sexo" required className={inputClass}>
                  <option value="">Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                </select>
              </label>

              <label className={labelClass}>
                Data de nascimento *
                <input type="date" name="dataNascimento" required className={inputClass} />
              </label>
            </div>

            <label className={labelClass}>
              CPF *
              <input name="cpf" required minLength={11} className={inputClass} />
            </label>
          </Section>

          <Section title="Endereço" active={step === 1} registerRef={(el) => (stepRefs.current[1] = el)}>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label className={labelClass}>
                Rua / Avenida *
                <input name="rua" required className={inputClass} />
              </label>
              <label className={labelClass}>
                Número *
                <input name="numero" required className={inputClass} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="bairro" required placeholder="Bairro *" className={inputClass} />
              <input name="cidade" required placeholder="Cidade *" className={inputClass} />
              <input name="cep" required placeholder="CEP *" className={inputClass} />
            </div>
          </Section>

          <Section title="Contato" active={step === 2} registerRef={(el) => (stepRefs.current[2] = el)}>
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

            <label className={labelClass}>
              Instagram / rede social
              <input name="instagram" className={inputClass} />
            </label>
          </Section>

          <Section title="Formação e profissão" active={step === 3} registerRef={(el) => (stepRefs.current[3] = el)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Grau de escolaridade *
                <select name="escolaridade" required className={inputClass}>
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

              <label className={labelClass}>
                Profissão *
                <input name="profissao" required className={inputClass} />
              </label>
            </div>
          </Section>

          <Section title="Vida de fé" description="Sacramentos e trajetória em outros movimentos." active={step === 4} registerRef={(el) => (stepRefs.current[4] = el)}>
            <div className={labelClass}>
              <span>Situação sacramental</span>
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

            <YesNoField
              legend="Já participou de algum movimento de igreja?"
              value={participouMovimento}
              onChange={setParticipouMovimento}
            >
              <input name="quaisMovimentos" placeholder="Quais?" className={`${inputClass} mt-2`} />
            </YesNoField>

            <label className={labelClass}>
              Quem te incentivou a participar do encontro?
              <input name="incentivadoPor" className={inputClass} />
            </label>

            <YesNoField
              legend="Você tem parentes ou amigos que já fizeram esse encontro?"
              value={temParenteNoEncontro}
              onChange={setTemParenteNoEncontro}
            >
              <input
                name="nomeParentesco"
                placeholder="Nome e grau de parentesco"
                className={`${inputClass} mt-2`}
              />
            </YesNoField>

            <label className={labelClass}>
              Por que você deseja fazer esse encontro?
              <textarea name="motivoEncontro" className={inputClass} rows={3} />
            </label>
          </Section>

          <Section title="Saúde" description="Informações importantes para a equipe de cuidado." active={step === 5} registerRef={(el) => (stepRefs.current[5] = el)}>
            <YesNoField
              legend="Você usa algum medicamento de forma contínua por indicação médica?"
              value={usaMedicamento}
              onChange={setUsaMedicamento}
              required
            >
              <input name="qualMedicamento" placeholder="Qual?" className={`${inputClass} mt-2`} />
            </YesNoField>

            <YesNoField
              legend="Você tem restrição/alergia a medicamentos?"
              value={alergiaMedicamento}
              onChange={setAlergiaMedicamento}
              required
            >
              <input
                name="quaisAlergiaMedicamento"
                placeholder="Quais?"
                className={`${inputClass} mt-2`}
              />
            </YesNoField>

            <YesNoField
              legend="Você tem restrição/alergia alimentar?"
              value={alergiaAlimentar}
              onChange={setAlergiaAlimentar}
              required
            >
              <input
                name="quaisAlergiaAlimentar"
                placeholder="Quais?"
                className={`${inputClass} mt-2`}
              />
            </YesNoField>

            <YesNoField
              legend="Você necessita de cuidado especial?"
              value={cuidadoEspecial}
              onChange={setCuidadoEspecial}
              required
            >
              <input name="qualCuidadoEspecial" placeholder="Qual?" className={`${inputClass} mt-2`} />
            </YesNoField>
          </Section>

          <Section title="Situação familiar" active={step === 6} registerRef={(el) => (stepRefs.current[6] = el)}>
            <YesNoField legend="Você é casado? *" value={isCasado} onChange={setIsCasado}>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Data do casamento
                  <input type="date" name="dataCasamento" className={inputClass} />
                </label>
                <label className={labelClass}>
                  Nome do cônjuge
                  <input name="nomeConjuge" className={inputClass} />
                </label>
              </div>
            </YesNoField>

            <YesNoField legend="Você tem filhos? *" value={temFilhos} onChange={setTemFilhos}>
              <input
                name="idadesFilhos"
                placeholder="Idade dos filhos"
                className={`${inputClass} mt-2`}
              />
            </YesNoField>
          </Section>

          <Section
            title="Contatos de emergência"
            description="Até 3 contatos que não estarão no local do evento."
            active={step === 7} registerRef={(el) => (stepRefs.current[7] = el)}
          >
            {[1, 2, 3].map((n) => (
              <div key={n} className="grid gap-4 sm:grid-cols-2">
                <input
                  name={`emergencia${n}Nome`}
                  required={n === 1}
                  placeholder={`Contato de emergência ${n} — nome${n === 1 ? " *" : ""}`}
                  className={inputClass}
                />
                <input
                  name={`emergencia${n}Telefone`}
                  required={n === 1}
                  placeholder={`Contato de emergência ${n} — telefone${n === 1 ? " *" : ""}`}
                  className={inputClass}
                />
              </div>
            ))}
          </Section>

          <Section title="Encontros anteriores" active={step === 8} registerRef={(el) => (stepRefs.current[8] = el)}>
            <div className={labelClass}>
              <span>Você já fez algum desses encontros?</span>
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
              <input
                name="outrosEncontrosQual"
                placeholder="Qual outro encontro?"
                className={`${inputClass} mt-1`}
              />
            </div>
          </Section>

          {stepError && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {stepError}
            </p>
          )}

          {status === "success" && (
            <p className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Inscrição enviada com sucesso! A coordenação irá analisar seus dados.
            </p>
          )}

          {status === "error" && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
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
                {status === "submitting" ? "Enviando..." : "Enviar inscrição"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
