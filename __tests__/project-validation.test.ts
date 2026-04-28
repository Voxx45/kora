import { validateProjectForm } from '@/lib/actions/project-validation'

describe('validateProjectForm', () => {
  const ok = { client_nom: 'Dupont SA', service: 'Site vitrine', statut: 'en_cours' }
  it('accepte un payload valide', () => expect(validateProjectForm(ok)).toBe(true))
  it('accepte statut livre', () => expect(validateProjectForm({ ...ok, statut: 'livre' })).toBe(true))
  it('accepte statut facture', () => expect(validateProjectForm({ ...ok, statut: 'facture' })).toBe(true))
  it('rejette client_nom vide', () => expect(validateProjectForm({ ...ok, client_nom: '' })).toBe(false))
  it('rejette service vide', () => expect(validateProjectForm({ ...ok, service: '' })).toBe(false))
  it('rejette statut inconnu', () => expect(validateProjectForm({ ...ok, statut: 'unknown' })).toBe(false))
  it('rejette null', () => expect(validateProjectForm(null)).toBe(false))
})
