let paddocks = [];

// =====================
// 📦 CHARGEMENT JSON
// =====================
fetch("../data/paddocks.json")
  .then(r => r.json())
  .then(data => {
    paddocks = data;
    console.log("JSON chargé ✔️", paddocks.length, "enclos");
    window.paddocksReady = true;
  });

function parsePosition(pos) {
  return JSON.parse(pos);
}

// =====================
// 📍 RECHERCHE PAR POSITION
// =====================
window.searchPaddockByPosition = function () {

  const list = document.getElementById("list");
  const details = document.getElementById("details");

  if (!window.paddocksReady) {
    list.innerHTML = "Chargement des données...";
    return;
  }

  const xInput = document.getElementById("xSearch").value.trim();
  const yInput = document.getElementById("ySearch").value.trim();

  list.innerHTML = "";
  details.innerHTML = "";
  details.style.display = "none";

  if (xInput === "" || yInput === "") {
    list.innerHTML = "Entre une position complète (X et Y)";
    return;
  }

  const x = Number(xInput);
  const y = Number(yInput);

  const results = paddocks.filter(p => {
    const [px, py] = parsePosition(p.position);
    return px === x && py === y;
  });

  if (results.length === 0) {
    list.innerHTML = "Aucun enclos à cette position";
    return;
  }

  results.forEach(p => {
    const div = document.createElement("div");

    div.innerHTML = `
      <button class="house-btn" onclick="showPaddockDetails('${p.position}')">
        <span class="house-name">${p.lieu}</span>
        <span class="house-id">
          <strong>${p.position}</strong>
        </span>
      </button>
    `;

    list.appendChild(div);
  });
};

// =====================
// 🏴 RECHERCHE PAR GUILDE
// =====================
window.searchPaddockByGuild = function () {

  const list = document.getElementById("list");
  const details = document.getElementById("details");

  const query = document.getElementById("guildSearch").value.toLowerCase().trim();

  list.innerHTML = "";
  details.innerHTML = "";
  details.style.display = "none";

  if (query === "") return;

  const results = paddocks.filter(p => {
    const g1 = (p.guilde_1 ?? "").toLowerCase();
    const g2 = (p.guilde_2 ?? "").toLowerCase();

    return g1.includes(query) || g2.includes(query);
  });

  if (results.length === 0) {
    list.innerHTML = "Aucun enclos trouvé pour cette guilde";
    return;
  }

  results.forEach(p => {
    const div = document.createElement("div");

    div.innerHTML = `
      <button class="house-btn" onclick="showPaddockDetails('${p.position}')">
        <span class="house-name">${p.lieu}</span>
        <span class="house-id">
          <strong>${p.nb_places} places  |  ${p.nb_instances}</strong>
        </span>
      </button>
    `;

    list.appendChild(div);
  });
};

// =====================
// 📦 AFFICHAGE DETAILS
// =====================
window.showPaddockDetails = function (position) {

  const paddock = paddocks.find(p => p.position === position);
  showPaddock(paddock);
};

// =====================
// 🧾 TEMPLATE DETAILS
// =====================
function showPaddock(p) {

  const details = document.getElementById("details");

  if (!p) {
    details.innerHTML = "Enclos introuvable";
    return;
  }

  details.style.display = "block";

  const [x, y] = parsePosition(p.position);

  details.innerHTML = `
  <table class="house-details">

    <tr>
      <th>Lieu</th>
      <td>${p.lieu}</td>
    </tr>

    <tr>
      <th>Position</th>
      <td>${x}, ${y}</td>
    </tr>

    <tr>
      <th>Places</th>
      <td>${p.nb_places}</td>
    </tr>

    <tr>
      <th>Instances</th>
      <td>${p.nb_instances}</td>
    </tr>

    <tr>
      <th>Guilde 1</th>
      <td>${p.guilde_1 || "—"}</td>
    </tr>

    <tr>
      <th>Guilde 2</th>
      <td>${p.guilde_2 || "—"}</td>
    </tr>

    <tr>
      <th>À vendre</th>
      <td>${p.a_vendre ?? "Non"}</td>
    </tr>

  </table>
  `;
}