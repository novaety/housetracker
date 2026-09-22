const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 📁 CHEMINS
// ============================================================

const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, "data", "houses.json");

// ============================================================
// ⚙️ MIDDLEWARES
// ============================================================

// Permet de recevoir du JSON depuis le navigateur
app.use(express.json());

// Permet de servir les fichiers statiques
// css/, scripts/, html/, etc.
app.use(express.static(ROOT_DIR));


// ============================================================
// 🏠 PAGE PRINCIPALE
// ============================================================

app.get("/houses", (req, res) => {
    res.sendFile(path.join(ROOT_DIR, "html", "houses.html"));
});


// ============================================================
// 📖 LECTURE DU FICHIER JSON
// ============================================================

function readHouses() {
    try {
        const file = fs.readFileSync(DATA_FILE, "utf8");

        return JSON.parse(file);

    } catch (error) {

        console.error("❌ Erreur lors de la lecture de houses.json :");
        console.error(error);

        return null;
    }
}


// ============================================================
// 💾 ÉCRITURE DU FICHIER JSON
// ============================================================

function saveHouses(houses) {
    try {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(houses, null, 2),
            "utf8"
        );

        return true;

    } catch (error) {

        console.error("❌ Erreur lors de la sauvegarde de houses.json :");
        console.error(error);

        return false;
    }
}


// ============================================================
// 📋 GET /api/houses
// Retourne toutes les maisons
// ============================================================

app.get("/api/houses", (req, res) => {

    const houses = readHouses();

    if (!houses) {
        return res.status(500).json({
            success: false,
            error: "Impossible de lire houses.json"
        });
    }

    res.json(houses);
});


// ============================================================
// 🏠 GET /api/houses/:id
// Retourne une maison précise
// ============================================================

app.get("/api/houses/:id", (req, res) => {

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: "ID invalide"
        });
    }

    const houses = readHouses();

    if (!houses) {
        return res.status(500).json({
            success: false,
            error: "Impossible de lire houses.json"
        });
    }

    const house = houses.find(
        h => Number(h.id) === id
    );

    if (!house) {
        return res.status(404).json({
            success: false,
            error: "Maison introuvable"
        });
    }

    res.json(house);
});


// ============================================================
// ✏️ PUT /api/houses/:id
// Modifie les propriétaires d'une maison
// ============================================================

app.put("/api/houses/:id", (req, res) => {

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: "ID invalide"
        });
    }

    const houses = readHouses();

    if (!houses) {
        return res.status(500).json({
            success: false,
            error: "Impossible de lire houses.json"
        });
    }

    const house = houses.find(
        h => Number(h.id) === id
    );

    if (!house) {
        return res.status(404).json({
            success: false,
            error: "Maison introuvable"
        });
    }


    // --------------------------------------------------------
    // Récupération des données envoyées
    // --------------------------------------------------------

    const {
        proprietaire_1,
        proprietaire_2
    } = req.body;


    // --------------------------------------------------------
    // Propriétaire 1
    // --------------------------------------------------------

    if (proprietaire_1 !== undefined) {

        house.proprietaire_1 =
            proprietaire_1 === ""
                ? null
                : proprietaire_1;
    }


    // --------------------------------------------------------
    // Propriétaire 2
    // --------------------------------------------------------

    if (proprietaire_2 !== undefined) {

        house.proprietaire_2 =
            proprietaire_2 === ""
                ? null
                : proprietaire_2;
    }


    // --------------------------------------------------------
    // Sauvegarde
    // --------------------------------------------------------

    const saved = saveHouses(houses);

    if (!saved) {

        return res.status(500).json({
            success: false,
            error: "Impossible de sauvegarder houses.json"
        });
    }


    // --------------------------------------------------------
    // Réponse
    // --------------------------------------------------------

    res.json({
        success: true,
        message: "Maison mise à jour",
        house: house
    });
});


// ============================================================
// ✏️ PUT /api/houses
// Modifie plusieurs maisons en une seule fois
// ============================================================

app.put("/api/houses", (req, res) => {

    const updates = req.body;


    // --------------------------------------------------------
    // Vérification
    // --------------------------------------------------------

    if (!Array.isArray(updates)) {

        return res.status(400).json({
            success: false,
            error: "Le corps de la requête doit être un tableau"
        });
    }


    const houses = readHouses();

    if (!houses) {

        return res.status(500).json({
            success: false,
            error: "Impossible de lire houses.json"
        });
    }


    // --------------------------------------------------------
    // Application des modifications
    // --------------------------------------------------------

    for (const update of updates) {

        const id = Number(update.id);

        if (Number.isNaN(id)) {
            continue;
        }


        const house = houses.find(
            h => Number(h.id) === id
        );

        if (!house) {
            continue;
        }


        // Propriétaire 1

        if (update.proprietaire_1 !== undefined) {

            house.proprietaire_1 =
                update.proprietaire_1 === ""
                    ? null
                    : update.proprietaire_1;
        }


        // Propriétaire 2

        if (update.proprietaire_2 !== undefined) {

            house.proprietaire_2 =
                update.proprietaire_2 === ""
                    ? null
                    : update.proprietaire_2;
        }
    }


    // --------------------------------------------------------
    // Sauvegarde globale
    // --------------------------------------------------------

    const saved = saveHouses(houses);

    if (!saved) {

        return res.status(500).json({
            success: false,
            error: "Impossible de sauvegarder houses.json"
        });
    }


    res.json({
        success: true,
        message: "Maisons mises à jour"
    });
});


// ============================================================
// 🚀 DÉMARRAGE DU SERVEUR
// ============================================================

app.listen(PORT, () => {

    console.log("");
    console.log("==========================================");
    console.log("🏠 HOUSE TRACKER");
    console.log("==========================================");
    console.log("");
    console.log(`🌐 Site : http://localhost:${PORT}`);
    console.log(`📁 JSON : ${DATA_FILE}`);
    console.log("");
    console.log("Serveur démarré avec succès !");
    console.log("");
});
