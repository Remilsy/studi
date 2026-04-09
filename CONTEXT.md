# Studi — Plateforme de suivi insertion professionnelle

## C'est quoi
Application web de suivi de l'insertion professionnelle des étudiants, créée pour SUP-PHOTO (école de photographie, ~50 étudiants, Bac+1 à Bac+5).

## Deux types d'utilisateurs
- **Admin (responsable école)** : supervise tous les étudiants, valide les documents, gère les entreprises et les offres, envoie des relances
- **Étudiant** : dépose ses documents (CV, portfolio), renseigne ses candidatures, suit sa progression

## Deux types de recherche
- **Stage** : uniquement pour les Bac+1 et Bac+2 en formation initiale
- **Alternance** : pour tous les niveaux Bac+1 à Bac+5

## Stack technique
- Next.js 16 (App Router)
- Tailwind CSS
- JavaScript (pas TypeScript)
- Supabase (base de données — pas encore installé)

## Design
- Inspiré Apple : épuré, espacé, typographie claire
- Gamifié : barres de progression, badges, streaks
- Couleurs : blanc dominant, accents noirs et une couleur principale à définir

## Pages prévues (Phase 1)
### Côté Admin
1. Dashboard — vue d'ensemble de tous les étudiants
2. Fiche étudiant — profil complet, documents, candidatures
3. Gestion documents — valider/commenter CV et portfolios
4. Carnet entreprises — contacts et historique
5. Offres — créer et gérer les opportunités
6. Relances — identifier et contacter les étudiants inactifs

### Côté Étudiant
1. Mon espace — tableau de bord personnel avec progression
2. Mes documents — upload CV et portfolio, voir les commentaires
3. Mes candidatures — renseigner et suivre ses démarches
4. Offres disponibles — voir les offres publiées par l'école
5. Ma progression — badges, streak, niveau de préparation

## Où on en est
- Projet Next.js créé et fonctionnel sur localhost:3000
- Supabase pas encore configuré
- Aucune page créée, page par défaut Next.js active