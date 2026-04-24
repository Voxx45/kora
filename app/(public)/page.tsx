export default function HomePage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-24 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#8E8E93] mb-4">
        Studio digital · Local & Indépendant
      </p>
      <h1 className="text-[48px] font-black tracking-[-2px] text-[#1C1C1E] leading-[1.05] mb-4">
        Votre activité mérite<br />
        <span className="text-[#8E8E93] font-light">une vraie vitrine.</span>
      </h1>
      <p className="text-[14px] text-[#8E8E93] max-w-[400px] mx-auto mb-8 leading-[1.65]">
        Sites web, identité visuelle, référencement local.
        On transforme votre présence digitale en moteur de croissance.
      </p>
      <div className="flex gap-3 justify-center">
        <a
          href="/contact"
          className="text-[12px] font-semibold px-6 py-[11px] rounded-[100px] bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] transition-colors"
        >
          Démarrer un projet →
        </a>
        <a
          href="/portfolio"
          className="text-[12px] font-medium px-6 py-[11px] rounded-[100px] bg-black/[0.06] text-[#1C1C1E] hover:bg-black/10 transition-colors"
        >
          Voir les réalisations
        </a>
      </div>
    </div>
  )
}
