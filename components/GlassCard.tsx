import { cn } from '@/lib/utils'

interface GlassCardProps {
  /** Titre affiché dans l'overlay */
  title: string
  /** Sous-titre optionnel */
  description?: string
  /** Texte du lien optionnel */
  linkText?: string
  /** URL du lien optionnel */
  href?: string
  /** Classe CSS pour le background (gradient ou image) */
  backgroundClassName?: string
  /** Style inline pour le background (ex: backgroundImage: 'url(...)') */
  backgroundStyle?: React.CSSProperties
  /** Classes supplémentaires sur le container */
  className?: string
  /** Contenu additionnel dans l'overlay */
  children?: React.ReactNode
}

export function GlassCard({
  title,
  description,
  linkText,
  href,
  backgroundClassName,
  backgroundStyle,
  className,
  children,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-[18px] overflow-hidden',
        backgroundClassName,
        className
      )}
      style={backgroundStyle}
    >
      {/* Overlay glassmorphisme */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-3.5"
        style={{
          background: 'rgba(0, 0, 0, 0.28)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.10)',
        }}
      >
        <p className="text-[13px] font-bold text-white mb-0.5">{title}</p>
        {description && (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {description}
          </p>
        )}
        {children}
        {linkText && href && (
          <a
            href={href}
            className="block text-[11px] mt-1.5"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {linkText} →
          </a>
        )}
      </div>
    </div>
  )
}
