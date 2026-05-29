let houses = [];

fetch("../data/houses.json")
  .then(r => r.json())
  .then(data => {
    houses = data;
    console.log("JSON chargé ✔️", houses.length, "maisons");
    window.housesReady = true;
  });


// =====================
// 🔎 RECHERCHE PAR ID
// =====================
window.searchById = function () {

  if (!window.housesReady) {
  list.innerHTML = "Chargement des données...";
  return;
  }
  const id = Number(document.getElementById("idSearch").value);

  const details = document.getElementById("details");
  const list = document.getElementById("list");

  list.innerHTML = "";
  details.innerHTML = "";
  details.style.display = "none";

  const house = houses.find(h => Number(h.id) === id);

  if (!house) {
    details.innerHTML = "Aucune maison trouvée";
    return;
  }

  showDetails(house);
};


// =====================
// 📍 RECHERCHE PAR POSITION
// =====================
window.searchByPosition = function () {
  if (!window.housesReady) {
  list.innerHTML = "Chargement des données...";
  return;
  }
  const xInput = document.getElementById("xSearch").value.trim();
  const yInput = document.getElementById("ySearch").value.trim();

  const list = document.getElementById("list");
  const details = document.getElementById("details");

  list.innerHTML = "";
  details.innerHTML = "";
  details.style.display = "none"; // cache comme au départ

  const x = Number(xInput);
  const y = Number(yInput);

  if (xInput === "" || yInput === "") {
    list.innerHTML = "Entre une position complète (X et Y)";
    return;
  }

  const results = houses.filter(h => {

    const [hx, hy] = JSON.parse(h.position);

    return hx === x && hy === y;
  });

  if (results.length === 0) {
    list.innerHTML = "Aucune maison à cette position";
    return;
  }

  results.forEach(h => {
    const div = document.createElement("div");

    div.innerHTML = `
      <button class ="house-btn" onclick="showDetailsById(${h.id})">
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

// ---------------------------
// RECHERCHE PAR NOM
// ---------------------------

window.searchByPlayer = function () {

  const query = document.getElementById("playerSearch").value.toLowerCase();

  const list = document.getElementById("list");
  const details = document.getElementById("details");

  list.innerHTML = "";
  details.style.display = "none";

  if (query === "") return;

  const results = houses.filter(h => {

    const p1 = (h.proprietaire_1 ?? "").toLowerCase();
    const p2 = (h.proprietaire_2 ?? "").toLowerCase();

    return p1.includes(query) || p2.includes(query);
  });

  if (results.length === 0) {
    list.innerHTML = "Aucune maison trouvée";
    return;
  }

  results.forEach(h => {
    const div = document.createElement("div");

    const ownerText =
      !h.proprietaire_2
      ? `<strong>${h.proprietaire_1}</strong>`
      : "<strong>Double instance</strong>";

    div.innerHTML = `
      <button class="house-btn" onclick="showDetailsById(${h.id})">

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

// =====================
// 📦 AFFICHAGE DETAILS
// =====================
window.showDetailsById = function (id) {
  const house = houses.find(h => Number(h.id) === id);
  showDetails(house);
};


// =====================
// 🧾 TEMPLATE DETAILS
// =====================
function showDetails(house) {
  const details = document.getElementById("details");

  details.style.display = "block"; // 👈 AJOUT

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