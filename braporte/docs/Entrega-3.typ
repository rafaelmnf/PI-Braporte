#let conf(title, doc) = {
    set page(
      paper: "a4",
      header: align(
        right + horizon,
        title
      ),
        margin: (
      top: 3cm,
      bottom: 2cm,
      left: 3cm,
      right: 2cm,
    ),
      columns: 1,
    )
    set heading(numbering: "1.a.a")
    set par(justify: true)
    set text(
      font: "Times New Roman",
      size: 11pt,
    )
  
    doc
  }
  
  #show: doc => conf(
    [Entrega 3],
    doc,
  )
#align(center)[#title("Entrega 3 PI: Projeto e implementação de aplicativos ")]
#align(center)[Grupo: Braporte - Mapa de Segurança Urbana Colaborativo ]
#figure(
image("puc.png",width: 80%),
)

#table(
  columns: (1fr, 1fr, 1fr, 1fr),
  align: center,

  [*Curso:*#linebreak()Engenharia de Computação],[*Disciplina:*#linebreak() PI: Projeto e implementação de aplicativos],[*Turma:* 0102],[*Data de Entrega:*#linebreak() 17/03/2026],

  table.cell(colspan: 4)[#align(left)[*
Artur Yano Contarelli \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_RA: 24014303 
#linebreak()
Gabriel Magnabosco Camargo\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_RA: 23008989
#linebreak()
Rafael Martiniano Nogueira Filho \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_RA: 24008538 #linebreak()
Tiago Alves Rodrigues\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_RA: 24001623*]],


  table.cell(colspan:4)[*Orientador(a):* Fernando Luiz]
)

#pagebreak()

= Implementação do Front-End

== Telas

Foram implementadas as principais interfaces para interação do usuário, incluindo a tela de Login e Cadastro (`CadastroPage.jsx`), a visualização do Mapa Principal de Segurança, o Formulário de Reporte (`ReportForm`) para criação de novos incidentes com suporte a upload de fotos, e a tela de Detalhes do Reporte (`ReportDetailsSheet.jsx`) que exibe informações aprofundadas e imagens das ocorrências.

== Navegação

A navegação foi estruturada de forma fluída no frontend, gerenciando as transições entre as telas principais de autenticação, o painel do mapa e a abertura de modais/sheets para visualização ou criação de reportes, garantindo que o estado da aplicação se mantenha consistente ao navegar.

== Organização

O código do Front-End foi desenvolvido utilizando React e estruturado de maneira modular. No diretório `frontend/src`, o projeto está dividido em subdiretórios bem definidos: `components/` abriga os componentes visuais reutilizáveis (como botões, formulários de reporte e modais), `pages/` concentra as views principais (como a página de Login, Cadastro e o Mapa Principal) atuando como contêineres, e `utils/` contém lógicas utilitárias e funções de validação de dados independentes da UI. Essa separação visa facilitar a manutenção, clareza e o reuso de código.

== Prints da Execução

_[NOTA: Inserir aqui as imagens/capturas de tela das principais telas do aplicativo em funcionamento (Login, Mapa, Formulário de reporte preenchido e Detalhes da ocorrência).]_

= Implementação do Back-End

== Estrutura das Rotas

O Back-End foi arquitetado de forma modular em Node.js com o framework Express. O sistema segue o padrão de API REST. As requisições chegam no servidor e são repassadas ao diretório `routes/`. Nele, cada entidade do sistema tem seu próprio arquivo de rotas (ex: usuários, reportes, geolocalização), que recebem as chamadas HTTP e as delegam para os respectivos controladores responsáveis pela lógica de negócio.

== Controllers implementados

Destacam-se os controladores como `reportController.js`, que centraliza a lógica de negócios para a criação e listagem de ocorrências, tratando simultaneamente a persistência de geolocalização, formatação de imagens em Base64 para binário (BYTEA), e associação de usuários de forma transacional.

== Integração com o Banco de dados

A integração foi implementada no arquivo `config/db.js`, utilizando o Supabase como provedor de banco de dados na nuvem (PostgreSQL gerenciado). A conexão é estabelecida por meio da biblioteca `pg` do Node.js, comunicando-se com a string de conexão fornecida pelo Supabase. O módulo foi preparado para gerir adequadamente queries parametrizadas e lidar com transações (`BEGIN`, `COMMIT`, `ROLLBACK`) para garantir consistência ao inserir registros em múltiplas tabelas.

== Testes realizados

_[NOTA: Descrever os testes realizados no backend, como o uso de ferramentas tipo Postman/Insomnia para validar a inserção de reportes com imagens e dados de geolocalização, ou testes unitários se existirem.]_

== Endpoints operando

Estão operacionais os endpoints essenciais para o fluxo do sistema, incluindo cadastro/login, requisições GET para obter listagens e detalhes de reportes no mapa, e POST para salvar novas ocorrências com as respectivas coordenadas e imagens associadas.

= Banco de Dados

== Modelo Atualizado

O modelo de dados passou por uma reestruturação relacional. Os dados de latitude e longitude foram migrados da tabela `reportes` para uma tabela dedicada `geolocalizacao`. Além disso, o tipo de dado para armazenamento de imagens nos reportes foi alterado de `TEXT` para `BYTEA`, reforçando a segurança e eficiência do banco.

== Scripts SQL

_[NOTA: Inserir o script SQL consolidado de criação e migração das tabelas, especialmente as estruturas de `reportes`, `geolocalizacao`, `usuario` e os alters aplicados (ex: migração para BYTEA).]_

== Tabelas Criadas

As principais tabelas criadas e em uso são: `usuario`, `reportes` (armazenando detalhes do incidente e a imagem binária da ocorrência), `geolocalizacao` (com latitude e longitude associadas) e `usuario_reporte` (responsável pelo relacionamento e tracking do autor).

== Relacionamentos Implementados

Implementou-se relacionamento com Chave Estrangeira (FK) ligando a tabela `reportes` à sua respectiva `geolocalizacao`. Também há ligações relacionando usuários aos reportes que eles criaram, com garantias de integridade referencial atualizadas.

== Conexão com o Back-End

A infraestrutura de banco de dados do projeto está hospedada no Supabase. O Back-End se conecta ao PostgreSQL remoto do Supabase mantendo um pool de conexões gerenciado centralmente pelo módulo de configuração (`db.js`). Essa abordagem com Supabase garante disponibilidade, segurança no acesso aos dados por meio de variáveis de ambiente, e estabilidade sob múltiplas requisições simultâneas.

= Evolução em relação à entrega anterior

== O que foi adicionado 

Adicionou-se suporte nativo ao envio de imagens no frontend (via câmera ou galeria), as quais são tratadas e armazenadas de forma segura como tipo `BYTEA` no backend. A estrutura relacional também foi incrementada com a nova tabela de `geolocalizacao` para dados geoespaciais, além da correção de fluxos na tabela `usuario_reporte`.

== O que Evoluiu

Houve significativa evolução na arquitetura de banco de dados, separando os dados espaciais dos dados descritivos em tabelas distintas, e na segurança, abandonando o armazenamento em texto de base64 no banco em favor de tipos de dados binários mais otimizados para mídias. O backend evoluiu implementando transações seguras.

== Quais desafios técnicos surgiram 

Os principais desafios envolveram o tratamento da conversão de strings Base64 do frontend para buffers binários no Node.js e sua respectiva recuperação para exibição; manter a integridade ao criar simultaneamente o reporte e a geolocalização vinculada (garantindo que em caso de falha, não houvesse dados órfãos); e a resolução de um bug de sobrescrita de FK (`id_usuario`) na tabela associativa.

== Como foram superados

A integridade referencial foi assegurada refatorando as queries no `reportController.js` para usar blocos de transações SQL atômicas (`BEGIN`/`COMMIT`/`ROLLBACK`). Os dados de imagem passaram por conversão com a classe `Buffer` nativa do Node.js antes da inserção, e corrigiu-se a lógica de mapeamento dos parâmetros da chave estrangeira nas queries de inserção de usuário.

== O que falta para a entrega final

_[NOTA: Descrever as etapas restantes. Sugestões: Refinamentos na UI/UX, tratamentos finais de erros, implementações de filtros avançados no mapa, testes de aceitação de usuário ou otimizações de deploy.]_
