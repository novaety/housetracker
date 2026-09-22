require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT_DIR = __dirname;

// ============================================================
// 🗄️ SUPABASE
// ============================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variables Supabase manquantes.");
    console.error("Vérifie ton fichier .env");
    process.exit(1);
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

// ============================================================
// ⚙️ MIDDLEWARES
// ============================================================

app.use(express.json());
app.use(express.static(ROOT_DIR));

// ============================================================
// 🏠 PAGE HOUSES
// ============================================================

app.get("/houses", (req, res) => {
    res.sendFile(
        path.join(ROOT_DIR, "html", "houses.html")
    );
});

// ============================================================
// 📋 GET /api/houses
// Récupère toutes les maisons depuis Supabase
// ============================================================

app.get("/api/houses", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("houses")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("❌ Erreur Supabase :", error);

            return res.status(500).json({
                success: false,
                error: "Impossible de récupérer les maisons"
            });
        }

        res.json(data);

    } catch (error) {
        console.error("❌ Erreur serveur :", error);

        res.status(500).json({
            success: false,
            error: "Erreur serveur"
        });
    }
});

// ============================================================
// 🏠 GET /api/houses/:id
// Récupère une maison précise
// ============================================================

app.get("/api/houses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: "ID invalide"
        });
    }

    try {
        const { data, error } = await supabase
            .from("houses")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("❌ Erreur Supabase :", error);

            return res.status(404).json({
                success: false,
                error: "Maison introuvable"
            });
        }

        res.json(data);

    } catch (error) {
        console.error("❌ Erreur serveur :", error);

        res.status(500).json({
            success: false,
            error: "Erreur serveur"
        });
    }
});

// ============================================================
// ✏️ PUT /api/houses/:id
// Modifie une maison
// ============================================================

app.put("/api/houses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: "ID invalide"
        });
    }

    const updates = {};

    if (req.body.proprietaire_1 !== undefined) {
        updates.proprietaire_1 =
            req.body.proprietaire_1 === ""
                ? null
                : req.body.proprietaire_1;
    }

    if (req.body.proprietaire_2 !== undefined) {
        updates.proprietaire_2 =
            req.body.proprietaire_2 === ""
                ? null
                : req.body.proprietaire_2;
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: "Aucune modification fournie"
        });
    }

    try {
        const { data, error } = await supabase
            .from("houses")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("❌ Erreur Supabase :", error);

            return res.status(500).json({
                success: false,
                error: "Impossible de modifier la maison"
            });
        }

        res.json({
            success: true,
            message: "Maison mise à jour",
            house: data
        });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);

        res.status(500).json({
            success: false,
            error: "Erreur serveur"
        });
    }
});

// ============================================================
// ✏️ PUT /api/houses
// Modifie plusieurs maisons
// ============================================================

app.put("/api/houses", async (req, res) => {
    const updates = req.body;

    if (!Array.isArray(updates)) {
        return res.status(400).json({
            success: false,
            error: "Le corps de la requête doit être un tableau"
        });
    }

    try {
        for (const update of updates) {
            const id = Number(update.id);

            if (Number.isNaN(id)) {
                continue;
            }

            const fields = {};

            if (update.proprietaire_1 !== undefined) {
                fields.proprietaire_1 =
                    update.proprietaire_1 === ""
                        ? null
                        : update.proprietaire_1;
            }

            if (update.proprietaire_2 !== undefined) {
                fields.proprietaire_2 =
                    update.proprietaire_2 === ""
                        ? null
                        : update.proprietaire_2;
            }

            if (Object.keys(fields).length === 0) {
                continue;
            }

            const { error } = await supabase
                .from("houses")
                .update(fields)
                .eq("id", id);

            if (error) {
                console.error(
                    `❌ Erreur pour la maison ${id} :`,
                    error
                );

                return res.status(500).json({
                    success: false,
                    error: `Impossible de modifier la maison ${id}`
                });
            }
        }

        res.json({
            success: true,
            message: "Maisons mises à jour"
        });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);

        res.status(500).json({
            success: false,
            error: "Erreur serveur"
        });
    }
});

// ============================================================
// 🚀 DÉMARRAGE
// ============================================================

app.listen(PORT, () => {
    console.log("");
    console.log("==========================================");
    console.log("🏠 HOUSE TRACKER");
    console.log("==========================================");
    console.log("");
    console.log(`🌐 Site : http://localhost:${PORT}`);
    console.log("🗄️ Base de données : Supabase");
    console.log("");
    console.log("Serveur démarré avec succès !");
    console.log("");
});