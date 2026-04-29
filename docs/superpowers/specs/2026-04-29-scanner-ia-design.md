# Scanner IA — Design Spec (SP4)

**Date:** 2026-04-29  
**Projet:** KORA Admin CRM  
**Sous-projet:** SP4 — Scanner IA (découverte automatisée de prospects)

---

## Objectif

Construire un scanner automatisé qui parcourt toutes les entreprises françaises via l'API Google Places, les score selon leurs faiblesses web (pas de site, mauvais HTTPS, PageSpeed faible…), stocke tous les résultats dans une table dédiée, et permet à l'utilisateur de promouvoir manuellement les meilleurs dans le CRM.

---

## Architecture

Le système se compose de 4 couches :

1. **Base de données Supabase** — 3 nouvelles tables : `scan_queue`, `scan_results`, `scan_status`
2. **API Routes Next.js** — `/api/scanner/start`, `/api/scanner/stop`, `/api/scanner/tick`, `/api/scanner/manual`
3. **Server Action** — `promoteToCRM(resultId)` copie un résultat vers la table `prospects`
4. **Frontend** — page `/admin/scanner` avec sidebar (contrôles) + tableau de résultats

**Mécanisme de scan :** micro-batches auto-déclenchés. Le client appelle `POST /api/scanner/tick` toutes les 2s via `setInterval`. Chaque tick traite 1 item de queue (1 ville × 1 catégorie Google Places). Le scanner s'arrête automatiquement sur rate limit ou quand la queue est épuisée.

---

## Modèle de données

### `scan_queue`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid PK | |
| city | text | Ex : "Paris 8e", "Lyon", "Bordeaux" |
| place_type | text | Type Google Places : "plumber", "restaurant"… |
| status | text | `pending` \| `running` \| `done` \| `error` |
| error_msg | text | Message si rate limit ou erreur API |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Peuplée une seule fois au premier démarrage si vide : ~500 villes françaises (par population) × ~50 types Google Places = ~25 000 items.

### `scan_results`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid PK | |
| place_id | text UNIQUE | Google place_id — clé de déduplication |
| name | text | Nom de l'entreprise |
| city | text | |
| place_type | text | |
| score | int | 0–100, calculé par `lib/scorer.ts` sans Groq |
| website | text | URL du site (null si absent) |
| phone | text | |
| address | text | |
| gmb_rating | numeric | Note Google Maps |
| gmb_reviews | int | Nombre d'avis |
| has_website | boolean | |
| has_https | boolean | |
| promoted | boolean | `true` si déjà ajouté au CRM |
| promoted_at | timestamptz | |
| scanned_at | timestamptz | |

Contrainte `UNIQUE(place_id)` — `ON CONFLICT DO UPDATE` conserve le meilleur score.

### `scan_status` (singleton, id = 1)

| Colonne | Type | Description |
|---------|------|-------------|
| id | int PK DEFAULT 1 | Singleton |
| is_scanning | boolean | `true` si scan en cours |
| current_city | text | Ville en cours de traitement |
| current_type | text | Type en cours |
| total_scanned | int | Items de queue traités |
| total_results | int | Entreprises stockées |
| last_error | text | Dernière erreur (rate limit, etc.) |
| updated_at | timestamptz | |

### RLS

Même politique que le CRM : `auth.uid() is not null` — accessible uniquement aux utilisateurs authentifiés.

---

## API Routes

### `POST /api/scanner/start`
- Si `scan_queue` est vide : insère toutes les combinaisons ville × type (batch, < 1s)
- Set `scan_status.is_scanning = true`, clear `last_error`
- Retourne `{ ok: true }`

### `POST /api/scanner/stop`
- Set `scan_status.is_scanning = false`
- Retourne `{ ok: true }`

### `POST /api/scanner/tick`
Flux d'exécution :
1. Lire `scan_status` → si `is_scanning = false`, retourner `{ done: true }`
2. Prendre le prochain item `status = 'pending'` ou `'error'` ORDER BY id LIMIT 1
3. Si aucun → queue épuisée, `is_scanning = false`, retourner `{ done: true }`
4. Marquer item `running`
5. Appeler Google Places Text Search (`lib/places.ts`) → jusqu'à 60 résultats (3 pages)
6. Pour chaque résultat :
   - Scraper le site (`lib/scraper.ts`) si `website` présent
   - PageSpeed (`lib/pagespeed.ts`) si site présent
   - Calculer score (`lib/scorer.ts`) — **sans Groq** (Groq réservé à la promotion)
   - `upsert` dans `scan_results` (ON CONFLICT place_id DO UPDATE si score amélioré)
7. Marquer item `done`, incrémenter `total_scanned` / `total_results`
8. Retourner `{ done: false, city, type, newResults: N }`

**Gestion des erreurs :**

| Erreur | Comportement |
|--------|-------------|
| Google Places 429 / quota épuisé | Item `error`, `is_scanning = false`, stocker message |
| Site inaccessible / timeout scraper | Score partiel (sans PageSpeed), continuer |
| Erreur réseau ponctuelle | Retry 1× puis `error` |
| Groq 429 | Ignoré (Groq non appelé au scan) |

### `POST /api/scanner/manual`
- Accepte `{ city: string, place_type: string }`
- Même logique que tick, sans passer par la queue
- Fonctionne même si `is_scanning = false`
- Retourne `{ newResults: N }`

---

## Server Action

### `promoteToCRM(resultId: string)`
1. Charger le `scan_result`
2. Vérifier qu'un prospect avec le même `place_id` n'existe pas déjà dans `prospects`
3. Si doublon : skip silencieux, retourner `{ alreadyExists: true }`
4. Appeler Groq (`lib/claude.ts`) pour enrichir l'analyse avant insertion
5. Insérer dans `prospects` avec `source: 'scanner'`
6. Marquer `scan_results.promoted = true`, `promoted_at = now()`
7. Retourner `{ ok: true, prospectId }`

---

## Frontend

### Structure des fichiers

```
app/(admin)/scanner/
  page.tsx                  # Server component — charge scan_status + scan_results
components/admin/
  ScannerSidebar.tsx        # Client — statut, contrôles, KPIs, scan manuel
  ScannerResults.tsx        # Client — tableau des résultats + bouton + CRM
types/
  scanner.ts                # ScanQueueItem, ScanResult, ScanStatus, ScanTickResponse
lib/actions/
  scanner.ts                # promoteToCRM server action
```

### `page.tsx` (Server Component)
- Charge `scan_status` + `scan_results ORDER BY score DESC LIMIT 50`
- Passe en props à `ScannerSidebar` et `ScannerResults`
- Layout B : `<div class="flex">` avec sidebar fixe à gauche + résultats à droite

### `ScannerSidebar` (Client Component)
- Point vert animé (`animate-pulse`) + label : `En cours` / `Arrêté` / `Erreur rate limit`
- Bouton **Démarrer** → `POST /api/scanner/start` → démarre `setInterval(tick, 2000)`
- Bouton **Stop** (rouge) → `POST /api/scanner/stop` → arrête l'interval
- KPIs : total scannés, total résultats, ville en cours
- Section **Scan manuel** : input ville + input type + bouton Lancer
- `useEffect` cleanup : clearInterval au démontage

### `ScannerResults` (Client Component)
- Tableau : Entreprise / Ville / Type / Site (lien externe) / Score / Action
- Score via `ScoreBadge` existant
- Bouton `+ CRM` par ligne → `promoteToCRM(id)` → optimistic `promoted = true` → bouton ✓ grisé
- Tri par score desc, 50 résultats par page
- Callback `onTickComplete` : re-fetch résultats après chaque tick réussi

---

## Edge Cases

| Situation | Comportement |
|-----------|-------------|
| Doublon place_id | `ON CONFLICT DO UPDATE` — meilleur score conservé |
| Reprise après stop | Reprend au premier item `pending` ou `error` |
| Queue épuisée | `is_scanning = false` automatiquement |
| 0 résultats pour une combinaison | Item marqué `done` sans erreur |
| Promotion d'un doublon CRM | Skip silencieux, bouton grisé |
| Scan manuel pendant scan auto | Fonctionne indépendamment |

---

## Volume estimé

- ~500 villes × ~50 types = ~25 000 items de queue
- ~2s par tick (Places API + scraper + PageSpeed)
- ~14h de scan continu pour couvrir toute la France
- En pratique : sessions de quelques heures, reprises multiples

---

## Dépendances réutilisées

- `lib/places.ts` — Google Places Text Search (existant dans `demarchage`)
- `lib/scorer.ts` — algorithme de scoring (existant)
- `lib/scraper.ts` — scraper de site (existant)
- `lib/pagespeed.ts` — PageSpeed API (existant)
- `lib/claude.ts` — analyse Groq (existant, appelé uniquement à la promotion)
- `components/admin/ScoreBadge.tsx` — badge score coloré (existant)
- `lib/supabase-browser.ts` / `lib/supabase-server.ts` — clients Supabase (existants)
