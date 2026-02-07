const readline = require("readline");
const fs = require("fs");
const bcrypt = require("bcrypt");

const arquivo = "usuarios.json";

let usuarios = [];
let usuarioLogado = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ======================
// SALVAR / CARREGAR
// ======================
function carregarUsuarios() {
  if (fs.existsSync(arquivo)) {
    usuarios = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  }
}

function salvarUsuarios() {
  fs.writeFileSync(arquivo, JSON.stringify(usuarios, null, 2));
}

// ======================
// MENU INICIAL
// ======================
function menuInicial() {
  console.log("\n=== CALGAROTTO BANK ===");
  console.log("1 - Criar conta");
  console.log("2 - Login");
  console.log("3 - Sair");

  rl.question("Escolha: ", (opcao) => {
    if (opcao === "1") criarConta();
    else if (opcao === "2") login();
    else if (opcao === "3") {
      console.log("Até logo!");
      rl.close();
    } else {
      console.log("Opção inválida!");
      menuInicial();
    }
  });
}

// ======================
// CRIAR CONTA
// ======================
function criarConta() {
  rl.question("Nome de usuário: ", (nome) => {
    if (usuarios.find(u => u.nome === nome)) {
      console.log("Usuário já existe!");
      return menuInicial();
    }

    rl.question("Senha: ", (senha) => {
      const hash = bcrypt.hashSync(senha, 10);

      usuarios.push({
        nome,
        senha: hash,
        saldo: 0,
        role: "user",
        historico: []
      });

      salvarUsuarios();
      console.log("Conta criada com sucesso!");
      menuInicial();
    });
  });
}

// ======================
// LOGIN
// ======================
function login() {
  rl.question("Usuário: ", (nome) => {
    rl.question("Senha: ", (senha) => {
      const usuario = usuarios.find(
        u => u.nome === nome && bcrypt.compareSync(senha, u.senha)
      );

      if (!usuario) {
        console.log("Usuário ou senha inválidos!");
        return menuInicial();
      }

      usuarioLogado = usuario;
      console.log(`\nBem-vindo, ${usuarioLogado.nome}!`);
      menuBanco();
    });
  });
}

// ======================
// MENU DO BANCO
// ======================
function menuBanco() {
  console.log("\n=== SUA CONTA ===");
  console.log("1 - Ver saldo");
  console.log("2 - Depositar");
  console.log("3 - Sacar");
  console.log("4 - Histórico");
  if (usuarioLogado.role === "admin") {
    console.log("5 - Ver todos os usuários");
  }
  console.log("0 - Logout");

  rl.question("Escolha: ", (opcao) => {

    // SALDO
    if (opcao === "1") {
      console.log(`Saldo: R$ ${usuarioLogado.saldo}`);
      return menuBanco();
    }

    // DEPOSITAR
    if (opcao === "2") {
      rl.question("Valor do depósito: ", (valor) => {
        valor = Number(valor);

        if (valor <= 0 || isNaN(valor)) {
          console.log("Valor inválido!");
        } else {
          usuarioLogado.saldo += valor;
          usuarioLogado.historico.push({
            tipo: "Depósito",
            valor,
            data: new Date().toLocaleString()
          });
          salvarUsuarios();
          console.log("Depósito realizado!");
        }
        menuBanco();
      });
      return;
    }

    // SACAR
    if (opcao === "3") {
      rl.question("Valor do saque: ", (valor) => {
        valor = Number(valor);

        if (valor <= 0 || isNaN(valor)) {
          console.log("Valor inválido!");
        } else if (valor > usuarioLogado.saldo) {
          console.log("Saldo insuficiente!");
        } else {
          usuarioLogado.saldo -= valor;
          usuarioLogado.historico.push({
            tipo: "Saque",
            valor,
            data: new Date().toLocaleString()
          });
          salvarUsuarios();
          console.log("Saque realizado!");
        }
        menuBanco();
      });
      return;
    }

    // HISTÓRICO
    if (opcao === "4") {
      console.log("\n=== HISTÓRICO ===");
      if (usuarioLogado.historico.length === 0) {
        console.log("Nenhuma movimentação.");
      } else {
        usuarioLogado.historico.forEach(h => {
          console.log(`${h.data} - ${h.tipo}: R$ ${h.valor}`);
        });
      }
      return menuBanco();
    }

    // ADMIN
    if (opcao === "5" && usuarioLogado.role === "admin") {
      console.log("\n=== USUÁRIOS ===");
      usuarios.forEach(u => {
        console.log(`${u.nome} | Saldo: R$ ${u.saldo} | Role: ${u.role}`);
      });
      return menuBanco();
    }

    // LOGOUT
    if (opcao === "0") {
      usuarioLogado = null;
      console.log("Logout realizado!");
      return menuInicial();
    }

    console.log("Opção inválida!");
    menuBanco();
  });
}

// ======================
// INICIAR
// ======================
carregarUsuarios();

// cria admin automático se não existir
if (!usuarios.find(u => u.role === "admin")) {
  usuarios.push({
    nome: "admin",
    senha: bcrypt.hashSync("admin123", 10),
    saldo: 0,
    role: "admin",
    historico: []
  });
  salvarUsuarios();
}