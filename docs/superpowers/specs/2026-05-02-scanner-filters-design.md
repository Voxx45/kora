# Scanner IA — Recherche, filtres et tri

**Date:** 2026-05-02  
**Scope:** `components/admin/ScannerResults.tsx`, `app/api/scanner/results/route.ts`

---

## Objectif

Ajouter une barre de recherche, des filtres et le tri par colonne à la page Scanner IA, avec des requêtes serveur-side pour couvrir la totalité des résultats (8 500+).

---

## Architecture

### Stratégie : local state + debounced API calls (Option A)

L'état des filtres vit dans `ScannerResults` (React state). Chaque changement déclenche un appel à `/api/scanner/results` avec les paramètres appropriés, après un debounce de 300 ms pour la recherche textuelle. Pas de navigation, pas de rechargement de page.

---

## 1. API — `/api/scanner/results`

**Fichier :** `app/api/scanner/results/route.ts`

Le handler GET existant est étendu pour accepter les query params suivants :

| Paramètre | Type | Valeur par défaut | Description |
|---|---|---|---|
| `q` | string | — | Recherche `ilike` sur `name` et `city` |
| `type` | string | — | Filtre exact sur `place_type` |
| `score_min` | number | — | Score ≥ valeur |
| `score_max` | number | — | Score ≤ valeur |
| `has_website` | `"true"` \| `"false"` | — | Filtre sur `has_website` |
| `promoted` | `"true"` \| `"false"` | — | Filtre sur `promoted` |
| `sort` | `"score"` \| `"name"` \| `"city"` | `"score"` | Colonne de tri |
| `order` | `"asc"` \| `"desc"` | `"desc"` | Sens du tri |
| `offset` | number | `0` | Pagination |
| `limit` | number | `50` | Taille de page (max 100) |

La réponse devient un objet `{ results: ScanResult[], total: number }` au lieu d'un tableau nu, pour permettre l'affichage du total.

---

## 2. Toolbar de filtres

**Fichier :** `components/admin/ScannerResultsToolbar.tsx` (nouveau composant)

Barre pleine largeur au-dessus du tableau, fond légèrement distinct (`rgba(255,255,255,0.02)`), padding `12px 16px`, flex row, gap 8px.

**Éléments de gauche à droite :**

1. **Champ recherche** — icône loupe, placeholder "Rechercher…", debounce 300 ms, largeur 220px
2. **Dropdown Secteur** — liste des `PLACE_TYPES` + option "Tous les secteurs", single-select
3. **Dropdown Score** — options :
   - Tous les scores
   - Fort potentiel (≥ 60)
   - Potentiel moyen (40–59)
   - Faible (< 40)
4. **Dropdown Site web** — Tous / Sans site (`has_website=false`) / Avec site (`has_website=true`)
5. **Toggle "Non promus seulement"** — filtre `promoted=false`, affiché comme chip actif/inactif

**À droite (margin-left: auto) :**
- Compteur live : `X résultats` (nombre total retourné par l'API)
- Bouton "Tout effacer" — visible uniquement si au moins un filtre est actif, reset tout à l'état initial

---

## 3. Tableau — en-têtes cliquables

Les colonnes **Entreprise**, **Ville** et **Score** deviennent triables. Click sur un header :
- Si la colonne n'est pas active → sort asc
- Si déjà active asc → passe à desc
- Si déjà active desc → retire le tri (retour à défaut : score desc)

Indicateurs visuels :
- Colonne inactive : aucun indicateur
- Colonne active asc : `↑` en blanc/0.6
- Colonne active desc : `↓` en blanc/0.6

---

## 4. Pagination

Barre sous le tableau, centrée.

```
← Précédent   Page 3 sur 42   Suivant →
```

- 50 résultats par page
- Boutons désactivés en bord de plage
- Le changement de page scroll le conteneur en haut

---

## 5. Gestion de l'état dans `ScannerResults`

```ts
interface FilterState {
  q: string
  type: string        // '' = tous
  scorePreset: '' | 'high' | 'medium' | 'low'  // high→score_min=60 / medium→score_min=40,score_max=59 / low→score_max=39
  hasWebsite: '' | 'true' | 'false'
  promotedOnly: boolean
  sort: 'score' | 'name' | 'city'
  order: 'asc' | 'desc'
  page: number        // 0-indexed
}
```

- `useEffect` sur `FilterState` (sauf `q`) → appel API immédiat, reset page à 0
- `useEffect` sur `q` → debounce 300 ms, reset page à 0
- `refreshKey` (signal de scan en cours) → re-fetch avec les filtres courants

---

## 6. Compatibilité avec le Drawer

Le clic sur le nom d'une entreprise continue d'ouvrir le `ProspectDrawer` via `useDrawer()`. Aucun changement à ce comportement.

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `app/api/scanner/results/route.ts` | Modifier — ajout des query params + réponse `{ results, total }` |
| `components/admin/ScannerResults.tsx` | Modifier — ajout toolbar, pagination, tri, nouvel appel API |
| `components/admin/ScannerResultsToolbar.tsx` | Créer |

---

## Hors scope

- Export CSV des résultats filtrés
- Filtres sauvegardés / presets
- Recherche full-text avancée (Supabase FTS)
