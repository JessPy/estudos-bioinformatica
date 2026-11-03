# Trilha Bioinformática Sênior

Site estático de estudos para formação até nível sênior em bioinformática.

## Como usar
O progresso fica no `localStorage` do navegador. Cada sessão de teoria mostra **o trecho exato** de cada material (capítulo, lição ou seção do artigo) em “Leitura desta sessão”. O checkbox **Lido** vale por trecho e é o mesmo na sessão, no “Plano de leitura” do módulo e na página Materiais, que mostra a progressão de cada material (ex.: 2/4 trechos). Materiais sem plano de leitura mantêm o “Já vi”. Tudo entra no backup.

As **anotações** de cada sessão aceitam Markdown (títulos, negrito, listas, tarefas `- [ ]`, citações, tabelas, blocos de código e links), com os modos Escrever, Lado a lado e Visualizar. Enter continua listas e Tab/Shift+Tab ajustam a indentação.

Use **Configurações → Exportar JSON** para fazer backup.

## Estrutura
- `data/curriculum.js` — fases, áreas e 33 módulos (tópicos, dependências, avaliações e projetos)
- `data/materials.js` — biblioteca de materiais com tipo e nível
- `data/readings.js` — plano de leitura: trecho de cada material por sessão de teoria (chave `MÓDULO:índice do tópico`). Se mudar o texto de um trecho, a marcação “Lido” daquele trecho é reiniciada
- `data/market.js` — pesquisa de vagas (30/10/2026) e mapeamento competência → módulo
- `app.js` — geração das sessões, cronograma adaptativo e páginas
- `styles.css` — tema claro/escuro e layout responsivo

## Como o cronograma funciona
- Cada tópico gera sessões de teoria e prática. A cada 3 tópicos entra uma revisão espaçada. Cada módulo fecha com revisão geral, avaliação e projeto.
- Até 2 módulos (configurável) são intercalados. Um módulo só começa depois que os pré-requisitos foram sequenciados.
- As sessões pendentes são distribuídas a partir de hoje nos dias de estudo. Dia perdido ou folga só empurra o conteúdo; nada é descartado.
- Para editar o currículo, altere `data/curriculum.js`. Os IDs das sessões (`MÓDULO-NN`) dependem da posição, então mudar tópicos de um módulo já iniciado pode deslocar o progresso marcado nele.
