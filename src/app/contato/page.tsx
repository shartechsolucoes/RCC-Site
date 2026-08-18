export default function ContatoPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Contato
        </h1>
        <div className="mt-4 flex max-w-xl flex-col gap-8 text-lg leading-8 text-zinc-600">
          <div>
            <p><strong>Endereço:</strong> Rua Rosa da Penha, Vista Mar, Cariacica - ES, 29143-236, Brasil</p>
            <p><strong>E-mail:</strong> <a href="mailto:scascalbailao@ocaminho.org" className="text-amber-600 hover:underline">scascalbailao@ocaminho.org</a></p>
            <p><strong>Telefone:</strong> <a href="tel:+5527997315379" className="text-amber-600 hover:underline">+55 27 99731-5379</a></p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Nossa Equipe</h2>
            <ul className="list-inside list-disc">
              <li>Frei Eden (Custódio)</li>
              <li>Frei Joel</li>
              <li>Frei Pascal</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
