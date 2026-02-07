const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const arquivo = "usuarios.json";

function carregar() {
  if (fs.existsSync(arquivo)) return JSON.parse(fs.readFileSync(arquivo, "utf8"));
  return [];
}
function salvar(usuarios) {
  fs.writeFileSync(arquivo, JSON.stringify(usuarios, null, 2));
}

// ====================== ROTAS ======================
app.post("/register", (req, res) => {
  const { nome, senha } = req.body;
  let usuarios = carregar();

  if (usuarios.find(u => u.nome === nome)) return res.status(400).json({ erro: "Usuário já existe" });

  usuarios.push({
    nome,
    senha: bcrypt.hashSync(senha, 10),
    saldo: 0,
    role: "user",
    historico: []
  });

  salvar(usuarios);
  res.json({ msg: "Conta criada com sucesso!" });
});

app.post("/login", (req, res) => {
  const { nome, senha } = req.body;
  let usuarios = carregar();

  const user = usuarios.find(u => u.nome === nome && bcrypt.compareSync(senha, u.senha));
  if (!user) return res.status(401).json({ erro: "Usuário ou senha inválidos" });

  res.json({
    nome: user.nome,
    saldo: user.saldo,
    role: user.role,
    historico: user.historico
  });
});

app.post("/deposit", (req, res) => {
  const { nome, valor } = req.body;
  let usuarios = carregar();
  const user = usuarios.find(u => u.nome === nome);
  if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });

  user.saldo += Number(valor);
  user.historico.push({ tipo: "Depósito", valor: Number(valor), data: new Date().toLocaleString() });
  salvar(usuarios);
  res.json({ saldo: user.saldo, historico: user.historico });
});

app.post("/withdraw", (req, res) => {
  const { nome, valor } = req.body;
  let usuarios = carregar();
  const user = usuarios.find(u => u.nome === nome);
  if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });
  if (Number(valor) > user.saldo) return res.status(400).json({ erro: "Saldo insuficiente" });

  user.saldo -= Number(valor);
  user.historico.push({ tipo: "Saque", valor: Number(valor), data: new Date().toLocaleString() });
  salvar(usuarios);
  res.json({ saldo: user.saldo, historico: user.historico });
});

app.get("/history/:nome", (req, res) => {
  let usuarios = carregar();
  const user = usuarios.find(u => u.nome === req.params.nome);
  if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });
  res.json(user.historico);
});

app.listen(3000, () => console.log("Calgarotto Bank rodando → http://localhost:3000"));
// Saque (nova rota)
app.post("/withdraw", (req, res) => {
  const { nome, valor } = req.body;
  const usuarios = carregarUsuarios();
  const usuario = usuarios.find((u) => u.nome === nome);

  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  const valorNum = Number(valor);
  if (isNaN(valorNum) || valorNum <= 0) {
    return res.status(400).json({ erro: "Valor inválido" });
  }

  if (valorNum > usuario.saldo) {
    return res.status(400).json({ erro: "Saldo insuficiente" });
  }

  usuario.saldo -= valorNum;
  salvarUsuarios(usuarios);

  res.json({ saldo: usuario.saldo });
});