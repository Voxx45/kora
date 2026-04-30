# Prospect Drawer — Design Spec

**Date:** 2026-04-30
**Projet:** KORA Admin CRM
**Sous-projet:** SP5 — Fiche entreprise universelle (drawer latéral)

---

## Objectif

Ajouter un drawer latéral qui affiche la fiche détaillée d'une entreprise (prospect CRM ou résultat scanner) depuis n'importe quelle page de l'admin — pipeline, dashboard, liste prospects, page scanner. Le drawer permet l'édition inline du pipeline stage et des notes, sans quitter la vue courante.

---

## Architecture

### Approche : React Context global

Un `DrawerContext` installé dans `app/(admin)/layout.tsx` expose deux fonctions : `openDrawer(item)` et `closeDrawer()`. Le type `DrawerItem` est un union discriminé :

```typescript
type DrawerItem =
  | { type: 'prospect'; data: Prospect }
  | { type: 'scan_result'; data: ScanResult }
```

Le drawer (`ProspectDrawer`) est rendu une seule fois dans le layout — aucun prop drilling requis. N'importe quel composant enfant appelle `useDrawer().openDrawer(item)` pour l'ouvrir.

### Fichiers créés

| Fichier | Rôle |
|---------|------|
| `lib/contexts/drawer-context.tsx` | Context, Provider, hook `useDrawer()` |
| `components/admin/ProspectDrawer.tsx` | Drawer complet (client component) |

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `app/(admin)/layout.tsx` | Wrap dans `<DrawerProvider>`, ajout de `<ProspectDrawer />` |
| `lib/actions/prospects.ts` | Ajout de `updateProspectNotes(id, notes)` |
| `components/admin/ProspectCard.tsx` | Clic → `openDrawer({ type: 'prospect', data })` |
| `components/admin/ScannerResults.tsx` | Clic sur nom → `openDrawer({ type: 'scan_result', data })` |
| `app/(admin)/prospects/ProspectsClient.tsx` | Clic sur ligne → `openDrawer({ type: 'prospect', data })` |
| `app/(admin)/dashboard/page.tsx` | DataTable rows cliquables → `openDrawer` |

---

## Modèle de données

Aucune nouvelle table. Le drawer utilise les types existants :
- `Prospect` — défini dans `types/crm.ts`
- `ScanResult` — défini dans `types/scanner.ts`

Nouvelle server action dans `lib/actions/prospects.ts` :

```typescript
export async function updateProspectNotes(id: string, notes: string): Promise<void>
// Simple update: { notes } WHERE id = id
```

---

## Comportement du drawer

### Affichage / fermeture

- Drawer `fixed right-0 top-0 h-full`, largeur **360px**
- Transition CSS `transform: translateX(100%)` → `translateX(0)` (200ms ease-out)
- Overlay semi-transparent (`rgba(0,0,0,0.4)`) sur le reste de la page
- Fermeture : clic sur l'overlay, touche `Escape`, ou bouton ✕ dans le header

### Mode `prospect` (CRM)

**Header**
- Nom de l'entreprise (gros, blanc)
- Prénom du contact (secondaire, grisé)
- Badge score coloré (rouge ≥70, orange ≥50, vert <50)
- Badge pipeline stage
- Badge source (`contact_form`, `manual`, `scanner`)

**Pipeline stage — édition inline**
- Rangée de badges cliquables : Nouveau · Contacté · Devis · Négociation · Gagné · Perdu
- Stage actif surligné en `#007AFF`
- Clic → `updateProspectStage(id, newStage)` (action existante) — mise à jour optimiste immédiate

**Contact**
- Email : lien `mailto:`, affiché en bleu
- Téléphone : lien `tel:`
- Service intéressé
- Valeur estimée (si présente)
- Prochain suivi (si présent)

**Notes internes — édition inline**
- `<textarea>` pré-rempli avec les notes existantes
- Bouton "Enregistrer" → `updateProspectNotes(id, notes)` → toast de confirmation

**Message initial**
- Lecture seule, affiché si non vide

**Footer**
- Bouton "Fiche complète →" → lien `href="/admin/prospects/[id]"`
- Bouton "✏ Modifier" → ouvre `ProspectForm` (modal existant) par-dessus le drawer
- Bouton 🗑 → `window.confirm` → `deleteProspect(id)` → ferme drawer + toast

### Mode `scan_result` (Scanner)

**Header**
- Nom de l'entreprise
- Ville + type (ex. "Lyon · Coiffeur")
- Badge score

**Contact**
- Téléphone (si présent)
- Adresse
- Site web : lien externe `↗` si présent, "Aucun site" en rouge si absent

**Signaux web — grille 2×2**
- HTTPS : ✓ vert / ✗ rouge
- PageSpeed mobile : score coloré (rouge <50, orange 50–79, vert ≥80) — `null` si non disponible
- Note GMB + nombre d'avis
- Âge du site : Récent / Ancien / Inconnu

**Analyse IA**
- Contenu du champ `notes` de `scan_results` (bullet points Groq), lecture seule
- Affiché seulement si non vide

**Footer**
- Si `promoted = false` : bouton "＋ Ajouter au CRM" → `promoteToCRM(id)` → passe à l'état promu (optimiste)
- Si `promoted = true` : badge "✓ Dans le CRM" grisé non cliquable

---

## Intégration par page

### Pipeline (`KanbanBoard` / `ProspectCard`)
- `ProspectCard` : supprimer le `Link` qui navigue vers `/admin/prospects/[id]`
- Remplacer par `onClick={() => openDrawer({ type: 'prospect', data: prospect })}`
- Le drag-and-drop reste inchangé

### Prospects liste (`ProspectsClient`)
- Chaque ligne du `DataTable` devient cliquable → `openDrawer({ type: 'prospect', data })`
- Supprimer la navigation vers la fiche individuelle depuis le tableau (conserver le lien "Fiche complète →" dans le drawer)

### Dashboard
- Les lignes de la table "Derniers prospects" deviennent cliquables → `openDrawer`

### Scanner (`ScannerResults`)
- Nom de l'entreprise dans le tableau devient cliquable → `openDrawer({ type: 'scan_result', data })`
- Le bouton "+ CRM" reste en place (raccourci sans ouvrir le drawer)

---

## Edge Cases

| Situation | Comportement |
|-----------|-------------|
| Ouvrir un 2e drawer sans fermer le 1er | Le drawer se met à jour avec les nouvelles données (pas d'empilement) |
| Prospect supprimé depuis le drawer | Drawer fermé, toast "Prospect supprimé", page non rechargée |
| `promoteToCRM` échoue | Rollback du bouton, toast d'erreur |
| Résultat scanner sans téléphone/site | Champs masqués (pas de ligne vide) |
| Notes vides | Textarea vide, placeholder "Ajouter une note…" |
| `ProspectForm` ouvert depuis le drawer | Modal par-dessus le drawer (z-index supérieur), fermeture du modal laisse le drawer ouvert |

---

## Styles

Même thème sombre que le reste de l'admin :
- Background drawer : `#12141E`
- Border gauche : `1px solid rgba(255,255,255,0.06)`
- Inline styles (pas de classes Tailwind colorées)
- Sections séparées par `border-bottom: 1px solid rgba(255,255,255,0.06)`
- Largeur fixe 360px sur desktop (pas de responsive mobile requis)
