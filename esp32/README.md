# Projet IoT ESP32 – Suivi GNSS et Transmission TCP

## Présentation générale
Ce projet met en œuvre un objet connecté (IoT) basé sur un ESP32 C3, capable de récupérer des données de localisation GNSS, de surveiller l'état de la batterie, et de transmettre ces informations à un serveur distant via une connexion TCP/4G (CAT-M1) grâce au module SIM7080G. L'architecture logicielle repose sur une machine à états finis (FSM) pour garantir la robustesse et la clarté du déroulement des opérations.

---

## Fonctionnement global
1. **Initialisation** :
   - Configuration des broches et des ports série.
   - Initialisation du module SIM7080G et de la FSM principale.

2. **Acquisition des données** :
   - Récupération de l'IMEI du module.
   - Activation du GNSS pour obtenir la position (latitude, longitude, date/heure).
   - Lecture du niveau de batterie.

3. **Mise en file d'attente** :
   - Les données GNSS et batterie sont stockées dans une file d'attente (queue) pour être envoyées ultérieurement.

4. **Transmission** :
   - Connexion au réseau 4G (CAT-M1).
   - Ouverture d'une socket TCP vers le serveur distant.
   - Envoi des données au format CBOR.
   - Fermeture de la connexion.

5. **Bouclage** :
   - Le cycle se répète périodiquement (toutes les minutes pour le GNSS, toutes les heures pour la batterie).

---

## Architecture logicielle – FSM (Finite State Machine)
L'architecture FSM permet de séquencer précisément les différentes étapes du fonctionnement, d'éviter les blocages et de faciliter le débogage.

### États principaux de la FSM :
- `ENTRYPOINT` : Démarrage du système.
- `START` : Initialisation et récupération de l'IMEI.
- `GET_GNSS_DATA` : Acquisition des données GNSS.
- `TURN_OFF_GNSS` : Extinction du module GNSS pour économiser l'énergie.
- `GET_BATTERY_STATUS` : Lecture du niveau de batterie.
- `MODULE_CATM1` : Connexion au réseau 4G (CAT-M1).
- `MODULE_TCP` : Transmission des données via TCP.
- `PAUSED` : Attente entre deux cycles (gestion des délais).
- `STOPPED` / `RESTART` : Arrêt ou redémarrage du système.

Chaque module (GNSS, CATM1, TCP) possède également sa propre FSM interne pour gérer ses sous-états.

---

## Détail des FSM secondaires

### FSM du module GNSS
- **GNSS_OFF** : Le module GNSS est éteint pour économiser l'énergie.
- **GNSS_ON** : Le module GNSS est allumé et prêt à acquérir la position.
- **GNSS_GET_POSITION** : Acquisition des données de localisation (latitude, longitude, date/heure).
- **GNSS_POSITION_FREE / BUSY** : Gestion de la disponibilité pour la lecture des données.

**Rôle :**
La FSM GNSS gère l'allumage, l'acquisition et l'extinction du module de géolocalisation. Elle s'assure que la position n'est lue que lorsque le module est prêt et évite les conflits d'accès.

### FSM du module CATM1 (4G)
- **CATM1_ON** : Activation du module CAT-M1 (connexion 4G).
- **PDP** : Configuration et activation du contexte PDP (connexion de données).
- **CEREG** : Vérification de l'enregistrement sur le réseau cellulaire.
- **IP** : Récupération de l'adresse IP attribuée.
- **CATM1_OFF** : Désactivation du module CAT-M1.

**Rôle :**
La FSM CATM1 orchestre la connexion au réseau 4G, la configuration du contexte de données et la gestion de l'état de la connexion. Elle garantit que la transmission TCP ne démarre que lorsque la connexion est opérationnelle.

### FSM du module TCP
- **TCP_OPEN** : Ouverture de la socket TCP vers le serveur distant.
- **TCP_SEND** : Préparation à l'envoi des données.
- **TCP_SEND_SIZE** : Transmission de la taille des données à envoyer.
- **TCP_SEND_DATA** : Transmission effective des données (format CBOR).
- **TCP_CLOSE** : Fermeture de la socket TCP après l'envoi.

**Rôle :**
La FSM TCP gère toute la séquence d'ouverture, d'envoi et de fermeture de la connexion TCP. Elle s'assure que les données sont envoyées de façon fiable et que la connexion est proprement libérée après chaque transmission.

---

## Structure du code
- `src/main.cpp` : Point d'entrée, boucle principale et gestion de la FSM principale.
- `include/FSM.hpp` : Définition de la structure FSM et des états.
- `include/SIM7080G/` :
  - `Serial.hpp/cpp` : Communication série avec le module SIM7080G.
  - `GNSS.hpp/cpp` : Gestion du positionnement GNSS.
  - `CATM1.hpp/cpp` : Connexion 4G (CAT-M1).
  - `TCP.hpp/cpp` : Transmission des données au serveur distant.
- `include/QueueList.hpp` : File d'attente pour les données à transmettre.

---

## Gestion de la file d'attente – QueueList

La file d'attente (QueueList) est utilisée pour stocker temporairement les données GNSS et batterie avant leur transmission au serveur. Cela permet de garantir qu'aucune donnée n'est perdue, même si la connexion réseau n'est pas immédiatement disponible.

### Fonctionnement :
- À chaque acquisition, les données (position, date/heure, niveau de batterie) sont ajoutées à la file d'attente.
- Lorsqu'une connexion TCP est disponible, les données sont extraites de la file d'attente et envoyées au serveur.
- Si l'envoi échoue, les données restent dans la file pour une tentative ultérieure.

### Avantages :
- Robustesse face aux coupures réseau ou aux erreurs de transmission.
- Découplage entre l'acquisition des données et leur envoi.

### Fichiers concernés :
- `include/QueueList.hpp` : Déclaration et gestion de la file d'attente.
- `src/QueueList.cpp` : Implémentation des méthodes de la file.

---

## Configuration de la connexion TCP
**Important :**
Pour que la transmission fonctionne, il est nécessaire de modifier l'URL et le port du serveur dans le fichier `include/SIM7080G/TCP.hpp` :

```cpp
    /**
     * @brief Url to the TCP server
     */
    const char *URL = "<votre_url_serveur>";

    /**
     * @brief Port to the TCP server
     */
    const int PORT = <votre_port>;
```

Remplacez `<votre_url_serveur>` et `<votre_port>` par les valeurs de votre serveur de réception.

---

## Compilation et téléversement
Le projet utilise PlatformIO. Pour compiler et téléverser le firmware sur l'ESP32 :

1. Installez [PlatformIO](https://platformio.org/) (extension VSCode recommandée).
2. Connectez votre carte ESP32.
3. Dans un terminal à la racine du projet, lancez :
   ```sh
   pio run --target upload
   ```
4. Pour ouvrir le moniteur série :
   ```sh
   pio device monitor
   ```

---

## Dépendances
- ESP32 (ex : Adafruit QT Py ESP32-C3)
- Module SIM7080G
- Librairie [nlohmann-json](https://github.com/nlohmann/json) (gérée automatiquement par PlatformIO)

---

## Remarques
- Le code est conçu pour être facilement extensible grâce à l'architecture FSM.
- Les délais et la fréquence d'acquisition peuvent être ajustés dans `main.cpp`.
- Pour toute modification du serveur, pensez à recompiler et téléverser le firmware.

---

## Auteurs
- Groupe 3 – MAYOLLE Erwan, FARDOUX Steven
