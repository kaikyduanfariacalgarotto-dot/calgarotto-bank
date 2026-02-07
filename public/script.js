let currentUser = "";

const loginCard = document.getElementById("loginCard");
const dashboardCard = document.getElementById("dashboardCard");
const msg = document.getElementById("msg");
const msgDash = document.getElementById("msgDash");
const balance = document.getElementById("balance");
const greeting = document.getElementById("greeting");
const formArea = document.getElementById("formArea");

function showMessage(el, text, error = false) {
  el.innerText = text;
  el.style.color = error ? "#ff6666" : "#00ff88";
  setTimeout(() => el.innerText = "", 4000);
}

async function register() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;

  if (!user || !pass) return showMessage(msg, "Usuário e senha obrigatórios", true);

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: user, senha: pass })
  });

  const data = await res.json();
  showMessage(msg, data.msg || data.erro, !!data.erro);
}

async function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;

  if (!user || !pass) return showMessage(msg, "Usuário e senha obrigatórios", true);

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: user, senha: pass })
  });

  const data = await res.json();

  if (data.erro) return showMessage(msg, data.erro, true);

  currentUser = data.nome;
  greeting.innerText = `Fala, ${data.nome}!`;
  balance.innerText = Number(data.saldo).toFixed(2).replace(".", ",");

  loginCard.style.display = "none";
  dashboardCard.style.display = "block";
  msg.innerText = "";
}

function deposit() {
  formArea.innerHTML = `
    <input id="amount" type="number" placeholder="Valor" min="1" step="0.01">
    <button onclick="doDeposit()">Confirmar</button>
    <button onclick="clearForm()">Cancelar</button>
  `;
}

async function doDeposit() {
  const amount = document.getElementById("amount").value;
  if (!amount || Number(amount) <= 0) return showMessage(msgDash, "Valor inválido", true);

  const res = await fetch("/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: currentUser, valor: amount })
  });

  const data = await res.json();
  if (data.erro) return showMessage(msgDash, data.erro, true);

  balance.innerText = Number(data.saldo).toFixed(2).replace(".", ",");
  showMessage(msgDash, "Depósito realizado!");
  clearForm();
}

function withdraw() {
  formArea.innerHTML = `
    <input id="amount" type="number" placeholder="Valor" min="1" step="0.01">
    <button onclick="doWithdraw()">Confirmar</button>
    <button onclick="clearForm()">Cancelar</button>
  `;
}

async function doWithdraw() {
  const amount = document.getElementById("amount").value;
  if (!amount || Number(amount) <= 0) return showMessage(msgDash, "Valor inválido", true);

  const res = await fetch("/withdraw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: currentUser, valor: amount })
  });

  const data = await res.json();
  if (data.erro) return showMessage(msgDash, data.erro, true);

  balance.innerText = Number(data.saldo).toFixed(2).replace(".", ",");
  showMessage(msgDash, "Saque realizado!");
  clearForm();
}

function clearForm() {
  formArea.innerHTML = "";
}

function logout() {
  currentUser = "";
  balance.innerText = "0,00";
  loginCard.style.display = "block";
  dashboardCard.style.display = "none";
}