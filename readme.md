# Projeto Exemplo: Express + MySQL

Aplicação básica em **Node.js** usando **Express** para servidor e **MySQL** para gerenciar dados de usuários.

## Tecnologias

- Node.js  
- Express  
- MySQL2  
- XAMPP (MySQL local)  
- HTML, CSS, JS (frontend em `public/`)  

## Estrutura

```
/projeto
├─ public/        → Arquivos estáticos
├─ node_modules/  → Dependências
├─ package.json
└─ server.js      → Servidor principal
```

## Banco de dados

```sql
CREATE DATABASE exemplo_db;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL
);
```

Ajuste `user`, `password` e `database` no `server.js` conforme necessário.

## Instalação

```bash
git clone <repo-url>
cd projeto-exemplo
npm install
```

## Executando

```bash
node server.js
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Rotas

| Método | Rota       | Descrição                 | Corpo da requisição                   |
|--------|-----------|---------------------------|-------------------------------------|
| GET    | /usuarios | Retorna todos os usuários | —                                   |
| POST   | /usuarios | Adiciona novo usuário     | `{ "nome": "...", "email": "..." }` |

## Observações

- Teste as rotas com Postman, Insomnia ou fetch/AJAX no frontend.  
- Para produção, use banco seguro e valide os dados antes de inserir.

