import { ServiceSection } from '@/components/ServiceSection'
import { CtaBand } from '@/components/CtaBand'
import { SectionLabel } from '@/components/SectionLabel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services — KORA Studio digital',
  description: 'Création de site web, identité visuelle, SEO local, print, maintenance et réseaux sociaux. Découvrez toutes nos offres.',
}

const SERVICES = [
  {
    id: 'site-web',
    number: '01',
    icon: '🌐',
    title: 'Création de site web',
    description: "Un site pensé pour votre activité et vos clients. Mobile-first, rapide, et optimisé pour convertir les visiteurs en contacts qualifiés. On s'occupe de tout, de la maquette à la mise en ligne.",
    includes: [
      'Design sur-mesure et responsive',
      'Optimisation des performances (Core Web Vitals)',
      'Formulaire de contact intégré',
      'Hébergement et nom de domaine conseillés',
    ],
    price: 'À partir de 800 €',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    serviceParam: 'Création de site web',
  },
  {
    id: 'identite',
    number: '02',
    icon: '🎨',
    title: 'Identité visuelle',
    description: "Votre logo, vos couleurs, votre typographie — une charte graphique cohérente qui vous distingue et inspire confiance. Du logotype aux supports imprimés, on crée une image à votre image.",
    includes: [
      'Création de logo (3 propositions)',
      'Charte graphique complète (couleurs, typographies)',
      'Fichiers livrés en tous formats (SVG, PNG, PDF)',
      'Carte de visite et en-tête de mail inclus',
    ],
    price: 'À partir de 350 €',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    serviceParam: 'Identité visuelle',
  },
  {
    id: 'seo-local',
    number: '03',
    icon: '📍',
    title: 'Référencement local',
    description: "Soyez trouvé par vos clients au moment où ils vous cherchent. On optimise votre fiche Google Business, vos mots-clés locaux et votre présence sur les annuaires. Résultats visibles en 4 à 8 semaines.",
    includes: [
      'Création et optimisation de la fiche Google Business',
      'Audit et optimisation SEO on-page',
      'Dépôt sur les annuaires locaux majeurs',
      'Rapport mensuel de positionnement',
    ],
    price: 'À partir de 150 €/mois',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    serviceParam: 'Référencement local',
  },
  {
    id: 'print',
    number: '04',
    icon: '🖨️',
    title: 'Supports print',
    description: "Flyers, affiches, cartes de visite — des supports qui prolongent votre identité dans le monde physique. Fichiers prêts à l'impression, conseils sur les imprimeurs locaux.",
    includes: [
      'Conception graphique sur-mesure',
      'Déclinaison aux couleurs de votre charte',
      'Fichiers haute résolution prêts à imprimer',
      'Relecture et BAT inclus',
    ],
    price: 'À partir de 120 €',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    serviceParam: 'Supports print',
  },
  {
    id: 'maintenance',
    number: '05',
    icon: '🔧',
    title: 'Maintenance & support',
    description: "Votre site est un outil de travail. On le garde à jour, sécurisé et performant pour que vous ne pensiez à rien. En cas de problème, on répond sous 24h.",
    includes: [
      'Mises à jour CMS et extensions',
      'Sauvegardes hebdomadaires',
      'Surveillance et sécurité continue',
      '1h de modifications incluse par mois',
    ],
    price: 'À partir de 60 €/mois',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    serviceParam: 'Maintenance & support',
  },
  {
    id: 'reseaux',
    number: '06',
    icon: '📱',
    title: 'Réseaux sociaux',
    description: "Une présence régulière et cohérente sur les réseaux qui comptent pour votre cible. On crée le contenu, on planifie les publications et on gère les interactions.",
    includes: [
      '8 à 12 publications par mois',
      'Création des visuels et rédaction des textes',
      'Gestion des commentaires et messages',
      "Rapport mensuel d'engagement",
    ],
    price: 'À partir de 200 €/mois',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    serviceParam: 'Réseaux sociaux',
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="max-w-[700px] mx-auto px-6 py-16 text-center">
        <SectionLabel className="mb-3">NOS SERVICES</SectionLabel>
        <h1 className="text-[40px] font-black tracking-[-1.5px] text-[#1C1C1E] leading-[1.08] mb-4">
          Six façons de transformer<br />
          votre présence en ligne.
        </h1>
        <p className="text-[14px] leading-[1.7]" style={{ color: '#8E8E93' }}>
          Solutions sur-mesure pour les TPE et PME locales.<br />
          Chaque service est pensé pour votre réalité de terrain.
        </p>
      </section>

      {/* Sections alternées */}
      {SERVICES.map((service, index) => (
        <ServiceSection
          key={service.id}
          reversed={index % 2 !== 0}
          {...service}
        />
      ))}

      {/* CTA */}
      <CtaBand
        title={"Un projet en tête ?\nParlons-en."}
        subtitle="Devis gratuit · Sans engagement · Réponse sous 24h"
        ctaLabel="Prendre contact →"
        ctaHref="/contact"
      />
    </>
  )
}
