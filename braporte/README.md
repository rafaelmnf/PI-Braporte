# Braporte — Refatoração para React/Express

O projeto foi migrado para uma arquitetura moderna dividida em 3 camadas:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Banco de Dados:** Preparado para futuras conexões em PostgreSQL (sem ORM no momento)

O design antigo, comportamentos visuais e lógicas foram 100% preservados, transformados em componentes reutilizáveis.

---

## Como rodar o projeto

Você precisará de dois terminais para rodar o backend e o frontend simultaneamente.

### 1. Rodando o Backend (API)
Abra um terminal e acesse a pasta `backend`:
```bash
cd backend
npm install
npm run dev
```
*(O backend estará rodando na porta 3000)*

### 2. Rodando o Frontend (React)
Em um novo terminal, acesse a pasta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
O console exibirá o endereço (ex: `http://localhost:5173/`). Acesse para ver a aplicação.

---

## Estrutura do Projeto

- **frontend/src**: Contém a aplicação React, roteamento (`react-router-dom`), components (Topbar, CategoryGrid, ReportPopup, ReportForm, FilterChips), pages e styles.
- **backend/src**: API Mock em Express para aceitar e retornar reportes, permitindo que o frontend funcione independente.
- **database**: Base preparada com pastas `models` e `config`, aguardando a futura integração utilizando PostgreSQL.
