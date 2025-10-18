# Dashboard IoT

Ce projet est un tableau de bord pour la gestion et la surveillance des appareils IoT. Il est développé avec React et Ionic.

## Fonctionnalités

- Authentification des utilisateurs
- Visualisation des appareils IoT sur une carte
- Gestion des groupes d'appareils
- Surveillance en temps réel des données des capteurs
- Graphiques de visualisation des données
- Système d'alertes

## Prérequis

- Node.js (version 20.16.0 ou supérieure)
- npm (gestionnaire de paquets Node.js)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/JuniaXP-JS/Groupe3-Erwan-Steven.git
cd dashboard
```

2. Installez les dépendances :
```bash
npm i
```

## Démarrage

Pour lancer l'application en mode développement :
```bash
npm start
```
L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)

## Tests

Pour lancer les tests :
```bash
npm test
```

## Production

Pour créer une version de production :
```bash
npm run build
```

## Structure du Projet

- `/src/components` : Composants React réutilisables
- `/src/contexts` : Contextes React pour la gestion d'état
- `/src/routes` : Pages principales de l'application
- `/src/interfaces` : Types TypeScript
- `/src/styles` : Fichiers SCSS
- `/src/tests` : Tests unitaires

## Technologies Utilisées

- React
- TypeScript
- SCSS
- WebSocket pour les communications en temps réel
- Testing Library React et Jest pour les tests unitaires

## Équipe

Groupe 3 - MAYOLLE Erwan FARDOUX Steven
