let houses = [];

window.housesReady = false;
window.editModeActive = false;


// ============================================================
// CHARGEMENT DES MAISONS
// ============================================================

fetch("/api/houses")
  .then(response => {
    if (!response.ok) {
      throw new Error("Erreur HTTP " + response.status);
    }

    return response.json();
  })
  .then(data => {
    houses = Array.isArray(data) ? data : [];

    console.log("JSON chargé ✔️", houses.length, "maisons");

    window.housesReady = true;

    // Si on est actuellement dans le mode Edit,
    // on affiche les données dès qu'elles sont chargées.
    if (window.editModeActive) {
      renderEditList();
    }
  })
  .catch(error => {
    console.error("❌ Impossible de charger les maisons :", error);

    window.housesReady = true;

    const editList = document.getElementById("editList");

    if (editList) {
      editList.innerHTML =
        "<p>❌ Impossible de charger les données.</p>";
    }
  });


// ============================================================
// CHANGEMENT DE MODE TRACKING / EDIT
// ============================================================

window.setMode = function (mode) {

  const trackingMode = document.getElementById("trackingMode");
  const editMode = document.getElementById("editMode");

  const trackingButton = document.getElementById("trackingButton");
  const editButton = document.getElementById("editButton");


  // ----------------------------------------------------------
  // MODE TRACKING
  // ----------------------------------------------------------

  if (mode === "tracking") {

    window.editModeActive = false;

    trackingMode.style.display = "block";
    editMode.style.display = "none";

    trackingButton.style.background = "#03af37";
    trackingButton.style.color = "white";

    editButton.style.background = "#6be298";
    editButton.style.color = "rgb(3, 0, 0)";

    return;
  }


  // ----------------------------------------------------------
  // MODE EDIT
  // ----------------------------------------------------------

  if (mode === "edit") {

    window.editModeActive = true;

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
// TRACKING - RECHERCHE PAR ID
// ============================================================

window.searchById = function () {

  const input = document.getElementById("idSearch");

  if (!input) return;

  const value = input.value.trim();

  if (value === "") {
    document.getElementById("list").innerHTML = "";
    document.getElementById("details").innerHTML = "";
    return;
  }

  const id = Number(value);

  const house = houses.find(
    h => Number(h.id) === id
  );

  const list = document.getElementById("list");

  list.innerHTML = "";

  if (!house) {
    list.innerHTML = "<p>Aucune maison trouvée.</p>";
    document.getElementById("details").innerHTML = "";
    return;
  }

  const button = document.createElement("button");

  button.className = "house-btn";

  button.innerHTML = `
    <span class="house-id">#${String(house.id).padStart(3, "0")}</span>
    <span class="house-name">${escapeHtml(house.nom ?? "")}</span>
    <span class="house-owner">
      ${escapeHtml(house.proprietaire_1 ?? "Libre")}
    </span>
  `;

  button.onclick = function () {
    showDetailsById(house.id);
  };

  list.appendChild(button);

  showDetailsById(house.id);
};


// ============================================================
// TRACKING - RECHERCHE PAR POSITION
// ============================================================

window.searchByPosition = function () {

  const xInput = document.getElementById("xSearch");
  const yInput = document.getElementById("ySearch");

  const xValue = xInput.value.trim();
  const yValue = yInput.value.trim();

  const list = document.getElementById("list");
  const details = document.getElementById("details");

  list.innerHTML = "";
  details.innerHTML = "";


  if (xValue === "" || yValue === "") {
    list.innerHTML =
      "<p>Veuillez renseigner X et Y.</p>";
    return;
  }


  const x = Number(xValue);
  const y = Number(yValue);


  if (Number.isNaN(x) || Number.isNaN(y)) {
    list.innerHTML =
      "<p>Coordonnées invalides.</p>";
    return;
  }


  const results = houses.filter(house => {

    const position = parsePosition(house.position);

    if (!position) return false;

    const [houseX, houseY] = position;

    return houseX === x && houseY === y;
  });


  if (results.length === 0) {
    list.innerHTML =
      "<p>Aucune maison trouvée à cette position.</p>";
    return;
  }


  results
    .sort((a, b) => Number(a.id) - Number(b.id))
    .forEach(house => {

      const button = document.createElement("button");

      button.className = "house-btn";

      button.innerHTML = `
        <span class="house-id">
          #${String(house.id).padStart(3, "0")}
        </span>

        <span class="house-name">
          ${escapeHtml(house.nom ?? "")}
        </span>

        <span class="house-owner">
          ${escapeHtml(house.proprietaire_1 ?? "Libre")}
        </span>
      `;

      button.onclick = function () {
        showDetailsById(house.id);
      };

      list.appendChild(button);
    });
};


// ============================================================
// TRACKING - RECHERCHE PAR PSEUDO
// ============================================================

window.searchByPlayer = function () {

  const input = document.getElementById("playerSearch");

  if (!input) return;

  const search = input.value
    .trim()
    .toLowerCase();

  const list = document.getElementById("list");

  list.innerHTML = "";

  if (search === "") {
    return;
  }


  const results = houses.filter(house => {

    const owner1 = String(
      house.proprietaire_1 ?? ""
    ).toLowerCase();

    const owner2 = String(
      house.proprietaire_2 ?? ""
    ).toLowerCase();


    return (
      owner1.includes(search) ||
      owner2.includes(search)
    );
  });


  if (results.length === 0) {

    list.innerHTML =
      "<p>Aucune maison trouvée pour ce joueur.</p>";

    return;
  }


  results
    .sort((a, b) => Number(a.id) - Number(b.id))
    .forEach(house => {

      const button = document.createElement("button");

      button.className = "house-btn";

      button.innerHTML = `
        <span class="house-id">
          #${String(house.id).padStart(3, "0")}
        </span>

        <span class="house-name">
          ${escapeHtml(house.nom ?? "")}
        </span>

        <span class="house-owner">
          ${escapeHtml(house.proprietaire_1 ?? "Libre")}
        </span>
      `;

      button.onclick = function () {
        showDetailsById(house.id);
      };

      list.appendChild(button);
    });
};


// ============================================================
// AFFICHAGE DES DETAILS D'UNE MAISON
// ============================================================

window.showDetailsById = function (id) {

  const house = houses.find(
    h => Number(h.id) === Number(id)
  );

  if (!house) return;

  showDetails(house);
};


window.showDetails = function (house) {

  const details = document.getElementById("details");

  if (!details) return;


  const position = parsePosition(house.position);

  let x = "";
  let y = "";

  if (position) {
    x = position[0];
    y = position[1];
  }

  let guilde;
  if (house.guilde === "y") {
    guilde = "Oui";
  }
  else if (house.guilde === "n") {
    guilde = "Non"
  }
  else {
    guilde = "Double instance"
  }

  let vente;
  if (house.vente === "y") {
    vente = "Oui";
  }

  else {
    vente = "Non"
  }
  
  details.innerHTML = `
    <table class="house-details">

      <tr>
        <th>ID</th>
        <td>${escapeHtml(house.id ?? "")}</td>
      </tr>

      <tr>
        <th>Nom</th>
        <td>${escapeHtml(house.nom ?? "")}</td>
      </tr>

      <tr>
        <th>Position</th>
        <td>[${escapeHtml(x)}, ${escapeHtml(y)}]</td>
      </tr>

      <tr>
        <th>Prix</th>
        <td>${escapeHtml(house.prix ?? "")}</td>
      </tr>

      <tr>
        <th>Maison guildée</th>
        <td>${escapeHtml(guilde)}</td>
      </tr>

      <tr>
        <th>Maison en vente</th>
        <td>${escapeHtml(vente)}</td>
      </tr>

      <tr>
        <th>Propriétaire 1</th>
        <td>
          ${escapeHtml(house.proprietaire_1 ?? "Libre")}
        </td>
      </tr>

      <tr>
        <th>Propriétaire 2</th>
        <td>
          ${escapeHtml(house.proprietaire_2 ?? "(aucun)")}
        </td>
      </tr>

    </table>
  `;
};


// ============================================================
// EDIT - RECHERCHE PAR POSITION
// ============================================================

window.searchEditPosition = function () {

  const xInput =
    document.getElementById("editXSearch");

  const yInput =
    document.getElementById("editYSearch");


  const xValue = xInput.value.trim();
  const yValue = yInput.value.trim();


  // Aucun filtre
  if (xValue === "" && yValue === "") {
    renderEditList();
    return;
  }


  const x =
    xValue !== ""
      ? Number(xValue)
      : null;

  const y =
    yValue !== ""
      ? Number(yValue)
      : null;


  if (
    (x !== null && Number.isNaN(x)) ||
    (y !== null && Number.isNaN(y))
  ) {

    renderEditList([]);

    return;
  }


  const results = houses.filter(house => {

    const position =
      parsePosition(house.position);

    if (!position) return false;


    const houseX = position[0];
    const houseY = position[1];


    if (x !== null && y !== null) {
      return (
        houseX === x &&
        houseY === y
      );
    }


    if (x !== null) {
      return houseX === x;
    }


    if (y !== null) {
      return houseY === y;
    }


    return true;
  });


  renderEditList(results);
};


// ============================================================
// EDIT - AFFICHAGE DE L'EN-TETE
// ============================================================

function ensureEditHeader() {

  const editList =
    document.getElementById("editList");

  if (!editList) return;


  let header =
    document.querySelector(".edit-list-header");


  if (!header) {

    header =
      document.createElement("div");

    header.className =
      "edit-list-header";


    header.innerHTML = `
      <div>Coordonnées</div>
      <div>ID</div>
      <div>Nom</div>
      <div>Propriétaire 1</div>
      <div>Propriétaire 2</div>
    `;


    editList.parentNode.insertBefore(
      header,
      editList
    );
  }
}


// ============================================================
// EDIT - AFFICHAGE DE LA LISTE
// ============================================================

function renderEditList(housesToDisplay = houses) {

  const editList =
    document.getElementById("editList");

  if (!editList) return;


  // Création de l'en-tête si nécessaire
  ensureEditHeader();


  editList.innerHTML = "";


  // ----------------------------------------------------------
  // CHARGEMENT
  // ----------------------------------------------------------

  if (!window.housesReady) {

    editList.innerHTML =
      "<p>Chargement des données...</p>";

    return;
  }


  // ----------------------------------------------------------
  // TRI PAR ID
  // ----------------------------------------------------------

  const sortedHouses =
    [...housesToDisplay]
      .sort(
        (a, b) =>
          Number(a.id) - Number(b.id)
      );


  // ----------------------------------------------------------
  // AUCUN RESULTAT
  // ----------------------------------------------------------

  if (sortedHouses.length === 0) {

    editList.innerHTML =
      "<p>Aucune maison trouvée.</p>";

    return;
  }


  // ----------------------------------------------------------
  // COULEURS PAR POSITION
  // ----------------------------------------------------------

  let previousPosition = null;
  let colorIndex = 0;


  // ----------------------------------------------------------
  // CREATION DES LIGNES
  // ----------------------------------------------------------

  sortedHouses.forEach(house => {

    const position =
      parsePosition(house.position);


    if (!position) {
      return;
    }


    const x = position[0];
    const y = position[1];


    const positionKey =
      `${x},${y}`;


    if (
      positionKey !==
      previousPosition
    ) {

      colorIndex++;

      previousPosition =
        positionKey;
    }


    const row =
      document.createElement("div");


    row.className =
      "edit-house";


    if (colorIndex % 2 === 1) {

      row.classList.add(
        "edit-house-light"
      );

    } else {

      row.classList.add(
        "edit-house-dark"
      );
    }


    const paddedId =
      String(house.id)
        .padStart(3, "0");


    // --------------------------------------------------------
    // COLONNES
    // --------------------------------------------------------

    const positionElement =
      document.createElement("span");

    positionElement.className =
      "edit-position";

    positionElement.textContent =
      `[${x},${y}]`;


    const idElement =
      document.createElement("span");

    idElement.className =
      "edit-id";

    idElement.textContent =
      paddedId;


    const nameElement =
      document.createElement("span");

    nameElement.className =
      "edit-name";

    nameElement.textContent =
      house.nom ?? "";


    // --------------------------------------------------------
    // PROPRIETAIRE 1
    // --------------------------------------------------------

    const owner1 =
      document.createElement("input");

    owner1.className =
      "edit-owner";

    owner1.type = "text";

    owner1.dataset.id =
      house.id;

    owner1.dataset.owner =
      "1";

    owner1.value =
      house.proprietaire_1 ?? "";

    owner1.placeholder =
      "Proprio 1";


    // --------------------------------------------------------
    // PROPRIETAIRE 2
    // --------------------------------------------------------

    const owner2 =
      document.createElement("input");

    owner2.className =
      "edit-owner";

    owner2.type = "text";

    owner2.dataset.id =
      house.id;

    owner2.dataset.owner =
      "2";

    owner2.value =
      house.proprietaire_2 ?? "";

    owner2.placeholder =
      "(aucun)";


    // --------------------------------------------------------
    // AJOUT DES ELEMENTS
    // --------------------------------------------------------

    row.appendChild(positionElement);
    row.appendChild(idElement);
    row.appendChild(nameElement);
    row.appendChild(owner1);
    row.appendChild(owner2);


    editList.appendChild(row);
  });
}


// ============================================================
// EDIT - EFFACER LA RECHERCHE
// ============================================================

window.clearEditPositionSearch = function () {

  const xInput =
    document.getElementById("editXSearch");

  const yInput =
    document.getElementById("editYSearch");


  if (xInput) {
    xInput.value = "";
  }


  if (yInput) {
    yInput.value = "";
  }


  renderEditList();
};


// ============================================================
// UTILITAIRE POSITION
// ============================================================

function parsePosition(position) {

  try {

    if (Array.isArray(position)) {
      return position;
    }


    if (typeof position !== "string") {
      return null;
    }


    const parsed =
      JSON.parse(position);


    if (
      !Array.isArray(parsed) ||
      parsed.length < 2
    ) {
      return null;
    }


    const x = Number(parsed[0]);
    const y = Number(parsed[1]);


    if (
      Number.isNaN(x) ||
      Number.isNaN(y)
    ) {
      return null;
    }


    return [x, y];

  } catch (error) {

    console.warn(
      "Position invalide :",
      position
    );

    return null;
  }
}


// ============================================================
// UTILITAIRE SECURITE HTML
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
// SAUVEGARDE DES MODIFICATIONS
// ============================================================

window.saveAllChanges = async function () {

  const inputs =
    document.querySelectorAll(
      ".edit-owner"
    );


  const changes = {};


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


  console.log(
    "📤 DONNÉES ENVOYÉES :",
    updates
  );


  if (updates.length === 0) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/houses",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(updates)
        }
      );


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


    // --------------------------------------------------------
    // Mise à jour locale
    // --------------------------------------------------------

    updates.forEach(update => {

      const house =
        houses.find(
          h =>
            Number(h.id) ===
            Number(update.id)
        );


      if (!house) return;


      if (
        update.proprietaire_1 !==
        undefined
      ) {

        house.proprietaire_1 =
          update.proprietaire_1;
      }


      if (
        update.proprietaire_2 !==
        undefined
      ) {

        house.proprietaire_2 =
          update.proprietaire_2;
      }

    });


    alert(
      "✅ Modifications enregistrées !"
    );


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
// INITIALISATION
// ============================================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    setMode("tracking");

  }
);