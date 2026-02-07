let usuarioAtual = "";

const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const message = document.getElementById("message");
const messageDashboard = document.getElementById("messageDashboard");
const balanceValue = document.getElementById("balanceValue");
const userGreeting = document.getElementById("userGreeting");
const operationArea = document.getElementById("operationArea");

// Função auxiliar para mostrar mensagens
function showMsg(el, text, isError = false) {
  el.innerText = text;
  el.style.color = isError ? "#ff6666" : "#00ffaa";
  setTimeout(() => el.innerText = "", 5000);
}

// Login
async function handleLogin() {
  const nome = document.getElementById("username").value.trim();
  const senha = document.getElementById("password").value;

  if (!nome || !senha) {
    showMsg(message, "Preencha usuário e senha", true);
    return;
  }

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha })
    });

    const data = await res.json();

    if (data.erro) {
      showMsg(message, data.erro, true);
    } else {
      usuarioAtual = data.nome;
      userGreeting.innerText = `Olá, ${data.nome}`;
      balanceValue.innerText = Number(data.saldo).toFixed(2).replace(".", ",");

      loginScreen.style.display = "none";
      dashboardScreen.style.display = "block";
      message.innerText = "";
    }
  } catch (err) {
    showMsg(message, "Erro ao conectar com o servidor", true);
  }
}

// Registrar
async function handleRegister() {
  const nome = document.getElementById("username").value.trim();
  const senha = document.getElementById("password").value;

  if (!nome || !senha) {
    showMsg(message, "Preencha usuário e senha", true);
    return;
  }

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha })
    });

    const data = await res.json();
    showMsg(message, data.msg || data.erro, !!data.erro);
  } catch (err) {
    showMsg(message, "Erro ao conectar", true);
  }
}

// Depositar
async function showDepositForm() {
  operationArea.innerHTML = `
    <input type="number" id="valorOperacao" placeholder="Valor do depósito" min="1" step="0.01" />
    <button onclick="doDeposit()">Confirmar Depósito</button>
    <button onclick="cancelOperation()">Cancelar</button>
  `;
}

async function doDeposit() {
  const valor = document.getElementById("valorOperacao")?.value;
  if (!valor || Number(valor) <= 0) {
    showMsg(messageDashboard, "Valor inválido", true);
    return;
  }

  try {
    const res = await fetch("/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: usuarioAtual, valor })
    });

    const data = await res.json();
    if (data.erro) {
      showMsg(messageDashboard, data.erro, true);
    } else {
      balanceValue.innerText = Number(data.saldo).toFixed(2).replace(".", ",");
      showMsg(messageDashboard, "Depósito realizado com sucesso!");
      operationArea.innerHTML = "";
    }
  } catch (err) {
    showMsg(messageDashboard, "Erro ao depositar", true);
  }
}

// Sacar (nova função)
async function showWithdrawForm() {
  operationArea.innerHTML = `
    <input type="number" id="valorOperacao" placeholder="Valor do saque" min="1" step="0.01" />
    <button onclick="doWithdraw()">Confirmar Saque</button>
    <button onclick="cancelOperation()">Cancelar</button>
  `;
}

async function doWithdraw() {
  const valor = document.getElementById("valorOperacao")?.value;
  if (!valor || Number(valor) <= 0) {
    showMsg(messageDashboard, "Valor inválido", true);
    return;
  }

  try {
    const res = await fetch("/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: usuarioAtual, valor })
    });

    const data = await res.json();
    if (data.erro) {
      showMsg(messageDashboard, data.erro, true);
    } else {
      balanceValue.innerText = Number(data.saldo).toFixed(2).replace(".", ",");
      showMsg(messageDashboard, "Saque realizado com sucesso!");
      operationArea.innerHTML = "";
    }
  } catch (err) {
    showMsg(messageDashboard, "Erro ao sacar", true);
  }
}

// Cancelar operação
function cancelOperation() {
  operationArea.innerHTML = "";
}

// Logout
function logout() {
  usuarioAtual = "";
  balanceValue.innerText = "0,00";
  loginScreen.style.display = "block";
  dashboardScreen.style.display = "none";
  messageDashboard.innerText = "";
}