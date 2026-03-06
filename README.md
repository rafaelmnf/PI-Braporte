# Braporte

## Estrutura do Projeto

```
braporte/
├── server.js              # Servidor Node.js (http nativo)
├── package.json
├── routes/
│   └── api.js             # Rotas da API (esqueleto)
├── views/
│   ├── login.html         # Tela de login
│   └── mapa.html          # Tela do mapa + popup de reporte
└── public/
    ├── css/
    │   ├── login.css      # Estilos do login
    │   └── mapa.css       # Estilos do mapa
    ├── js/
    │   ├── login.js       # Lógica do login (validação, máscara CPF)
    │   └── mapa.js        # Lógica do mapa (popup, filtros, categorias)
    └── assets/            # Imagens e ícones (vazio por enquanto)
```

## Como Rodar

```bash
cd braporte
node server.js
```

Acesse: **http://localhost:3000**

> Não precisa de `npm install` — o servidor usa apenas módulos nativos do Node.js.

## Rotas

| Método | Rota             | Descrição                 |
|--------|------------------|---------------------------|
| GET    | `/`              | Redireciona para login    |
| GET    | `/login`         | Tela de login             |
| GET    | `/mapa`          | Tela do mapa              |
| POST   | `/api/login`     | Endpoint de autenticação  |
| POST   | `/api/reportes`  | Criar novo reporte        |
| GET    | `/api/reportes`  | Listar reportes           |

## Próximos Passos

1. **Google Maps API** — Substituir o placeholder pelo mapa real
2. **Banco de dados** — Conectar MySQL/PostgreSQL para persistir dados
3. **Autenticação real** — JWT + bcrypt para hash de senha
4. **Upload de imagens** — Multer para fotos dos reportes