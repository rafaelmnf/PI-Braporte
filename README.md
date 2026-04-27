# Braporte — Mapa de Segurança Urbana Colaborativo

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL (Supabase)
- **Mapa:** Mapbox GL JS (react-map-gl)
- **Busca de endereços:** Google Places Autocomplete

## Estrutura do Projeto

```
braporte/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── scripts/
│   │   ├── generateHash.js
│   │   └── seed.js
│   ├── src/
│   │   ├── config/         # Conexão com Supabase (db.js, jwt.js)
│   │   ├── controllers/    # authController, reportController
│   │   ├── routes/
│   │   │   └── api.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env                # Credenciais do backend (NÃO sobe pro git)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── effects/        # CountUp, SplitText, BorderGlow
│   │   │   ├── map/
│   │   │   │   └── MapViewer.jsx
│   │   │   ├── report/
│   │   │   │   └── ReportDetailsSheet.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── CategoryGrid.jsx
│   │   │   ├── FilterChips.jsx
│   │   │   ├── NotificationsPopup.jsx
│   │   │   ├── ReportForm.jsx
│   │   │   ├── ReportPopup.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── CadastroPage.jsx
│   │   │   ├── EsqueciSenhaPage.jsx
│   │   │   ├── MapaPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ComunidadePage.jsx
│   │   │   └── PerfilPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                # Chaves do Mapbox e Google (NÃO sobe pro git)
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Como Rodar

### 1. Backend

```bash
cd braporte/backend
npm install
```

Crie o arquivo `.env` na pasta `backend/` baseado no `.env.example` e preencha com as credenciais do Supabase.

```bash
node src/server.js
```

O backend roda na porta **3000**.

### 2. Frontend

```bash
cd braporte/frontend
npm install
```

Crie o arquivo `.env` na pasta `frontend/` baseado no `.env.example` e preencha com as chaves do Mapbox e Google Places.

```bash
npm run dev
```

Acesse **http://localhost:5173** no navegador.

### 3. Variáveis de ambiente

O projeto usa dois arquivos `.env` separados:

| Arquivo | Conteúdo |
|---------|----------|
| `backend/.env` | DATABASE_URL, JWT_SECRET, EMAIL_HOST, etc. |
| `frontend/.env` | VITE_MAPBOX_TOKEN, VITE_MAPBOX_STYLE, VITE_GOOGLE_PLACES_KEY |

Consulte os respectivos `.env.example` para saber quais variáveis preencher.

## Funcionalidades

- Login, cadastro e recuperação de senha com verificação por email
- Mapa interativo com marcadores por categoria
- Criação de reportes com endereço via Google Places
- Detalhes do reporte com opção de denúncia e atualização de status
- Dashboard com listagem, filtros e exclusão de reportes
- Ações comunitárias com participação controlada
- Perfil com gamificação (XP, distintivos, progresso)
- Navegação inferior e menu lateral
- Tema escuro em todas as telas
