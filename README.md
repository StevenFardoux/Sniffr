<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://github.com/JuniaXP-JS/Groupe3-Erwan-Steven/blob/main/github/asset/sniffr.png?raw=true"
    />
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://github.com/JuniaXP-JS/Groupe3-Erwan-Steven/blob/main/github/asset/sniffr-black.png?raw=true"
    />
    <img
      alt="Logo SniffR"
      src="https://github.com/JuniaXP-JS/Groupe3-Erwan-Steven/blob/main/github/asset/sniffr-black.png?raw=true"
      width="180"
      height="180"
    />
  </picture>
  <h1 align="center">SniffR</h1>
  <p align="center">
    Connecter les animaux à leur liberté sans jamais rompre le lien.<br />
    <br />
    <br />
  </p>
  
  <!-- SUIVI DU PROJET -->
  <h3 align="center">Suivi du projet</h3>
  <p align="center">
    📋 <a href="https://erwanm.atlassian.net/jira/software/projects/IOT/summary" target="_blank">Tableau Jira du projet</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table des matières</summary>
  <ol>
    <li>
      <a href="#a-propos-du-projet">À propos du projet</a>
      <ul>
        <li><a href="#technologies-utilisees">Technologies utilisées</a></li>
      </ul>
    </li>
    <li>
      <a href="#demarrage">Démarrage</a>
      <ul>
        <li><a href="#prerequis">Pré-requis</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#build">Build</a></li>
      </ul>
    </li>
    <li><a href="#utilisation">Utilisation</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contribuer">Contribuer</a></li>
    <li><a href="#licence">Licence</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#remerciements">Remerciements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## À propos du projet

Ce projet est développé par une start-up spécialisée dans le tracking GPS d'animaux de compagnie. Grâce à notre système innovant, un module IoT est intégré directement dans un collier pour animaux, permettant de :
- **Localiser** en temps réel les animaux de compagnie via GPS.
- **Collecter** des données de localisation, d'activité et d'état de la batterie.
- **Transmettre** ces données à un serveur central.
- **Visualiser** et gérer les animaux, leurs groupes et leurs historiques de déplacements via un dashboard web moderne.

Notre solution vise à offrir aux propriétaires une tranquillité d'esprit et un suivi précis de leurs compagnons, tout en facilitant la gestion d'un parc d'appareils connectés pour les professionnels (refuges, vétérinaires, etc) et particuliers.

Le système permet de suivre l'état des appareils, leur localisation, leur batterie, et d'administrer les groupes d'appareils via une interface web intuitive.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

### Technologies utilisées

- **IoT :** ESP32 C3 (Arduino via PlatformIO), JSON, CBOR
- **Serveur :** Node.js, TypeScript, Express, WebSocket, CBOR, MongoDB, Mongoose
- **Web :** React, TypeScript, ApexCharts, Mapbox GL, Axios, WebSocket

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>



<!-- GETTING STARTED -->
## Démarrage

### Pré-requis

Pour faire fonctionner ce projet, il est nécessaire d'installer les outils et dépendances suivants selon la partie concernée :

#### Serveur (server/)
- **Node.js** (version 20.16.0 recommandée)
- **npm** (installé avec Node.js)
- **MongoDB** (doit être installé et lancé en local ou accessible via un service cloud)
- **TypeScript** (compilé ou exécuté via ts-node/tsx)

#### Web / Dashboard (dashboard/)
- **Node.js** (version 20.16.0 recommandée)
- **npm**

#### IoT / ESP32 (esp32/)
- **Python** (Version 3.12 recommandée)
- **Pip** 
- **PlatformIO** (extension VSCode ou en ligne de commande)
- **Carte supportée** : adafruit_qtpy_esp32c3 (configurée dans `platformio.ini`)
- **Câble USB** pour flasher l'ESP32

> **Résumé global :**
> - Node.js et npm installés 
> - MongoDB opérationnel (local ou distant)
> - Python
> - Pip
> - PlatformIO pour la partie ESP32

### Installation

#### 1. Cloner le dépôt
```sh
git clone https://github.com/JuniaXP-JS/Groupe3-Erwan-Steven.git
cd Groupe3-Erwan-Steven
```

#### 2. Installation du serveur
```sh
cd server
npm i
```
Configurer l'accès à MongoDB si besoin.

Pour charger un jeu d'essai dans la base de données (groupes, utilisateurs, appareils, données), exécutez :
```sh
npm run dataset
```

Pour lancer le serveur 
```sh
npm run start
```

#### 3. Installation du dashboard web
```sh
cd ../dashboard
npm i
```
Pour lancer le dashboard :
```sh
npm run start
```

#### 4. Installation et flash de l'ESP32
- Ouvrez le dossier `esp32/` avec VSCode et l'extension PlatformIO.
- Branchez l'ESP32 en USB.
- Compilez et téléversez le firmware via PlatformIO.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

### Build

#### 1. Créer et exécuter le build du serveur, exécutez :
```sh
npm run dataset # (optionnel, pour charger un jeu d'essai)
npm run build 
cd dist
node index.js
```

#### 2. Créer et exécuter le build du dashboard, exécutez :
```sh
npm run build
npm install -g serve
serve -s build
```

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

<!-- LICENSE -->
## Licence

Distribué sous licence ISC.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
