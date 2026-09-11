# Autonomous Verdict

PRD — Tribunal dos Carros Autônomos

Versão 2 — Plataforma de Julgamento e Investigação

1. Conceito do produto

Tribunal dos Carros Autônomos é uma aplicação web para conduzir uma dinâmica acadêmica de julgamento envolvendo decisões tomadas por veículos autônomos.

A experiência deve combinar três conceitos:

tribunal — acusação, defesa, juiz, veredito e pontuação;

investigação — casos, evidências, testemunhas, documentos e arquivos confidenciais;

tecnologia — inteligência artificial, sensores, algoritmos e sistemas autônomos.

O produto não deve parecer simplesmente um sistema de slides.

A experiência deve transmitir a sensação de que os participantes estão abrindo e investigando um arquivo confidencial de um incidente envolvendo um veículo autônomo.

2. Conceito visual principal: Investigation File

Cada caso deve possuir uma representação visual de um Investigation File.

Exemplo conceitual:

┌──────────────────────────────────────┐
│                                      │
│          TOP SECRET                  │
│                                      │
│       INVESTIGATION FILE             │
│                                      │
│       CASE #001                      │
│                                      │
│       THE DETOUR                     │
│                                      │
│       AUTONOMOUS VEHICLE             │
│       INCIDENT                      │
│                                      │
│  STATUS: CLASSIFIED                  │
│                                      │
└──────────────────────────────────────┘

A referência visual enviada deve orientar o design, mas não precisa ser reproduzida literalmente.

O sistema deve utilizar elementos como:

papel envelhecido;

pastas;

carimbos;

etiquetas;

códigos de caso;

números de evidência;

documentos;

fotografias;

clips;

marcações;

áreas de "CONFIDENTIAL";

"CASE FILE";

"EVIDENCE";

"WITNESS STATEMENT";

"VERDICT".

A estética deve ser cinematográfica, porém suficientemente limpa para continuar funcional em uma apresentação.

3. Dois ambientes principais

3.1. Admin

Área privada para preparação da dinâmica.

O administrador deve conseguir:

criar casos;

editar casos;

excluir casos;

ordenar casos;

definir dificuldade;

cadastrar evidências;

cadastrar testemunhas;

adicionar vídeos;

cadastrar evidence cards;

configurar o caso final;

visualizar uma prévia do caso;

iniciar uma sessão de julgamento.

3.2. Tribunal

Modo utilizado durante a apresentação.

O apresentador não deve enxergar formulários administrativos.

A interface deve ser cinematográfica e otimizada para projetor.

Fluxo:

Investigation File
        ↓
Apresentação do caso
        ↓
Decisão do algoritmo
        ↓
Argumentação
        ↓
Evidências
        ↓
Testemunhas
        ↓
Evidence Cards
        ↓
Objection
        ↓
Veredito
        ↓
Placar

4. Painel administrativo

A rota administrativa pode ser:

/admin

Dashboard:

TRIBUNAL DOS CARROS AUTÔNOMOS

ADMINISTRATIVE CONTROL

┌─────────────────────────────────────┐
│ CASOS                               │
│ 5 cadastrados                      │
│                                     │
│ [ GERENCIAR CASOS ]                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SESSÃO ATUAL                        │
│ Caso 03                             │
│                                     │
│ [ CONTINUAR JULGAMENTO ]            │
└─────────────────────────────────────┘

5. Gerenciamento de casos

Página:

/admin/cases

Exibir lista:

CasoTítuloDificuldadeEvidênciasTestemunhasStatus01O Desvio★★40Publicado02Passageiros vs. Pedestres★★★51Publicado03Quem é Responsável?★★★★51Rascunho04Informação Imperfeita★★★★41Publicado05A Decisão Impossível★★★★★82Publicado

Botão principal:

+ NOVO CASO

Cada registro deve possuir:

[ EDITAR ]
[ DUPLICAR ]
[ VISUALIZAR ]
[ EXCLUIR ]

A função Duplicar Caso é recomendada porque permitirá criar rapidamente variações de casos.

6. Formulário padronizado de cadastro de caso

Esse é um dos pontos mais importantes da aplicação.

A criação de um caso deve ser estruturada em seções.

Seção A — Identificação

Campos:

Número do caso
[ 01 ]

Código do caso
[ AV-001 ]

Título
[ O Desvio ]

Subtítulo
[ Passageiros vs. Pedestres ]

Nível de dificuldade
[ ★★☆☆☆ ]

Tipo
( ) Caso normal
( ) Caso final

Valor do caso
[ 1 ] pontos

7. Seção B — Contexto do incidente

Campos:

Resumo curto
────────────────────────────
Um veículo autônomo transportava
três passageiros quando...
────────────────────────────

Descrição completa
────────────────────────────
[ editor de texto ]

────────────────────────────

Questão central
────────────────────────────
A decisão do algoritmo foi justificável?

O resumo curto será utilizado na capa do Investigation File.

A descrição completa será utilizada durante a apresentação.

8. Seção C — Decisão do algoritmo

O administrador cadastra explicitamente a decisão.

DECISÃO DO ALGORITMO

Título
[ PROTEGER OS PASSAGEIROS ]

Descrição
[ O sistema decidiu continuar em frente... ]

Justificativa conhecida
[ ... ]

Nível de revelação
[ Revelar durante o caso ]

Importante: a justificativa pode ser separada da decisão.

Isso permite que o apresentador revele inicialmente:

"O algoritmo decidiu proteger os passageiros."

e somente posteriormente revele informações que explicam por que o algoritmo tomou essa decisão.

9. Seção D — Dados do incidente

Opcionalmente, o caso pode possuir dados estruturados:

PASSAGEIROS
[ 3 ]

PEDESTRES
[ 5 ]

TEMPO PARA DECISÃO
[ 0.8 segundos ]

VELOCIDADE DO VEÍCULO
[ 62 km/h ]

CHANCE DE SOBREVIVÊNCIA
[ 85% ]

LOCAL
[ Avenida urbana ]

CONDIÇÕES CLIMÁTICAS
[ Chuva ]

VISIBILIDADE
[ Parcial ]

Esses dados podem ser usados posteriormente para gerar pequenos cards visuais durante o julgamento.

10. Seção E — Evidências

O administrador deve poder adicionar quantas evidências quiser.

Interface:

EVIDÊNCIAS

┌──────────────────────────────────┐
│ #01 — TEMPO DE REAÇÃO            │
│ O veículo tinha 0,8 segundo...   │
│                                  │
│ [ EDITAR ] [ ↑ ] [ ↓ ] [ EXCLUIR]│
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ #02 — TRAVESSIA IRREGULAR        │
│ Dois pedestres estavam...        │
│                                  │
│ [ EDITAR ] [ ↑ ] [ ↓ ] [ EXCLUIR]│
└──────────────────────────────────┘

[ + ADICIONAR EVIDÊNCIA ]

A ordem deve ser controlável pelo administrador.

Isso é importante porque a ordem de revelação faz parte da dinâmica.

11. Formulário de evidência

Cada evidência terá:

Número
[ 01 ]

Título
[ Tempo de reação ]

Descrição
[ O veículo tinha apenas 0,8 segundo... ]

Categoria
[ Dados do sistema ]

Importância
[ Alta ]

Momento de revelação
[ Fase de evidências ]

Imagem opcional
[ Upload ]

Documento opcional
[ Upload ]

Observação para o apresentador
[ Usar esta evidência para contestar... ]

A observação para o apresentador não deve aparecer para os participantes.

Isso permite que vocês tenham uma espécie de "nota do mediador":

"Esta evidência pode favorecer inicialmente a Defesa, mas a Acusação pode argumentar que..."

12. Testemunhas

Alguns casos possuirão testemunhas fictícias.

No cadastro do caso:

TESTEMUNHAS

[ + ADICIONAR TESTEMUNHA ]

Exemplo:

┌────────────────────────────────────┐
│ TESTEMUNHA #01                     │
│                                    │
│ Nome: Helena Martins               │
│ Função: Testemunha ocular          │
│                                    │
│ Vídeo: ✓                           │
│ Evidence Card: ✓                   │
│                                    │
│ [ EDITAR ]                         │
└────────────────────────────────────┘

13. Cadastro de testemunha

Campos:

Nome
[ Helena Martins ]

Identificação
[ Testemunha ocular ]

Descrição
[ Pessoa que estava próxima ao local... ]

Introdução do mediador
[ "A próxima testemunha estava..." ]

Vídeo da testemunha
[ Upload / Selecionar vídeo ]

Duração
[ 00:47 ]

Evidence Card associado
[ Evidence #04 ]

14. Vídeos de testemunhas

O sistema deve permitir anexar um vídeo diretamente ao caso.

Formatos recomendados:

MP4;

WebM;

MOV.

Durante a apresentação:

┌─────────────────────────────────────┐
│                                     │
│         TESTEMUNHA #01              │
│                                     │
│       HELENA MARTINS                │
│                                     │
│       WITNESS STATEMENT             │
│                                     │
│           ▶                         │
│                                     │
└─────────────────────────────────────┘

O vídeo deve abrir em modo de apresentação.

Controles administrativos:

Play
Pause
Volume
Tela cheia
Reiniciar

Não exibir controles complexos aos espectadores.

15. Evidence Card após testemunho

Esse é um elemento importante da dinâmica.

O vídeo não deve simplesmente terminar e voltar para a lista de evidências.

Após o testemunho, deve existir uma revelação:

WITNESS STATEMENT
        ↓
PROCESSING EVIDENCE
        ↓
NEW EVIDENCE DISCOVERED

Então:

╔════════════════════════════════════╗
║            EVIDENCE #04            ║
║                                    ║
║       DECLARAÇÃO DA TESTEMUNHA     ║
║                                    ║
║ "O veículo não tentou frear        ║
║  antes de realizar a manobra."    ║
║                                    ║
║        WITNESS: HELENA MARTINS     ║
╚════════════════════════════════════╝

Esse Evidence Card deve ser cadastrado previamente pelo administrador.

16. Modelo de Evidence Card de testemunha

Campos:

Título
[ Declaração sobre a frenagem ]

Conteúdo
[ A testemunha afirmou que... ]

Fonte
[ Helena Martins ]

Tipo
[ Testemunho ]

Confiabilidade
[ Não determinada ]

Relacionamento
[ Testemunha #01 ]

Revelar automaticamente após vídeo
[ ✓ ]

Observação do mediador
[ Perguntar à Defesa se... ]

A aplicação não deve afirmar automaticamente que o testemunho é verdadeiro.

O próprio caráter da evidência pode ser parte da discussão.

17. Tipos de evidência

O sistema deve suportar categorias:

SENSOR
TESTEMUNHO
DOCUMENTO
DADO DO SISTEMA
LEGISLAÇÃO
REGISTRO
DECLARAÇÃO
FOTOGRAFIA
LOG DO VEÍCULO
OUTRO

Isso permite que visualmente cada evidência possua uma identificação diferente.

Exemplo:

[EVIDENCE]
[WITNESS]
[DOCUMENT]
[SYSTEM LOG]

18. Investigation File — tela do caso

Quando o apresentador inicia um caso, a primeira tela não deve mostrar imediatamente o problema.

Primeiro aparece o arquivo.

Exemplo:

┌───────────────────────────────────────────────┐
│                                               │
│               CLASSIFIED                     │
│                                               │
│         AUTONOMOUS VEHICLE                   │
│          INVESTIGATION FILE                  │
│                                               │
│             CASE AV-001                      │
│                                               │
│              THE DETOUR                      │
│                                               │
│         INCIDENT REPORT                      │
│                                               │
│        STATUS: UNDER REVIEW                  │
│                                               │
│              [ OPEN FILE ]                   │
│                                               │
└───────────────────────────────────────────────┘

Ao clicar:

OPENING CASE FILE...

E a pasta é "aberta" visualmente.

19. Estrutura visual do Investigation File

A capa pode utilizar:

textura de papel;

sombra;

cantos imperfeitos;

carimbos;

etiquetas;

clips;

códigos;

pequenas marcações manuscritas;

número do processo;

classificação;

status.

Por exemplo:

CASE NO. AV-003
FILE STATUS: CONFIDENTIAL
INCIDENT TYPE: AUTONOMOUS VEHICLE
JURISDICTION: CLASSROOM TRIBUNAL

A intenção é fazer o participante sentir que está abrindo um dossiê de investigação.

20. Capa dinâmica

Cada caso deve ter uma capa gerada automaticamente a partir dos dados cadastrados.

O administrador não precisa desenhar a capa.

O sistema utiliza:

Número do caso
Título
Código
Tipo de incidente
Nível de dificuldade
Status

para gerar a composição.

Isso também permite que casos futuros sejam cadastrados sem alterar código.

21. Estrutura de dados revisada

O modelo de dados deve ser ampliado.

type Case = {
  id: string
  number: number
  code: string
  title: string
  subtitle?: string

  difficulty: number
  isFinal: boolean
  points: number

  summary: string
  description: string
  centralQuestion: string

  algorithmDecision: AlgorithmDecision

  incidentData?: IncidentData

  evidence: Evidence[]
  witnesses: Witness[]

  createdAt: string
  updatedAt: string

  status: "draft" | "published"
}

Decisão:

type AlgorithmDecision = {
  title: string
  description: string
  justification?: string
}

Dados:

type IncidentData = {
  passengers?: number
  pedestrians?: number
  decisionTime?: number
  vehicleSpeed?: number
  survivalProbability?: number
  location?: string
  weather?: string
  visibility?: string
}

Evidência:

type Evidence = {
  id: string
  number: number
  title: string
  description: string

  category: EvidenceCategory

  importance?: "low" | "medium" | "high"

  imageUrl?: string
  documentUrl?: string

  presenterNote?: string
}

Testemunha:

type Witness = {
  id: string
  name: string
  role: string
  description?: string

  videoUrl: string

  evidenceCard?: EvidenceCard
}

Evidence Card:

type EvidenceCard = {
  id: string
  title: string
  content: string

  source: string
  type: EvidenceCategory

  reliability?: "unknown" | "low" | "medium" | "high"

  presenterNote?: string
}

22. Arquitetura recomendada

Para o MVP, eu mudaria a recomendação anterior de "somente localStorage" dependendo de como vocês pretendem administrar o projeto.

Se o projeto será utilizado apenas em um computador, localStorage continua sendo suficiente para os dados dos casos.

Porém, como agora haverá:

cadastro de casos;

upload de vídeos;

imagens;

documentos;

múltiplos casos;

edição administrativa;

um backend simples passa a fazer sentido.

Uma arquitetura coerente seria:

Frontend
React + TypeScript
        │
        ↓
Supabase
 ├── PostgreSQL
 ├── Storage
 └── Auth

Estrutura:

cases
evidence
witnesses
evidence_cards
case_results
sessions

Storage:

/cases/{caseId}/
    cover/
    evidence/
    witnesses/

Isso é especialmente útil para os vídeos das testemunhas.

23. Autenticação

O público não deve acessar o painel administrativo.

Estrutura:

/              → Tribunal
/admin         → Login
/admin/cases   → Gerenciamento
/admin/cases/new
/admin/cases/:id

No MVP:

um único administrador;

autenticação por email/senha;

sem sistema complexo de permissões.

24. Modo de preparação

O administrador deve conseguir visualizar um caso inteiro antes de apresentá-lo.

Botão:

[ PREVIEW CASE ]

Isso abre exatamente a mesma experiência que os participantes verão.

Também deve existir:

[ EDIT CASE ]

e:

[ START TRIAL ]

25. Modo apresentação

Uma vez iniciado o julgamento, a interface deve esconder completamente elementos administrativos.

Não deve haver:

sidebar administrativa;

tabelas;

formulários;

IDs técnicos;

botões de edição.

Apenas elementos relacionados ao julgamento.

26. Painel secreto do apresentador

Pode existir uma pequena camada opcional para o apresentador.

Por exemplo, ao pressionar H:

PRESENTER PANEL

Current phase:
Evidence #03

Next:
Witness #01

Hidden note:
"Essa evidência favorece inicialmente a Defesa."

[ NEXT ]
[ OBJECTION ]
[ PAUSE ]

Esse painel não deve aparecer no projetor.

Uma implementação ainda melhor seria utilizar uma segunda janela:

PROJETOR
    ↓
Trial Screen

NOTEBOOK
    ↓
Presenter Control

Mas isso pode ficar para uma segunda versão.

27. Direção artística revisada

Aqui eu faria uma mudança significativa em relação ao PRD anterior.

Não faria uma interface simplesmente "dark tecnológica".

O visual deve ser:

Tribunal contemporâneo + investigação policial + tecnologia autônoma.

Referências conceituais:

INVESTIGATION FILE
       +
COURTROOM
       +
AUTONOMOUS VEHICLE
       +
CLASSIFIED DOCUMENT

A referência que você enviou é particularmente adequada para a camada de investigação.

A camada de tribunal pode utilizar:

madeira escura;

metal;

papel;

vermelho profundo;

azul escuro;

dourado envelhecido;

preto;

branco quente.

28. Identidade visual dos lados

Acusação:

ACCUSATION

Associada a vermelho escuro.

Defesa:

DEFENSE

Associada a azul escuro.

Tribunal:

COURT

Associado a dourado/bronze.

Evidência:

EVIDENCE

Associada a papel/documento.

Testemunha:

WITNESS

Associada a uma identificação documental.

29. Exemplo de experiência completa

O fluxo de um caso poderia ser:

                 START TRIAL
                      ↓
             INVESTIGATION FILE
                      ↓
                 OPEN FILE
                      ↓
              INCIDENT REPORT
                      ↓
             ALGORITHM DECISION
                      ↓
             ACCUSATION ARGUES
                      ↓
               DEFENSE ARGUES
                      ↓
              EVIDENCE #01
                      ↓
              EVIDENCE #02
                      ↓
              WITNESS STATEMENT
                      ↓
                 VIDEO
                      ↓
            EVIDENCE CARD REVEAL
                      ↓
              EVIDENCE #04
                      ↓
                OBJECTION!
                      ↓
                FINAL ARGUMENT
                      ↓
                 THE VERDICT
                      ↓
                 SCORE UPDATE
                      ↓
                NEXT CASE

Isso deixa a dinâmica muito mais próxima de uma experiência investigativa do que de uma apresentação convencional.

30. Requisito importante: conteúdo não deve estar hardcoded

Esse passa a ser um requisito fundamental.

O frontend não deve possuir:

if (case === 1) ...
if (case === 2) ...

Toda a apresentação deve ser baseada nos dados cadastrados.

Por exemplo:

Case
 ├── metadata
 ├── scenario
 ├── decision
 ├── evidence[]
 │
 └── witnesses[]
       └── evidenceCard

Assim, você poderá criar um sexto, sétimo ou décimo caso pelo painel administrativo sem modificar o código da aplicação.

31. Critérios de aceitação adicionais

AC15

O administrador consegue criar um novo caso através de um formulário padronizado.

AC16

O administrador consegue editar um caso existente.

AC17

O administrador consegue ordenar as evidências.

AC18

O administrador consegue associar uma testemunha a um caso.

AC19

O administrador consegue adicionar um vídeo de testemunha.

AC20

O administrador consegue cadastrar o Evidence Card associado ao testemunho.

AC21

O vídeo pode ser reproduzido durante o julgamento.

AC22

O Evidence Card pode ser revelado após o vídeo.

AC23

O caso pode possuir zero, uma ou várias testemunhas.

AC24

O caso pode possuir qualquer quantidade de evidências.

AC25

A apresentação funciona independentemente de como o caso foi cadastrado.

AC26

O Investigation File é gerado automaticamente a partir dos metadados do caso.

AC27

O modo administrativo e o modo apresentação possuem interfaces visualmente distintas.

AC28

Um caso cadastrado como "final" recebe automaticamente peso de 2 pontos.

32. MVP revisado

Eu dividiria o desenvolvimento em três blocos.

MVP 1 — Tribunal

Home;

casos;

Investigation File;

apresentação;

decisão;

evidências;

cronômetro;

Objection;

julgamento;

placar;

caso final.

MVP 2 — Administração

login;

CRUD de casos;

CRUD de evidências;

ordenação;

publicação/rascunho;

preview;

configuração do caso final.

MVP 3 — Investigação multimídia

upload de vídeos;

testemunhas;

reprodução de vídeos;

Evidence Cards;

imagens/documentos;

efeitos sonoros;

animações avançadas.

Isso permite colocar o sistema para funcionar rapidamente e depois adicionar a camada de "investigação" sem comprometer a funcionalidade básica.

Uma decisão de design que considero particularmente importante

Eu não faria o Investigation File apenas como uma imagem decorativa na abertura.

Faria dele uma metáfora de navegação.

Por exemplo, ao entrar no Caso 03:

┌─────────────────────────────────────┐
│                                     │
│       CONFIDENTIAL                  │
│                                     │
│       CASE AV-003                   │
│                                     │
│       WHO IS RESPONSIBLE?           │
│                                     │
│       ───────────────────────       │
│                                     │
│       INCIDENT REPORT               │
│       SYSTEM LOG                    │
│       WITNESS STATEMENT             │
│       EVIDENCE                      │
│       VERDICT                       │
│                                     │
│             [ OPEN FILE ]           │
│                                     │
└─────────────────────────────────────┘

E, conforme o julgamento progride, o sistema vai "abrindo" o dossiê.

Isso cria uma linguagem visual consistente:

Caso = dossiê.
Evidência = documento.
Testemunha = depoimento.
Vídeo = registro audiovisual.
Evidence Card = nova descoberta.
Objection = contestação judicial.
Veredito = decisão do tribunal.

Essa estrutura também resolve um problema importante do projeto: os casos deixam de ser simplesmente "perguntas éticas" e passam a parecer incidentes investigativos concretos envolvendo sistemas autônomos. Isso tende a tornar a dinâmica consideravelmente mais imersiva.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/640281a8-0a40-4b33-9583-29f9303be875).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
