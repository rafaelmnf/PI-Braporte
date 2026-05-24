# Braporte — Mapa de Segurança Urbana Colaborativo

- **Frontend:** React + Vite
- **Backend:** Node.js + Express (arquitetura em camadas: Controller → Service → Repository)
- **Banco de Dados:** PostgreSQL (Supabase)
- **Mapa:** Mapbox GL JS (react-map-gl)
- **Busca de endereços:** Google Places Autocomplete

## Estrutura do Projeto

```
braporte/
├── backend/
│   ├── database/
│   │   ├── schema.sql                  # Tabelas principais
│   │   ├── avaliacoes.sql              # Tabela de avaliações de reportes
│   │   ├── acoes_comunitarias.sql      # Tabelas de ações comunitárias
│   │   ├── acoes_alter.sql             # Colunas de status e imagem das ações
│   │   ├── fix_image_columns.sql
│   │   ├── trigger_localizacao.sql
│   │   └── update_schema_images.sql
│   ├── scripts/
│   │   ├── generateHash.js
│   │   └── seed.js
│   ├── src/
│   │   ├── config/             # Conexão com Supabase (db.js, jwt.js)
│   │   ├── controllers/        # authController, reportController,
│   │   │                       #   userController, acaoController
│   │   ├── services/           # Lógica de negócio: authService, reportService,
│   │   │                       #   acaoService, imageService
│   │   ├── repositories/       # Acesso ao banco: authRepository,
│   │   │                       #   reportRepository, acaoRepository
│   │   ├── routes/
│   │   │   └── api.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env                    # Credenciais do backend (NÃO sobe pro git)
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
│   │   │   ├── MenuButton.jsx       # Botão de menu das telas internas
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
│   ├── .env                    # Chaves do Mapbox e Google (NÃO sobe pro git)
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Como Rodar

### 1. Banco de Dados

O banco fica hospedado no Supabase. Os scripts SQL da pasta `backend/database/`
devem ser executados no SQL Editor do Supabase para criar as tabelas:
`schema.sql`, `avaliacoes.sql`, `acoes_comunitarias.sql` e `acoes_alter.sql`.

### 2. Backend

```bash
cd braporte/backend
npm install
```

Crie o arquivo `.env` na pasta `backend/` baseado no `.env.example` e preencha
com as credenciais do Supabase.

```bash
node src/server.js
```

O backend roda na porta **3000**.

### 3. Frontend

```bash
cd braporte/frontend
npm install
```

Crie o arquivo `.env` na pasta `frontend/` baseado no `.env.example` e preencha
com as chaves do Mapbox e Google Places.

```bash
npm run dev
```

Acesse **http://localhost:5173** no navegador.

### 4. Variáveis de ambiente

O projeto usa dois arquivos `.env` separados:

| Arquivo | Conteúdo |
|---------|----------|
| `backend/.env` | DATABASE_URL, JWT_SECRET, EMAIL_HOST, etc. |
| `frontend/.env` | VITE_MAPBOX_TOKEN, VITE_MAPBOX_STYLE, VITE_GOOGLE_PLACES_KEY |

## Arquitetura do Backend

O backend segue uma arquitetura em camadas, aplicando os princípios SOLID e DRY:

- **Routes** — recebem a requisição HTTP e encaminham para o controller.
- **Controllers** — validam a entrada e formatam a resposta.
- **Services** — concentram a lógica de negócio.
- **Repositories** — isolam o acesso ao banco de dados (consultas SQL).

## Funcionalidades

- Login, cadastro e recuperação de senha com verificação por email
- Mapa interativo com marcadores por categoria
- Criação de reportes com endereço via Google Places e upload de imagem
- Detalhes do reporte com imagem, denúncia e atualização de status
- Avaliação de reportes por estrelas, com cálculo de credibilidade do autor
- Download das imagens anexadas aos reportes
- Dashboard com listagem, filtros e exclusão de reportes pelo autor
- Ações comunitárias: criação, participação, conclusão e exclusão pelo organizador
- Upload de imagem e busca de endereço (Google Places) nas ações comunitárias
- Perfil com foto personalizável e gamificação (XP, distintivos, progresso)
- Perfil com estatísticas de reportes em quatro categorias: feitos, ativos,
  resolvidos e excluídos
- Menu lateral com reportes próximos da localização do usuário
- Navegação inferior e menu lateral acessível em todas as telas
- Tema escuro em todas as telas
