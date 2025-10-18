# Documentation Technique du Serveur TCP

---

## Sommaire
1. [Introduction](#introduction)
2. [Architecture](#architecture)
   - [Composants](#composants)
   - [Ports utilisés](#ports-utilisés)
   - [Dépendances](#dépendances)
3. [Format CBOR](#format-cbor)
   - [Avantages de CBOR](#avantages-de-cbor)
4. [Types de données](#types-de-données)
   - [Données GNSS](#1-données-gnss)
   - [Données Capteurs](#2-données-capteurs)
   - [Données IoT](#3-données-iot)
5. [Communication avec l'IoT](#communication-avec-liot)
   - [Fréquence et File d'attente](#fréquence-et-file-dattente)
   - [Envoi Multiple de Données](#envoi-multiple-de-données)
   - [Gestion de la File d'attente](#gestion-de-la-file-dattente)
6. [Fonctionnement Général](#fonctionnement-général)
   - [Diagramme de flux](#diagramme-de-flux)
7. [Exemples de code](#exemples-de-code)
   - [Connexion au serveur TCP](#connexion-au-serveur-tcp)
   - [Gestion des événements](#gestion-des-événements-côté-serveur)
   - [Exemple avec la classe TCPClient](#exemple-avec-la-classe-tcpclient)
8. [Sécurité](#sécurité)

---

## Introduction

Ce serveur TCP est conçu pour gérer les communications entre différents clients IoT, capteurs et systèmes GNSS. Il utilise le format CBOR pour la sérialisation des données et implémente un système de gestion des connexions clients robuste.

---

## Architecture

Le serveur TCP est implémenté en TypeScript et utilise les composants suivants :

- **TCPServer** : Classe principale gérant les connexions TCP
- **TCPClient** : Gestion des clients individuels

### Ports utilisés
- TCP Server : 4567

### Dépendances principales
* [![Node.js][Node.js]][Node.js-url] Module Node.js pour la gestion des connexions TCP
* [![CBOR][CBOR]][CBOR-url] Pour l'encodage et le décodage des données au format CBOR  
* [![Crypto][Crypto]][Crypto-url] Pour la génération des UUID des clients

---

## Format CBOR

CBOR (Concise Binary Object Representation) est un format de sérialisation binaire optimisé pour les appareils IoT. Il est plus compact que JSON et plus efficace pour la transmission de données.

### Avantages de CBOR
- Format binaire compact
- Support natif des nombres binaires
- Meilleure performance que JSON
- Idéal pour les communications IoT

---

## Types de données

Le serveur accepte plusieurs types principaux de données, tous envoyés sous la forme d'un objet avec les champs suivants :

- `t` : Type de la donnée (`"GNSS"`, `"BATTERY"`, `"Sensor"`)
- `d` : Données associées (payload)

### 1. Données GNSS
```typescript
{
    t: "GNSS",
    d: {
        la: number,   // Latitude en degrés
        lo: number,   // Longitude en degrés
        t: number     // Timestamp (Unix)
    }
}
```

### 2. Données Batterie
```typescript
{
    t: "BATTERY",
    d: {
        b: number   // Niveau de batterie (en %)
    }
}
```

### 3. Données Capteur (Sensor)
```typescript
{
    t: "Sensor",
    d: any   // Valeur brute du capteur (type variable selon le capteur)
}
```

---

## Communication avec l'IoT

### Fréquence et File d'attente
- Les appareils IoT envoient leurs données toutes les 5 minutes
- Les données sont mises en file d'attente
- La file d'attente permet d'envoyer plusieurs données en une seule fois

### Envoi Multiple de Données
Les appareils IoT peuvent envoyer plusieurs types de données dans un même message :

```typescript
// Exemple d'envoi de données multiples
const data = [
    {
        t: "GNSS",
        d: {
            la: 48.8566,
            lo: 2.3522,
            t: 1234567890
        }
    },
    {
        t: "GNSS",
        d: {
            la: 48.8567,
            lo: 2.3523,
            t: 1234567895
        }
    },
    {
        t: "BATTERY",
        d: {
            b: 45
        }
    }
];
```

### Gestion de la File d'attente
1. **Collecte des données**
   - Les données sont collectées toutes les 30 secondes
   - Les données sont stocker dans une queue list

2. **Traitement côté serveur**
   - Le serveur reçoit les données groupées
   - Décodage CBOR et validation

---

## Fonctionnement Général

Le système fonctionne selon le flux suivant :

1. **Collecte des données**
   - Les appareils IoT collectent des données via leurs capteurs
   - Les données sont formatées selon le protocole CBOR
   - Les appareils se connectent au serveur TCP via une connexion 4G

2. **Transmission**
   - Les données sont envoyées au serveur TCP sur le port 4567
   - Chaque appareil reçoit un identifiant unique (UUID)

3. **Traitement**
   - Le serveur TCP reçoit les données au format CBOR
   - Les données sont décodées et validées
   - Le type de données est identifié (GNSS, SENSOR, IOT)

4. **Stockage**
   - Les données sont stockées dans la base de données MongoDB

### Diagramme de flux
```
[Appareil IoT] → [4G] → [Serveur TCP] → [Décodage CBOR] → [MongoDB]
     │              │          │              │             |
     |              |          |              |             └── Stockage
     │              │          │              └── Traitement
     │              │          └── Traitement
     │              └── Transmission
     └── Collecte des données
```

---

## Exemples de code

### Connexion au serveur TCP
```typescript
import { createConnection } from 'net';
import { encode } from './cbor';

const client = createConnection({ port: 4567 }, () => {
    console.log('Connecté au serveur');
});

// Envoi de données GNSS
const gnssData = {
    t: "GNSS",
    d: {
        la: 48.8566,
        lo: 2.3522,
        t: Date.now()
    }
};

client.write(encode(gnssData));
```

### Gestion des événements côté serveur
```typescript
tcpServer.on("data", (client: TCPClient, data: Buffer) => {
    const decodedData = decode(data);

    switch (decodedData.t) {
        case "GNSS":
            // Traitement des données GNSS
            // Accès : decodedData.d.la, decodedData.d.lo, decodedData.d.t
            break;
        case "Sensor":
            // Traitement des données capteurs
            break;
        case "BATTERY":
            // Traitement des données batterie
            break;
    }
});
```

### Exemple avec la classe TCPClient
```typescript
import TCPClient from "./src/classes/TCPClient";
import { encode } from "./cbor";

/**
 * Initialisation du client TCP
 */
const client = new TCPClient();

/**
 * Connexion au serveur TCP
 */
client.on("connect", () => {
    console.log("Connecté au serveur");

    // Préparation des données GNSS
    const gnssData = {
        t: "GNSS",
        d: {
            la: 48.8566,
            lo: 2.3522,
            t: Date.now()
        }
    };

    // Envoi des données GNSS encodées en CBOR
    client.write(encode(gnssData));
});

/**
 * Connexion au serveur (adapter le port et l'hôte selon besoin)
 */
client.connect({
    port: 4567,
    host: "localhost", // ou l'adresse de ton serveur
});
```

---

## Sécurité

- Les connexions sont gérées de manière sécurisée avec des identifiants uniques (UUID)
- Gestion des déconnexions et des erreurs
- Validation des données reçues

[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node.js-url]: https://nodejs.org
[CBOR]: https://img.shields.io/badge/CBOR-000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==
[CBOR-url]: https://cbor.io
[Crypto]: https://img.shields.io/badge/Crypto-000000?style=for-the-badge&logo=crypto&logoColor=white
[Crypto-url]: https://nodejs.org/api/crypto.html
