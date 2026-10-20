# ♞ Chess Arena

Plateforme d'échecs locale pour deux joueurs sur le même appareil.
Interface professionnelle inspirée de Chess.com, entièrement hors-ligne.

## Fonctionnalités

- **Toutes les règles officielles** via chess.js : roque, prise en passant, promotion, répétition, règle des 50 coups, matériel insuffisant
- **Chronomètres robustes** avec incréments, résistants aux mises en arrière-plan
- **Navigation dans l'historique** en mode analyse sans interrompre la partie
- **Thèmes d'échiquier** : 5 thèmes de plateau disponibles
- **Sauvegarde automatique** en localStorage (parties en cours + historique)
- **Thème clair/sombre** persistant entre les sessions
- **Responsive** : ordinateur, tablette, mobile

## Installation

### Prérequis

- Node.js ≥ 18
- npm ≥ 9

### Démarrage

```bash
cd chess-arena
npm install
npm run dev
```

Ouvre ensuite [http://localhost:5173](http://localhost:5173) dans ton navigateur.

### Build de production

```bash
npm run build
npm run preview
```

## Stack technique

| Outil | Rôle |
|-------|------|
| React 19 | Interface utilisateur |
| TypeScript | Typage statique |
| Vite 6 | Build & dev server |
| Tailwind CSS 3 | Styles utilitaires |
| chess.js | Moteur de règles |
| react-chessboard 5 | Composant échiquier SVG |
| Zustand 5 | État global |
| localStorage | Sauvegarde locale |

## Structure

```
src/
├── components/
│   ├── board/        # Échiquier, promotion
│   ├── game/         # Panneaux joueurs, chronomètres, historique, contrôles
│   ├── layout/       # Sidebar
│   └── ui/           # Boutons, modals, dialogs
├── screens/          # Accueil, Configuration, Partie, Historique, Paramètres
├── store/            # État global Zustand
├── hooks/            # useTimer
├── types/            # Types TypeScript
└── utils/            # Utilitaires (temps, stockage, notation)
```

## Contrôles de temps disponibles

- Sans limite
- 1 min · 3 min · 3+2 · 5 min · 5+3 · 10 min · 15+10 · 30 min

## Raccourcis clavier (dans la partie)

- Clic sur une pièce → sélection
- Clic sur une case légale → déplacement
- Glisser-déposer → déplacement
- Navigation historique → boutons ⏮ ◀ ▶ ⏭
