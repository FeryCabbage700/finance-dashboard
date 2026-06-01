
let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

const montantEl = document.getElementById("montant");
const labelEl = document.getElementById("label");
const dateEl = document.getElementById("date");

const filterMonthEl = document.getElementById("filter-month");

// =======================
// UTILS
// =======================

function parseMontant(v){
  return parseFloat(String(v).replace(",", "."));
}

function save(){
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// =======================
// ADD
// =======================

function ajouter(type){

  const montant = parseMontant(montantEl.value);
  const label = labelEl.value.trim();
  const date = dateEl.value;

  if(isNaN(montant) || !date) return;

  transactions.push({
    id: Date.now(),
    type,
    montant,
    label,
    date
  });

  save();
  reset();
  update();
}

function reset(){
  montantEl.value = "";
  labelEl.value = "";
}

// =======================
// DELETE
// =======================

function supprimer(id){
  transactions = transactions.filter(t => t.id !== id);
  save();
  update();
}

// =======================
// EDIT (simple prompt)
// =======================

function modifier(id){

  const t = transactions.find(x => x.id === id);
  if(!t) return;

  const newLabel = prompt("Label :", t.label);
  const newMontant = parseMontant(prompt("Montant :", t.montant));

  if(newLabel && !isNaN(newMontant)){
    t.label = newLabel;
    t.montant = newMontant;
  }

  save();
  update();
}

// =======================
// FILTER MONTH
// =======================

function getFiltered(){
  const mois = filterMonthEl.value;

  if(!mois) return transactions;

  return transactions.filter(t =>
    t.date.slice(0,7) === mois
  );
}

// =======================
// UPDATE UI
// =======================

function update(){

  const container = document.getElementById("transactions");
  container.innerHTML = "";

  const data = getFiltered();

  let revenus = 0;
  let depenses = 0;

  data.forEach(t => {

    if(t.type === "revenu") revenus += t.montant;
    else depenses += t.montant;

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <span>${t.label} (${t.date})</span>

      <div>
        <strong>
          ${t.type === "revenu" ? "+" : "-"}${t.montant}€
        </strong>

        <button onclick="modifier(${t.id})">✏</button>
        <button onclick="supprimer(${t.id})">🗑</button>
      </div>
    `;

    container.appendChild(div);
  });

  document.getElementById("revenus").textContent =
  revenus.toFixed(2) + "€";

  document.getElementById("depenses").textContent =
  depenses.toFixed(2) + "€";

  document.getElementById("solde").textContent =
  (revenus - depenses).toFixed(2) + "€";

  drawChart(revenus, depenses);
}

// =======================
// SIMPLE CHART (canvas)
// =======================

function drawChart(revenus, depenses){

  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const total = revenus + depenses || 1;

  const r = (revenus / total) * 200;
  const d = (depenses / total) * 200;

  ctx.fillStyle = "#00bcd4";
  ctx.fillRect(20,30,r,30);

  ctx.fillStyle = "#ff5252";
  ctx.fillRect(20,80,d,30);

  ctx.fillStyle = "white";
  ctx.fillText("Revenus", 20, 25);
  ctx.fillText("Dépenses", 20, 75);
}

// =======================
// EXPORT MOIS
// =======================

document.getElementById("export-month")
?.addEventListener("click", () => {

  const mois = new Date().toISOString().slice(0,7);

  const data = transactions.filter(t =>
    t.date.slice(0,7) === mois
  );

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {type:"application/json"}
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `budget-${mois}.json`;
  a.click();
});

// =======================
// EVENTS
// =======================

document.getElementById("add-revenu")
.addEventListener("click", () => ajouter("revenu"));

document.getElementById("add-depense")
.addEventListener("click", () => ajouter("depense"));

filterMonthEl.addEventListener("change", update);

// init
update();