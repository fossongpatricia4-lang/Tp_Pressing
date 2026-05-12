# Pressing Pro — Gestion de Blanchisserie

Application de gestion de pressing construite avec **React + TypeScript + Vite + IndexedDB**.
CSS vanilla (pas de framework CSS — conforme aux exigences du devoir).

---

## 🚀 Lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en mode développement
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:5173
```

---

## 📁 Structure du projet

```
pressing-pro/
├── src/
│   ├── types/
│   │   └── index.ts          ← Tous les types TypeScript
│   ├── db/
│   │   └── indexedDB.ts      ← Toutes les opérations IndexedDB
│   ├── hooks/
│   │   └── useOrders.ts      ← Hook React + helpers (washStatus, fmtMoney, etc.)
│   ├── components/
│   │   ├── ClientView.tsx    ← Vue client (sans info financière du gérant)
│   │   ├── OwnerView.tsx     ← Vue gérant (tableau de bord complet)
│   │   ├── PinModal.tsx      ← Verrouillage PIN 4 chiffres
│   │   ├── AddOrderModal.tsx ← Formulaire nouvelle commande multi-articles
│   │   ├── PaymentModal.tsx  ← Encaissement (Espèces / Mobile Money / Carte)
│   │   ├── ReceiptModal.tsx  ← Reçu imprimable
│   │   └── PricingModal.tsx  ← Configuration des tarifs + PIN
│   ├── App.tsx               ← Composant racine, gestion des modes
│   ├── main.tsx              ← Point d'entrée React
│   └── index.css             ← Tous les styles (CSS variables, dark mode)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## ✅ Fonctionnalités

### Mode Client (par défaut, accessible à tous)
- Rechercher sa commande par nom
- Voir les articles de sa commande et leur statut de lavage
- **⚠ Incomplet** affiché clairement si certains articles ne sont pas encore lavés
- Voir **uniquement** son propre montant à payer, ce qu'il a déjà payé, et le reste dû
- ❌ Aucune info financière du gérant visible (pas de total du jour, pas de caisse)
- Générer son reçu personnel

### Mode Gérant (protégé par PIN — défaut: 1234)
- Tableau de bord : encaissé aujourd'hui, total impayé, stats complètes
- Gestion de toutes les commandes
- Marquer les articles comme lavés (un par un ou tous d'un coup)
- Encaisser les paiements (Espèces / Mobile Money / Carte)
- Filtrer : Toutes / Incomplètes / Complètes / Non payées
- Reçu complet avec historique des paiements
- Configurer les tarifs par type et taille
- Changer le PIN

### Détection automatique du statut de lavage
| Statut | Condition |
|--------|-----------|
| ⏳ **En attente** | Aucun article lavé |
| ⚠ **Incomplet** | Certains articles lavés, d'autres non |
| ✅ **Complet** | Tous les articles lavés |

### Données persistantes (IndexedDB)
- Toutes les commandes survivent à l'actualisation de la page
- Les tarifs et le PIN sont sauvegardés en local

---

## 🔒 Sécurité des données
- Le **Mode Client** ne peut JAMAIS voir :
  - Les revenus du jour du gérant
  - Le total encaissé global
  - Les informations financières des autres clients
- Seul le gérant (PIN requis) accède au tableau de bord financier complet

