# Modularização — guideline canônico IconsAI

**Versão:** 1.0.4 · **Data:** 16/09/2026 · **Status:** canônico e obrigatório
**Vale para:** todo repositório do ecossistema, sem exceção. Canônico e obrigatório.
**Fonte única:** `iconsaiConfig/canon/MODULARIZACAO.md`. A cópia em `docs/MODULARIZACAO.md` de cada
repositório é byte a byte igual à fonte; cópia editada à mão é divergência e reprova.

**1.0.4:** o escopo do canon passa a ser declarado — os aplicativos de `APP/`, `STANDALONE/`,
`SHOWCASE/` e `AITUTOR/`, 61 repositórios, com os 10 de fora em `EXCLUSOES` e motivo escrito
(§12, §13). A §5 ganha o item 9: gate que varre lista fixa de pastas precisa incluir a raiz de
módulos, provado com sabotagem dentro da raiz nova, antes e depois.

**1.0.3:** a raiz volta a `modules/`, no plural — ordem do dono em 16/09/2026, revertendo a de
15/09: «concordo ser no plural». Com isso a raiz SAI da §11: plural é convenção de mercado (Nx,
Turborepo, Next), não decisão da casa. A §5 ganha duas exigências medidas na adoção: a config mede
as duas grafias (7) e a regra de transição lista as naturezas em inglês (8).

**1.0.2:** chave gravada no banco em inglês (§4); `node_modules` fora de `exclude`, versão fixa da
ferramenta e zero módulos como "não mediu" (§5); caminho de script citado fora do código é
contrato (§6.3); cinco sabotagens obrigatórias e o caso legítimo verde (§9); `module/` como regra
da casa que vale para todos (§11).

---

## Em uma frase

**Organize o código por domínio de negócio; dentro de cada domínio, separe a regra da tecnologia;
dê a cada pasta um nome em inglês que diga o que ela contém; e deixe uma ferramenta reprovar quem
atravessa a fronteira.**

Cada regra tem fonte de mercado, listada no fim. O que é regra da casa está numa seção separada e com
esse rótulo.

---

## 1. O que tem que ser modularizado

| entra em módulo                                          | fica fora de módulo                                               |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| regra de negócio de tela e de API                        | o roteamento do framework (`app/` do Next, `main.py` do FastAPI)  |
| serviço Python (FastAPI, cálculo)                        | infraestrutura sem domínio (cliente do banco, logger, formatação) |
| lógica de coletor, job, worker, ETL                      | o script que só dispara essa lógica (fica em `script/`, seção 6)  |
| integração com provedor externo (Twilio, Gmail, Claude…) | migrations SQL (ficam onde a ferramenta de migration exige)       |

Se o código responde a uma pergunta de negócio ("quem pode entrar?", "quanto foi consumido?",
"este commit pode ir ao ar?"), ele pertence a um módulo.

---

## 2. As seis peças, com o nome de mercado ao lado

| peça              | nome de mercado                      | o que é                                                     | pode falar com banco/rede?                      |
| ----------------- | ------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------- |
| **módulo**        | Bounded Context · Package by Feature | uma pasta por domínio de negócio, dentro de `modules/`      | —                                               |
| **contrato**      | Porta (Ports & Adapters)             | tipos, schemas e regras puras do domínio                    | **não**                                         |
| **leitura**       | Adaptador de saída                   | o único arquivo que fala com banco, rede, disco ou provedor | **sim**                                         |
| **index**         | Fachada / API pública                | a única porta de entrada para quem é de fora                | não diretamente                                 |
| **entrada**       | Adaptador de entrada / entrypoint    | `page.tsx`, `route.ts`, endpoint FastAPI, script            | não — chama a fachada                           |
| **compartilhado** | Shared kernel técnico                | código sem domínio, usado por todos, em `shared/`           | só o cliente do banco, e só para os adaptadores |

---

## 3. A forma

### TypeScript / Next.js

```
app/                          entradas: page.tsx e route.ts — finas, só chamam a fachada
modules/
  <domain>/
    index.ts                  fachada: tudo que é público sai daqui
    contrato.ts               porta: tipos, schemas (zod), regras puras
    leitura.ts                adaptador: o único que fala com o banco
    <provider>.ts             outro adaptador, quando houver (twilio.ts, gmail.ts)
    ui/                       componentes de tela deste domínio (opcional)
  <group>/<domain>/           um nível de agrupamento é permitido, com a mesma forma dentro
shared/                       sem domínio: cliente do banco, formatação, UI genérica
script/                       scripts de execução (seção 6)
```

### Python

```
<package>/
  entrypoints/                routers FastAPI e CLI — finos
  modules/
    <domain>/
      __init__.py             fachada
      contrato.py             porta: dataclasses/pydantic, funções puras
      leitura.py              adaptador: o único que fala com o banco
  shared/
script/
```

É a forma do livro _Architecture Patterns with Python_ (domain · adapters · entrypoints), recortada por
domínio em vez de uma vez para o sistema inteiro.

---

## 4. Nomes de pasta

**Toda pasta tem nome em inglês, e o nome diz o que está dentro.** Quem abre a árvore entende o
conteúdo sem abrir o arquivo.

| regra                                      | certo                               | errado                                                       |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| inglês                                     | `modules/session/`                  | `modules/sessao/`                                            |
| diz o conteúdo                             | `script/deploy/`, `script/collect/` | `script/misc/`, `script/stuff/`, `script/novos/`             |
| substantivo do domínio, não camada técnica | `modules/billing/`                  | `modules/utils/`, `modules/helpers/`, `modules/services/`    |
| minúsculas, palavras separadas por hífen   | `modules/consumer-app/`             | `modules/ConsumerApp/`, `modules/consumer_app/`              |
| sem data, sem versão, sem nome de pessoa   | `script/migrate/`                   | `script/migracao-2026-08/`, `script/v2/`, `script/fernando/` |

Python usa `_` em vez de hífen nos pacotes importáveis (`consumer_app`), porque hífen não é
identificador válido na linguagem.

**Ficam como estão**, porque o nome é imposto por ferramenta: `app/`, `public/`, `node_modules/`,
`.github/`, `supabase/migrations/`, `__tests__/`, e segmentos entre `()`, `[]` e `_` do Next.js.

**Nome próprio não se traduz**: marca, produto e sigla (`superadmin`, `rotas` como nome do aplicativo,
`cnae`, `ibge`) continuam como são.

**Pasta de rota não é renomeada.** No App Router do Next.js, o nome da pasta em `app/` (ou `pages/`)
**é** o endereço: traduzir `app/(painel)/consumo/` muda o link público `/consumo`, e quebra favorito,
link compartilhado e todo aplicativo que chama a API. Medido em 15/09/2026: **201 pastas de rota** têm
nome em português, contra **90 pastas internas**. A regra de inglês vale para as internas; a pasta de
rota segue o endereço, e endereço novo nasce em inglês.

**Chave gravada no banco segue a mesma regra.** Valor que o código compara por igualdade
(`busca`, `curadoria`, `fontes`) é nome, e vai para inglês (`search`, `curation`, `sources`), com
uma coluna de legado guardando o valor antigo para nada quebrar. Origem: decisão do dono sobre o
`rotas` em 15/09/2026, respondendo à pergunta sobre as chaves de `dim_ferramentas` — «Chaves também
em inglês (Recomendado)». Este guideline estende a decisão a todo o ecossistema.

---

## 5. As regras de fronteira

Seis regras de erro e uma de aviso. **O nome da regra é o mesmo em todo repositório**, para que o
relatório de um seja legível por quem conhece o outro.

| regra                              | em português claro                                             | severidade        |
| ---------------------------------- | -------------------------------------------------------------- | ----------------- |
| `sem-ciclo`                        | se A usa B, B não pode usar A — nem por caminho indireto       | erro              |
| `fachada-de-fora`                  | quem está fora de `modules/` só importa o `index` de um módulo | erro              |
| `fachada-modulo`                   | um módulo só importa outro módulo pelo `index` dele            | erro              |
| `porta-nao-conhece-adaptador`      | `contrato` nunca importa `leitura` nem nenhum adaptador        | erro              |
| `so-o-adaptador-fala-com-o-banco`  | só adaptadores importam o cliente do banco                     | erro              |
| `compartilhado-nao-conhece-modulo` | `shared/` nunca importa nada de `modules/`                     | erro              |
| `sem-orfao`                        | arquivo que ninguém importa é **perguntado**, nunca apagado    | **aviso, sempre** |

`sem-orfao` nunca vira erro. Órfão no grafo de imports não prova código morto: `NUNCA-FAZER §1`
registra 20 arquivos de produto apagados por serem "órfãos", e eram trabalho parado esperando voltar.

### Como cada regra é cobrada

| regra                                | TypeScript — `dependency-cruiser`                            | Python — `import-linter`               |
| ------------------------------------ | ------------------------------------------------------------ | -------------------------------------- |
| `sem-ciclo`                          | `to: { circular: true }`                                     | contrato `acyclic_siblings`            |
| `fachada-de-fora` / `fachada-modulo` | `forbidden` com `pathNot` para `index.ts` e `"^$1/"`         | contrato `protected`                   |
| `porta-nao-conhece-adaptador`        | `forbidden`: de `contrato.ts` para `leitura.ts`              | contrato `forbidden`                   |
| `so-o-adaptador-fala-com-o-banco`    | `forbidden`: de fora de `leitura.ts` para o cliente do banco | contrato `forbidden`                   |
| `compartilhado-nao-conhece-modulo`   | `forbidden`: de `^shared/` para `^modules?/`                 | contrato `forbidden`                   |
| `sem-orfao`                          | `from: { orphan: true }`, severidade `warn`                  | **não há equivalente** — medir à parte |

A config de referência em TypeScript é a do `rotas` (`.dependency-cruiser.cjs`, PR #274), a primeira do
ecossistema. Três detalhes:

1. **`"^$1/"` é a peça central.** É a referência à captura do `from.path` — "o próprio módulo, seja
   ele qual for". Sem ela seria preciso uma regra por módulo.
2. **O alvo de `so-o-adaptador-fala-com-o-banco` é preenchido por repositório** (`@supabase/supabase-js`,
   `psycopg`, `pg`…). A regra é a mesma.
3. **Não use grupo opcional ao lado de classe negada** (`(?:[^/]+/)?[^/]+`). O `dependency-cruiser`
   recusa com `has an unsafe regular expression. Bailing out.` e **aborta** — o comando pode parecer
   limpo sem ter medido nada. Escreva as alternativas explícitas, em array.
4. **`node_modules` nunca vai em `exclude`.** `exclude` apaga do grafo toda dependência para o
   caminho excluído, e `so-o-adaptador-fala-com-o-banco` fica cega: o import do cliente do banco
   some antes de chegar na regra. Quem evita entrar no pacote é `doNotFollow`, que mantém a
   dependência registrada. Medido pela prova do vermelho no piloto do superadmin: a sabotagem de
   banco passou limpa, com zero dependências registradas no contrato.
5. **A versão da ferramenta é fixa** (`dependency-cruiser` com versão exata no `package.json`).
   Regra que muda de comportamento entre versões muda o veredito sem ninguém ter mudado o código.
6. **Zero módulos cruzados é "não mediu", nunca "limpo".** O gate lê o resumo da ferramenta e
   sai com código próprio de "não pôde medir" quando nada foi cruzado.
7. **A config mede as DUAS grafias da raiz** (`modules?/`). Fixar só uma transforma a outra em
   ponto cego: o módulo escrito fora da convenção escapa de TODAS as regras de fronteira, em
   silêncio — e o relatório sai verde. Custa um caractere e cobre a migração inteira.
8. **A regra de transição lista as naturezas em inglês.** Onde a forma de dois níveis convive com
   a de três, é o nome da natureza (`class|category|tool|panel|application|service`) que separa a
   forma nova da antiga. Com a lista em português, módulo novo cai na regra do legado e é cobrado
   em `warn` onde deveria ser `error` — o gate afrouxa exatamente onde deveria apertar.
9. **Todo gate que varre uma lista fixa de pastas precisa incluir a raiz de módulos**, e a adoção
   prova isso com uma sabotagem DENTRO da raiz nova. Mover código para `modules/` sem mexer na
   lista tira esse código do alcance do gate: ele continua verde por ter deixado de olhar, não por
   o código ter ficado limpo. Medido no superadmin em 16/09/2026 (PR #181, build de produção
   `f0be5e2_20260916135709`), com `sessionStorage.setItem("x", "1")` no fim de
   `modules/accident/browser.ts`: com `roots = ["app","components","lib"]` o gate saiu **EXIT=0**,
   verde, com a sabotagem no lugar; com `modules` na lista saiu **EXIT=1**, nomeando
   `modules/accident/browser.ts: sessionStorage`. É o par antes/depois, com a MESMA sabotagem, que
   prova a cobertura — o vermelho sozinho não distingue "passou a alcançar a raiz" de "escrevi uma
   sabotagem mais fácil de pegar".

---

## 6. Scripts

A convenção de mercado é a do GitHub, _Scripts to Rule Them All_: uma pasta `script/`, e os mesmos
nomes de entrada em todo projeto, para quem chega precisar conhecer o padrão e não o projeto.

### 6.1 Os nomes de entrada

Quando a tarefa existe no projeto, o script tem este nome. Não crie o que o projeto não precisa.

| script             | o que faz                                             |
| ------------------ | ----------------------------------------------------- |
| `script/bootstrap` | instala as dependências                               |
| `script/setup`     | deixa o projeto no estado inicial depois de clonar    |
| `script/update`    | atualiza depois de um pull: dependências e migrations |
| `script/server`    | sobe a aplicação                                      |
| `script/test`      | roda testes e lint                                    |
| `script/cibuild`   | o que o CI roda                                       |
| `script/console`   | abre um console da aplicação                          |

Os scripts npm (`npm run test`, `npm run build`) continuam existindo e chamam esses mesmos arquivos.

### 6.2 Os demais scripts, agrupados pelo que fazem

| pasta                  | o que contém                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `script/deploy/`       | preparar, publicar, registrar e verificar deploy                                     |
| `script/gate/`         | verificações que reprovam (harness, contratos, fronteira)                            |
| `script/collect/`      | coletores e ingestão de dados externos                                               |
| `script/database/`     | operações de banco que não são migration: backup, verificação, bundle                |
| `script/seed/`         | carga de dados iniciais ou de teste                                                  |
| `script/migrate-data/` | migração de **dados** pontual (a migration de schema fica em `supabase/migrations/`) |
| `script/report/`       | geração de relatório e medição                                                       |

### 6.3 Regras de script

1. **Script é entrada, não regra de negócio.** Ele lê argumentos, chama a fachada de um módulo e
   devolve o exit code. A lógica fica no módulo.
2. **Todo script tem cabeçalho** com três linhas: o que faz, como se roda, o que ele toca (banco,
   rede, disco, produção).
3. **Todo script é alcançável**: referenciado por `package.json`, pelo CI, por agendador (cron,
   launchd, systemd) ou pela documentação. Script sem referência é **perguntado**, nunca apagado.
4. **Exit code real**: `0` deu certo · diferente de `0` falhou. Nunca `|| true` para esconder falha.
5. **Nenhum segredo no arquivo.** Credencial vem do ambiente.
6. **Caminho de script citado fora do código é contrato.** Se o deploy empacota o script por nome,
   um processo o dispara por caminho, uma sincronização com `--delete` copia a pasta ou uma unit
   do systemd aponta para ele, renomear exige atualizar **todas** essas referências no mesmo
   commit e provar que o deploy encontra o arquivo. Medido no `rotas`: renomear um coletor sem
   mexer na lista do deploy e no mapa de disparo faz a sincronização apagar o arquivo antigo e o
   job falhar como `script_not_found`, sem erro no deploy.

---

## 7. Sanitização de scripts

A sanitização segue a skill `skill-codebase-sanitizer`: não cria funcionalidade, não altera regra de
negócio sem evidência de defeito, e **não remove nada sem evidência de que está morto**
(`grep` + `git log` + referência zero), com cada remoção registrada e justificada.

Ordem, por repositório:

1. **Inventário.** Cada script com: caminho, linguagem, quem o referencia, última alteração no git,
   se toca banco, rede ou produção, e se contém segredo.
2. **Classificação:**

   | estado           | o que é                                           | o que se faz                                                           |
   | ---------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
   | `ativo`          | referenciado e funcionando                        | move para a pasta certa com `git mv` e atualiza todas as referências   |
   | `sem-referencia` | ninguém chama                                     | **pergunta** à frente dona; nunca apaga por conta própria              |
   | `duplicado`      | mesmo script em mais de um repositório            | candidato a um só lugar compartilhado; reportado, não fundido às cegas |
   | `arquivado`      | já está em `deprecated/`, `_archived/` ou similar | reportado com a data do último uso; decisão da frente dona             |
   | `com-segredo`    | credencial escrita no arquivo                     | retirada do arquivo e **aviso imediato ao dono** para rotacionar       |

3. **Renomear pastas para inglês** (seção 4) e aplicar as regras de script (seção 6.3).
4. **Prova:** build e testes verdes, e **todo caminho citado em `package.json`, CI e agendador existe**
   depois da mudança. Script movido cuja referência quebrou é regressão.

---

## 8. Como adotar sem ficar vermelho no primeiro dia

A ordem é esta, e cada passo só começa quando o anterior terminou.

1. **Escrever a config** com as regras da seção 5, com os nomes exatos.
2. **Gerar o baseline** das violações que já existem (`--output-type baseline`). No `rotas` foram 74.
3. **Ligar no CI** com o baseline (`--ignore-known`). A partir daqui, violação **nova** reprova.
4. **Provar que o gate morde** (seção 9), antes de confiar nele.
5. **Pagar a dívida módulo a módulo.** Mover arquivo é `git mv`; nada é apagado por parecer órfão.
6. **O baseline só encolhe.** Baseline que cresce é regressão, e o CI reprova.
7. **Consolidar a raiz em `modules/` por último.** No `rotas`, apontar o gate para a raiz certa antes da
   hora produziria 261 reprovações contra 124: gate que reprova o que ninguém pode consertar hoje só
   ensina a ser ignorado.

Repositório com a forma antiga pode ligar `fachada-modulo-legado` (a mesma regra de `fachada-modulo`
para a forma antiga) em **aviso** durante a transição. Ela sai quando a forma antiga acabar.

---

## 9. Prova do vermelho — obrigatória

Um gate só vale depois de provado que ele reprova. Três sabotagens, numa base que você **acabou de ver
limpa**, e cada uma tem de reprovar **pela regra certa** — conferir só o exit code não basta:

| #   | sabotagem                                                           | tem de reprovar por                           |
| --- | ------------------------------------------------------------------- | --------------------------------------------- |
| 1   | `contrato` importa `leitura` do mesmo módulo                        | `porta-nao-conhece-adaptador` (e `sem-ciclo`) |
| 2   | um módulo importa um arquivo interno de outro                       | `fachada-modulo`                              |
| 3   | uma rota em `app/api/` importa um arquivo interno de um módulo      | `fachada-de-fora`                             |
| 4   | um arquivo de módulo que não é adaptador importa o cliente do banco | `so-o-adaptador-fala-com-o-banco`             |
| 5   | um arquivo de `shared/` importa um módulo                           | `compartilhado-nao-conhece-modulo`            |

A terceira é a que pegou o buraco no `rotas`: a primeira regra só olhava imports nascidos dentro da
raiz de módulos, e 53 violações vindas de `app/api/` estavam invisíveis.

**Todo repositório tem também um caso que prova que o gate RODA**, não só que passa: uma config
inválida que aborta é indistinguível de um repositório sem violações. E um caso legítimo — um
módulo importando outro pela fachada — tem de continuar verde: gate que reprova o caminho certo
obriga a desligá-lo.

---

## 10. Vocabulário compartilhado entre repositórios

Onde o conceito é o mesmo em dois repositórios, o nome do módulo é o mesmo. Nos demais, cada domínio
usa a própria linguagem, traduzida para inglês na pasta — a tabela do banco não muda de nome por isso.

| módulo         | o que é                                                                 | não confundir com  |
| -------------- | ----------------------------------------------------------------------- | ------------------ |
| `session`      | a sessão autenticada e o seu ciclo de vida (token, validade, renovação) | `superadmin`       |
| `superadmin`   | a **pessoa** administradora e a sua identificação                       | `session`          |
| `consumer-app` | o **aplicativo** que consome dados por credencial própria               | uma pessoa         |
| `issuer`       | quem emite o token do ecossistema (JWK pública)                         | quem só o verifica |

"A sessão expirou" é `session`. "O administrador foi revogado" é `superadmin`. Pedem tratamentos
opostos, e por isso vivem em módulos diferentes.

---

## 11. Regras da casa — NÃO são padrão de mercado

Estas regras existem no ecossistema e **não aparecem em nenhuma fonte de mercado**.

| regra da casa                                            | origem                                                           | onde vale                            |
| -------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------ |
| todo cálculo e orquestração em Python; a tela só formata | skill `$modular`, Lei 6                                          | só em repositório com `modular.json` |
| teto de 400 linhas por arquivo                           | skill `$modular`, Lei 1 (caso medido: rota de 2.194 → 33 linhas) | só em repositório com `modular.json` |
| determinismo e idempotência medidos por dupla execução   | skill `$modular`, Leis 3 e 4                                     | só em repositório com `modular.json` |

Este guideline **não impõe** nenhuma das três. Em 15/09/2026, os repositórios com `modular.json` são
`superadmin`, `rotas`, `tools` e `Assai`; neles as duas coisas valem juntas.

---

## 12. Onde o ecossistema parte (medido em 15 e 16/09/2026)

| medida                                              | valor                                                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| repositórios no escopo                              | **61** — os aplicativos de `APP/`, `STANDALONE/`, `SHOWCASE/` e `AITUTOR/` (ordem do dono, 16/09/2026). Os 10 de fora constam em `EXCLUSOES`, cada um com motivo escrito |
| cobertura ao abrir o escopo                         | 3 de 61 (4,9%) — dizia 2 de 28 (7,1%) enquanto o denominador vinha do argumento `--raiz`, e não da lista declarada                                                       |
| repositórios sem nenhum módulo                      | 24                                                                                                                                                                       |
| módulos existentes                                  | 35 — 21 em `modules/`, 14 em `lib/modulos/`                                                                                                                              |
| grafia da raiz                                      | `modules/`, no plural, desde 16/09/2026 — a ordem de 15/09 fixava o singular, e as duas datas ficam registradas para o histórico não parecer incoerente                  |
| scripts em `scripts/`, `script/`, `bin/` e `tools/` | 1.652 — `atlas` 499, `rotas` 257, `scraping` 168, `superadmin` 135                                                                                                       |
| nomes distintos de pasta em português               | ao menos 74 (heurística; o número real é maior)                                                                                                                          |
| repositórios com ferramenta de fronteira            | `rotas` (PR #274) e `superadmin` (piloto, PR #176)                                                                                                                       |

---

## 13. Como se prova que este documento está em 100% dos projetos

- Fonte única em `iconsaiConfig/canon/MODULARIZACAO.md`.
- Cada repositório tem `docs/MODULARIZACAO.md` **com o mesmo sha256** da fonte, e uma linha no
  `CLAUDE.md`/`AGENTS.md` apontando para ele.
- `iconsaiConfig/canon/verificar_modularizacao.py` mede todos os repositórios e classifica cada um como
  `igual`, `divergente`, `ausente` ou `nao_medido`. **100% só é declarado quando todos são `igual`.**
  `nao_medido` não conta como cumprido, e worktree não conta como repositório.
- **O denominador é declarado, nunca argumentado.** Repositório fora do escopo entra em
  `EXCLUSOES` com o motivo escrito, e sai no relatório. Medido em 16/09/2026: rodar o verificador
  com `--raiz ~/projects/APP` em vez de `~/projects` derrubava a conta de 61 para 28 sem uma linha
  no relatório — um "100% cumprido" que media o argumento de linha de comando, não o ecossistema.
  Exclusão silenciosa estreita o denominador da própria medição, e é por isso que ela se escreve.

---

## Fontes

- Alistair Cockburn — [Hexagonal Architecture (Ports & Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)
- Robert C. Martin — [The Clean Architecture (Dependency Rule)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Martin Fowler — [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)
- Shopify Engineering — [Deconstructing the Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity)
- Kamil Grzybek — [Modular Monolith: A Primer](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- Spring Modulith — [Fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html)
- Jimmy Bogard — [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)
- Percival & Gregory — [Architecture Patterns with Python, cap. 4](https://github.com/cosmicpython/book/blob/master/chapter_04_service_layer.asciidoc)
- GitHub — [Scripts to Rule Them All](https://github.com/github/scripts-to-rule-them-all)
- dependency-cruiser — [Rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- Import Linter — [Documentação e tipos de contrato](https://import-linter.readthedocs.io/en/stable/)
- Next.js — [Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure)
