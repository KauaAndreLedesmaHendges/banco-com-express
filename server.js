const express = require("express"); // Framework para criar servidor e rotas
const mysql = require("mysql2"); // Biblioteca para conectar no MySQL
const path = require("path"); // Módulo nativo do Node para lidar com caminhos

const app = express(); // Cria a aplicação Express

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Middleware para servir arquivos estáticos (HTML, CSS, JS da pasta public/)
app.use(express.static(path.join(__dirname, "public")));

// Conexão com o banco MySQL (via XAMPP)
// Alterado para usar o banco 'dashboard' conforme o esquema fornecido
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dashboard",
});

// Testa conexão ao iniciar
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
    process.exit(1);
  }
  console.log("Conectado ao banco 'dashboard'");
});

// ---------- ROTAS ----------

// Retorna dados combinados de users e tasks (para dashboard)
app.get("/dashboard", (req, res) => {
  db.query("SELECT id, nome, email FROM users", (err, users) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar users" });
    }
    db.query("SELECT * FROM tasks", (err2, tasks) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Erro ao buscar tasks" });
      }
      res.json({ users, tasks });
    });
  });
});

// GET /users → retorna todos os usuários (sem a senha)
app.get("/users", (req, res) => {
  db.query("SELECT id, nome, email FROM users", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar usuários" });
    }
    res.json(results);
  });
});

// POST /users → insere um novo usuário (recebe nome, email, senha)
app.post("/users", (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "nome, email e senha são obrigatórios" });
  }
  db.query(
    "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, senha],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao inserir usuário" });
      }
      res.json({ message: "Usuário adicionado com sucesso!", id: result.insertId });
    }
  );
});

// GET /tasks → retorna todas as tarefas
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar tarefas" });
    }
    res.json(results);
  });
});

// POST /tasks → insere uma nova tarefa (user_id, titulo, descricao?, prioridade?, prazo?)
app.post("/tasks", (req, res) => {
  const { user_id, titulo, descricao = null, prioridade = 3, prazo = null } = req.body;
  if (!user_id || !titulo) {
    return res.status(400).json({ error: "user_id e titulo são obrigatórios" });
  }
  db.query(
    "INSERT INTO tasks (user_id, titulo, descricao, prioridade, prazo) VALUES (?, ?, ?, ?, ?)",
    [user_id, titulo, descricao, prioridade, prazo],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao inserir tarefa" });
      }
      res.json({ message: "Tarefa adicionada com sucesso!", id: result.insertId });
    }
  );
});

// Inicia o servidor na porta 3000
app.listen(4500, () =>
  console.log("Servidor rodando em http://localhost:3306")
);
