const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dashboard",
});

// testes nessa area abaixo

// testes nessa area acima
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
    process.exit(1);
  }
  console.log("Conectado ao MySQL (dashboard).");
});

// GET /tasks → retorna tarefas do usuário 1
app.get("/tasks", (req, res) => {
  const userId = 1; // Usuário padrão
  const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY prioridade ASC, prazo ASC";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar tarefas" });
    }
    console.log('Tarefas retornadas:', results); // Adicione este log
    res.json(results);
  });
});

// POST /tasks → cria nova tarefa
app.post("/tasks", (req, res) => {
  const { titulo, descricao, prioridade = 3, prazo = null } = req.body;
  const userId = 1; // Usuário padrão

  if (!titulo) {
    return res.status(400).json({ error: "Título é obrigatório" });
  }

  const sql = "INSERT INTO tasks (user_id, titulo, descricao, prioridade, prazo, feita) VALUES (?, ?, ?, ?, ?, 0)";

  db.query(sql, [userId, titulo, descricao || "", prioridade, prazo || null], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao inserir tarefa" });
    }
    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      titulo,
      descricao,
      prioridade,
      prazo,
      feita: 0
    });
  });
});

// PUT /tasks/:id/toggle → marca como concluída/pendente
app.put("/tasks/:id/toggle", (req, res) => {
  const { id } = req.params;
  const sqlCheck = "SELECT * FROM tasks WHERE id = ?";

  db.query(sqlCheck, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const sqlUpdate = "UPDATE tasks SET feita = !feita WHERE id = ?";
    db.query(sqlUpdate, [id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao atualizar tarefa" });
      }
      res.json({ message: "Tarefa atualizada com sucesso" });
    });
  });
});

// DELETE /tasks/:id → deleta tarefa
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const sqlCheck = "SELECT * FROM tasks WHERE id = ?";

  db.query(sqlCheck, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const sqlDelete = "DELETE FROM tasks WHERE id = ?";
    db.query(sqlDelete, [id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao deletar tarefa" });
      }
      res.json({ message: "Tarefa deletada com sucesso" });
    });
  });
});

// GET /users → retorna todos os usuários (manter compatibilidade)
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: "Erro na consulta" });
    res.json(results);
  });
});

// POST /users → insere novo usuário (manter compatibilidade)
app.post("/users", (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "nome, email e senha são obrigatórios" });
  }
  db.query(
    "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, senha],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erro ao inserir usuário" });
      res.status(201).json({ message: "Usuário adicionado com sucesso!", id: result.insertId });
    }
  );
});

app.listen(3000, () =>
  console.log("Servidor rodando em http://localhost:3000")
);
