let houses = [];
window.housesReady = false;
window.editModeActive = false;

// ============================================================
// 📦 CHARGEMENT DES MAISONS
// ============================================================

fetch("/api/houses")
  .then(r => {

    if (!r.ok) {
      throw new Error("Erreur HTTP " + r.status);
    }

    return r.json();

  })
  .then(data => {

    houses = data;

    console.log(
      "JSON chargé ✔️",
      houses.length,
      "maisons"
    );

    window.housesReady = true;


    // Si l'utilisateur est déjà dans Edit
    // on affiche maintenant les maisons
    if (window.editModeActive) {
      renderEditList();
    }

  })
  .catch(error => {

    console.error(
      "❌ Impossible de charger houses.json :",
      error
    );

  });


// ============================================================
// 🔀 CHANGEMENT DE MODE
// ============================================================

window.setMode = function (mode) {

  const trackingMode =
    document.getElementById("trackingMode");

  const editMode =
    document.getElementById("editMode");

  const trackingButton =
    document.getElementById("trackingButton");

  const editButton =
    document.getElementById("editButton");


  if (mode === "tracking") {

    trackingMode.style.display = "block";
    editMode.style.display = "none";

    trackingButton.style.background = "#03af37";
    trackingButton.style.color = "white";

    editButton.style.background = "#6be298";
    editButton.style.color = "rgb(3, 0, 0)";

    return;
  }


  if (mode === "edit") {

    trackingMode.style.display = "none";
    editMode.style.display = "block";

    trackingButton.style.background = "#6be298";
    trackingButton.style.color = "rgb(3, 0, 0)";

    editButton.style.background = "#03af37";
    editButton.style.color = "white";

    renderEditList();

  }

};


// ============================================================
// 🔎 RECHERCHE PAR ID
// ============================================================

window.searchById = function () {

  const list =
    document.getElementById("list");

  const details =
    document.getElementById("details");


  if (!window.housesReady) {

    list.innerHTML =
      "Chargement des données...";

    return;
  }


  const id =
    Number(
      document.getElementById("idSearch").value
    );


  list.innerHTML = "";

  details.innerHTML = "";

  details.style.display = "none";


  const house =
    houses.find(
      h => Number(h.id) === id
    );


  if (!house) {

    details.innerHTML =
      "Aucune maison trouvée";

    details.style.display = "block";

    return;
  }


  showDetails(house);

};


// ============================================================
// 📍 RECHERCHE PAR POSITION
// ============================================================

window.searchByPosition = function () {

  const list =
    document.getElementById("list");

  const details =
    document.getElementById("details");


  if (!window.housesReady) {

    list.innerHTML =
      "Chargement des données...";

    return;
  }


  const xInput =
    document
      .getElementById("xSearch")
      .value
      .trim();


  const yInput =
    document
      .getElementById("ySearch")
      .value
      .trim();


  list.innerHTML = "";

  details.innerHTML = "";

  details.style.display = "none";


  const x = Number(xInput);

  const y = Number(yInput);


  if (xInput === "" || yInput === "") {

    list.innerHTML =
      "Entre une position complète (X et Y)";

    return;
  }


  const results =
    houses.filter(h => {

      const [hx, hy] =
        JSON.parse(h.position);

      return hx === x && hy === y;

    });


  if (results.length === 0) {

    list.innerHTML =
      "Aucune maison à cette position";

    return;
  }


  results.forEach(h => {

    const div =
      document.createElement("div");


    div.innerHTML = `

      <button
        class="house-btn"
        onclick="showDetailsById(${h.id})"
      >

        <span class="house-name">
          ${h.nom}
        </span>

        <span class="house-id">
          <strong>ID = ${h.id}</strong>
        </span>

      </button>

    `;


    list.appendChild(div);

  });

};


// ============================================================
// 👤 RECHERCHE PAR PSEUDO
// ============================================================

window.searchByPlayer = function () {

  const query =
    document
      .getElementById("playerSearch")
      .value
      .toLowerCase();


  const list =
    document.getElementById("list");

  const details =
    document.getElementById("details");


  list.innerHTML = "";

  details.style.display = "none";


  if (query === "") {
    return;
  }


  const results =
    houses.filter(h => {

      const p1 =
        (h.proprietaire_1 ?? "")
          .toLowerCase();


      const p2 =
        (h.proprietaire_2 ?? "")
          .toLowerCase();


      return (
        p1.includes(query) ||
        p2.includes(query)
      );

    });


  if (results.length === 0) {

    list.innerHTML =
      "Aucune maison trouvée";

    return;
  }


  results.forEach(h => {

    const div =
      document.createElement("div");


    const ownerText =
      !h.proprietaire_2
        ? `<strong>${h.proprietaire_1}</strong>`
        : "<strong>Double instance</strong>";


    div.innerHTML = `

      <button
        class="house-btn"
        onclick="showDetailsById(${h.id})"
      >

        <span class="house-name">
          ${h.nom}
        </span>

        <span class="house-owner">
          <strong>${ownerText}</strong>
        </span>

      </button>

    `;


    list.appendChild(div);

  });

};


// ============================================================
// 📦 AFFICHAGE DETAILS
// ============================================================

window.showDetailsById = function (id) {

  const house =
    houses.find(
      h => Number(h.id) === id
    );


  if (!house) {
    return;
  }


  showDetails(house);

};


// ============================================================
// 🧾 TEMPLATE DETAILS
// ============================================================

function showDetails(house) {

  const details =
    document.getElementById("details");


  details.style.display = "block";


  details.innerHTML = `

    <table class="house-details">

      <tr>
        <th>Nom</th>
        <td>${house.nom}</td>
      </tr>

      <tr>
        <th>ID</th>
        <td>${house.id}</td>
      </tr>

      <tr>
        <th>Lieu</th>
        <td>${house.lieu}</td>
      </tr>

      <tr>
        <th>Position</th>
        <td>${house.position}</td>
      </tr>

      <tr>
        <th>Prix</th>
        <td>${house.prix}</td>
      </tr>

      <tr>
        <th>Pièces</th>
        <td>${house.nb_pieces}</td>
      </tr>

      <tr>
        <th>Coffres</th>
        <td>${house.nb_coffres}</td>
      </tr>

      <tr>
        <th>Atelier</th>
        <td>${house.atelier}</td>
      </tr>

      <tr>
        <th>Maison guildée</th>

        <td>
          ${
            house.guilde === "y"
              ? "OUI"
              : house.guilde === "n"
              ? "NON"
              : "DOUBLE INSTANCE"
          }
        </td>

      </tr>

      <tr>
        <th>Propriétaire 1</th>
        <td>${house.proprietaire_1}</td>
      </tr>

      <tr>
        <th>Propriétaire 2</th>
        <td>${house.proprietaire_2 ?? "Aucun"}</td>
      </tr>

    </table>

  `;

}


// ============================================================
// ✏️ MODE EDIT — AFFICHAGE DE LA LISTE
// ============================================================

function renderEditList() {

  const editList =
    document.getElementById("editList");


  if (!editList) {
    return;
  }


  editList.innerHTML = "";


  // Les données ne sont pas encore chargées
  if (!window.housesReady) {

    editList.innerHTML =
      "<p>Chargement des données...</p>";

    return;
  }


  // ==========================================================
  // TRI PAR POSITION PUIS PAR ID
  // ==========================================================

  const sortedHouses =
    [...houses].sort((a, b) => {

      const [ax, ay] =
        JSON.parse(a.position);

      const [bx, by] =
        JSON.parse(b.position);


      if (ax !== bx) {
        return ax - bx;
      }


      if (ay !== by) {
        return ay - by;
      }


      return Number(a.id) - Number(b.id);

    });


  // ==========================================================
  // GROUPES DE POSITION
  // ==========================================================

  let previousPosition = null;

  let colorIndex = 0;


  // ==========================================================
  // CRÉATION DES LIGNES
  // ==========================================================

  sortedHouses.forEach(house => {

    const [x, y] =
      JSON.parse(house.position);


    const positionKey =
      `${x},${y}`;


    // Nouvelle position = changement de couleur
    if (positionKey !== previousPosition) {

      colorIndex++;

      previousPosition =
        positionKey;

    }


    const row =
      document.createElement("div");


    row.className =
      "edit-house";


    // Alternance des couleurs
    if (colorIndex % 2 === 1) {

      row.classList.add(
        "edit-house-light"
      );

    } else {

      row.classList.add(
        "edit-house-dark"
      );

    }


    // ID avec 3 chiffres
    const paddedId =
      String(house.id).padStart(3, "0");


    row.innerHTML = `

      <span class="edit-position">
        [${x},${y}]
      </span>

      <span class="edit-id">
        ${paddedId}
      </span>

      <span class="edit-name">
        ${house.nom}
      </span>

      <input
        class="edit-owner"
        data-id="${house.id}"
        data-owner="1"
        type="text"
        value="${escapeHtml(
          house.proprietaire_1 ?? ""
        )}"
        placeholder="Proprio 1"
      >

      <input
        class="edit-owner"
        data-id="${house.id}"
        data-owner="2"
        type="text"
        value="${escapeHtml(
          house.proprietaire_2 ?? ""
        )}"
        placeholder="(aucun)"
      >

    `;


    editList.appendChild(row);

  });

}


// ============================================================
// 🛡️ PROTECTION DES VALEURS HTML
// ============================================================

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ============================================================
// 💾 SAUVEGARDE DES MODIFICATIONS
// ============================================================

window.saveAllChanges = async function () {

  const inputs =
    document.querySelectorAll(".edit-owner");


  const changes = {};


  // ==========================================================
  // RÉCUPÉRATION DES CHANGEMENTS
  // ==========================================================

  inputs.forEach(input => {

    const id =
      Number(input.dataset.id);


    const owner =
      input.dataset.owner;


    if (!changes[id]) {

      changes[id] = {
        id: id
      };

    }


    if (owner === "1") {

      changes[id].proprietaire_1 =
        input.value.trim() || null;

    }


    if (owner === "2") {

      changes[id].proprietaire_2 =
        input.value.trim() || null;

    }

  });


  const updates =
    Object.values(changes);

  console.log("📤 DONNÉES ENVOYÉES :", updates);


  if (updates.length === 0) {

    return;
  }


  // ==========================================================
  // ENVOI AU SERVEUR
  // ==========================================================

  try {

    const response =
      await fetch("/api/houses", {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        /*
         * IMPORTANT :
         * ton server.js attend directement un tableau.
         *
         * Il attend :
         * [
         *   { id: 1, proprietaire_1: "..." }
         * ]
         *
         * et PAS :
         * { houses: [...] }
         */

        body: JSON.stringify(updates)

      });


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "Réponse serveur :",
        errorText
      );

      throw new Error(
        `Erreur HTTP ${response.status}`
      );

    }


    // ========================================================
    // MISE À JOUR DES DONNÉES LOCALES
    // ========================================================

    updates.forEach(update => {

      const house =
        houses.find(
          h => Number(h.id) === Number(update.id)
        );


      if (!house) {
        return;
      }


      if (
        update.proprietaire_1 !== undefined
      ) {

        house.proprietaire_1 =
          update.proprietaire_1;

      }


      if (
        update.proprietaire_2 !== undefined
      ) {

        house.proprietaire_2 =
          update.proprietaire_2;

      }

    });


    alert(
      "✅ Modifications enregistrées !"
    );


    // On reconstruit la liste avec les nouvelles valeurs
    renderEditList();


  } catch (error) {

    console.error(
      "❌ Erreur de sauvegarde :",
      error
    );


    alert(
      "❌ Impossible d'enregistrer les modifications."
    );

  }

};


// ============================================================
// 🔎 MODE TRACKING AU DÉMARRAGE
// ============================================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    setMode("tracking");

  }
);