# Tribunal dos Carros Autônomos — plano de implementação

## Objetivo
Construir a plataforma completa de julgamento e investigação, com uma experiência pública cinematográfica para projeção e uma área administrativa privada. Todo o conteúdo dos casos será dirigido pelo banco de dados; novos casos não exigirão mudanças no código.

## Experiência a entregar

### 1. Tribunal público
- Página inicial em `/` com arquivo confidencial do próximo caso publicado e acesso aos demais dossiês.
- Capa dinâmica “Investigation File” gerada pelo número, código, título, dificuldade, tipo e status do caso.
- Julgamento em tela cheia com progressão orientada pelos dados: relatório do incidente, decisão do algoritmo, argumentação, evidências, testemunhas, descoberta de Evidence Card, objection, veredito e placar.
- Controles de apresentação discretos, atalhos de teclado, cronômetro, pausa, tela cheia e painel secreto do apresentador acionado por `H`.
- Reprodução simplificada de vídeos e revelação automática do Evidence Card associado.
- Placar por sessão, com caso final valendo automaticamente 2 pontos.

### 2. Administração privada
- Entrada por email e senha em `/admin`; cadastro público ficará desativado.
- Dashboard com quantidade de casos, sessão atual e atalhos para gerenciamento.
- Lista de casos com status, dificuldade, contagens, ordenação e ações de editar, duplicar, visualizar e excluir.
- Formulário padronizado em seções para identificação, contexto, decisão do algoritmo, dados do incidente, evidências e testemunhas.
- Evidências e testemunhas em quantidades livres, reordenáveis e editáveis dentro do caso.
- Preview usando exatamente a mesma tela do tribunal, sem expor controles administrativos ao projetor.

### 3. Investigação multimídia
- Armazenamento privado de imagens, documentos e vídeos.
- Upload com validação de formato e tamanho; arquivos servidos apenas nos fluxos autorizados.
- Evidence Cards associados às testemunhas, com confiabilidade explicitamente “não determinada” por padrão.

## Direção visual
- Linguagem de dossiê físico contemporâneo: papel quente envelhecido, pasta, clipes, carimbos, etiquetas e marcações técnicas.
- Ambiente do tribunal com madeira escura, metal, vermelho profundo para Acusação, azul profundo para Defesa e bronze envelhecido para Tribunal.
- Tipografia editorial/documental, alta legibilidade em projetor e composição sem aparência de apresentação de slides.
- Animações curtas de abertura de arquivo, processamento de evidência, descoberta e objection, com alternativa reduzida para acessibilidade.
- Área administrativa deliberadamente distinta: funcional, densa e limpa, mantendo apenas detalhes discretos da identidade documental.

## Dados e segurança
- Criar estruturas para casos, evidências, testemunhas, Evidence Cards, sessões e resultados.
- Aplicar regras de acesso: visitantes leem apenas casos publicados; usuários autenticados administram todos os registros.
- Usar posição explícita para ordenação e operações atômicas para duplicação/reordenação.
- Salvar notas do mediador separadamente e nunca retorná-las nas consultas públicas.
- Incluir um caso demonstrativo completo baseado em “O Desvio”, inserido pelo banco, não no frontend.
- Registrar datas de criação/alteração e manter exclusões protegidas por confirmação.

## Estrutura de páginas
- `/` — seleção/início do tribunal
- `/cases/$caseId` — Investigation File e julgamento
- `/admin` — autenticação ou dashboard
- `/admin/cases` — gerenciamento
- `/admin/cases/new` — novo caso
- `/admin/cases/$caseId` — edição
- `/admin/cases/$caseId/preview` — prévia fiel

Cada página pública terá título e descrição próprios para compartilhamento e busca.

## Sequência de construção
1. Banco, regras de acesso, autenticação e armazenamento.
2. Design system documental/cinematográfico e componentes compartilhados.
3. Tribunal público completo, estados de apresentação e placar.
4. Administração, formulários, CRUD, duplicação e ordenação.
5. Uploads, testemunhas, vídeo e Evidence Cards.
6. Testes dos fluxos principais em desktop e projetor, validação móvel da administração, segurança e acessibilidade.

## Critérios de validação
- Criar, editar, duplicar, ordenar, publicar e excluir casos sem alterar código.
- Executar um caso com zero, uma ou várias testemunhas e qualquer quantidade de evidências.
- Reproduzir vídeo e revelar o card correto ao término.
- Ocultar notas e controles administrativos da apresentação pública.
- Preservar o estado da sessão e atualizar corretamente o placar.
- Confirmar peso 2 automático para caso final.
- Bloquear administração para visitantes e impedir acesso indevido a arquivos privados.
