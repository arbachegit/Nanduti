# Modularização — guideline canônico IconsAI

**Versão:** 1.1.1 · **Data:** 17/09/2026 · **Status:** canônico e obrigatório
**Vale para:** todo repositório do ecossistema, sem exceção. Canônico e obrigatório.
**Modelo:** monólito modular (§0).
**Fonte única:** `superadmin/docs/MODULARIZACAO.md`, na `main` publicada do repositório `superadmin`.
Toda mudança nasce lá, por PR, e só depois é propagada. `iconsaiConfig/canon/MODULARIZACAO.md` e o
`docs/MODULARIZACAO.md` de cada repositório são cópias byte a byte da fonte; cópia editada à mão é
divergência e reprova.
**Implementação de referência:** o `superadmin` (§14). Onde este documento e o `superadmin`
divergirem, o documento vale e a divergência é defeito a corrigir no `superadmin` primeiro.

**1.1.1:** o contrato que o placar lê fica completo (§15): o registro das respostas a cada órfão em
`docs/ORFAOS.md`, a linha de RLS do gate de tenant, os cinco estados de um item e a prova do vermelho
do próprio placar. Escrito ao rodar o placar pela primeira vez contra `superadmin`, `rotas` e
`fiscal`: sem esses contratos, dois itens só podiam sair `nao_medido` para sempre.

**1.1.0:** ordem do dono, 17/09/2026: «Vamos usar o monólito modular.» · «Considerando que o
superadmin está no caminho correto, vamos primeiro atualizar a documentação em .md, colocar como
obrigatório em todos os projetos, sendo a raiz de mudança o do superadmin.» · «mantendo o superadmin
como best practices». O modelo passa a ter nome (§0). A fonte passa a ser o `superadmin` (cabeçalho,
§13). Entram as regras que a avaliação de 17/09/2026 mediu faltando no `superadmin`, no `rotas` e no
`fiscal`: o gate só vale ligado no CI (§5, item 10); o cliente do banco é cobrado no repositório
inteiro e por todo caminho que o entrega (§5, itens 11 e 12); cada tabela tem um módulo dono (§5.1);
tenant não é módulo (§5.2); componente de cliente não importa a fachada (§3). Entram também a
implementação de referência (§14), a definição mensurável de pronto (§15) e o modo de trabalho entre
sessões (§16). A prova do vermelho passa de cinco para oito sabotagens (§9).

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

## 0. O modelo: monólito modular

**Um aplicativo, um deploy, dividido por dentro em módulos de negócio com fronteira cobrada por
ferramenta.** É o _modular monolith_ de Simon Brown, Kamil Grzybek, Shopify (Packwerk) e Spring
Modulith. Decisão do dono em 17/09/2026, depois de comparar com camadas, vertical slice, hexagonal,
clean architecture, DDD, microsserviços, Feature-Sliced Design e multi-tenancy.

O monólito modular deste documento combina quatro ideias de mercado, cada uma com um papel:

| ideia de mercado                    | o que ela decide aqui                                      | onde está  |
| ----------------------------------- | ---------------------------------------------------------- | ---------- |
| Bounded Context (DDD)               | **onde** corta: um módulo por domínio de negócio           | §1, §2, §4 |
| Ports & Adapters (leve)             | **dentro** do módulo: regra pura separada de banco e rede  | §2, §3     |
| Modular monolith: dono dos dados    | **quem** lê e escreve cada tabela                          | §5.1       |
| Fronteira verificada por ferramenta | **quem cobra**: um gate no CI, não a disciplina de ninguém | §5, §9     |

**Por que não os outros:**

| modelo                      | por que não é o modelo do ecossistema                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| camadas (package by layer)  | espalha uma funcionalidade por várias pastas e não tem fronteira entre domínios                                                                                                                |
| microsserviços              | um deploy por serviço, rede entre módulos e um banco por serviço: custo operacional que nenhum aplicativo daqui precisa hoje. Módulo bem isolado pode virar serviço depois, e esse é o caminho |
| Clean Architecture completa | camadas e mapeamentos demais para CRUD; a regra de dependência dela já está na §5 (`porta-nao-conhece-adaptador`)                                                                              |
| Feature-Sliced Design       | é só de front-end; a regra de camada dela não cobre API, banco nem Python                                                                                                                      |
| multi-tenancy               | não é modelo de modularização: é outro eixo, e a §5.2 diz como ele convive com os módulos                                                                                                      |

**O que o monólito modular NÃO promete:** escala independente por módulo e deploy de um módulo só.
Os dois continuam sendo do aplicativo inteiro.

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

**Componente de cliente não importa a fachada.** No Next.js, `index.ts` reexporta o `leitura.ts`, e
o `leitura.ts` puxa o cliente do banco e `server-only`. Um arquivo com `"use client"` que importa a
fachada arrasta o servidor para o navegador e o build quebra (ou pior: vaza o que não devia). Por
isso a tela do domínio mora em `modules/<domain>/ui/` e importa `../contrato`, nunca `..` nem
`../index`. Medido no `superadmin` em 16/09/2026, na criação de `modules/conversation` (PR #184).

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

A config de referência em TypeScript é a do `superadmin` (`.dependency-cruiser.cjs`, PRs #176, #179 e
#183), com o gate `scripts/harness/fronteira_modulos.py`. A primeira do ecossistema foi a do `rotas`
(PR #274); a do `superadmin` passou a ser a referência em 17/09/2026 porque a do `rotas`, medida em
`origin/main` `e1471016`, ainda tem dois buracos que o `superadmin` fechou (itens 11 e 13: o alvo do
banco é só o pacote, embora `lib/rotas-db.ts` entregue um cliente, e qualquer
`modules/<x>/<y>/index.ts` é aceito como fachada) e não tem a regra `compartilhado-nao-conhece-modulo`.
Os detalhes:

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
10. **Gate que não roda no CI não foi adotado.** O gate de fronteira roda no workflow de PR e no de
    deploy, pelo script npm (ou `script/gate/`), com a ferramenta na versão fixa. Rodar à mão não
    conta. Medido em 17/09/2026: o `rotas` tinha config, baseline e script
    (`scripts/harness/gate-fronteira.sh`), e nenhum deles aparecia em `.github/`, `.githooks/` nem
    `package.json` — nenhum PR era reprovado por furar a fronteira, e o relatório de adoção dizia
    "ativo". No `superadmin`, o gate está em `gates.yml` e `deploy.yml`.
11. **O alvo do banco é todo caminho que entrega um cliente de banco, não só o pacote.** Se o
    repositório expõe o cliente por um arquivo próprio (`lib/superadmin/client.ts`,
    `shared/database/client.ts`), esse arquivo entra no alvo de `so-o-adaptador-fala-com-o-banco`
    junto com `@supabase/supabase-js`, `pg` ou `psycopg`. Medido no `superadmin` em 16/09/2026 (PR
    #183): com só o pacote no alvo, um `contrato.ts` importando `superAdminDb` saiu exit 0. A
    sabotagem nº 4 da §9 importava o pacote direto, e por isso não pegou.
12. **No fim da adoção, `so-o-adaptador-fala-com-o-banco` vale no repositório inteiro.** Durante a
    migração ela cobra dentro das raízes de módulo, e o que está fora vai para o baseline. Na
    definição de pronto (§15) ela cobra de todo arquivo: rota, página, script e `shared/` inclusive
    (este último só pode importar o cliente para entregá-lo aos adaptadores). Rota que consulta o
    banco direto é regra de negócio fora de módulo.
13. **Grupo é declarado por nome.** `modules/<grupo>/<dominio>/` só é aceito para grupo listado na
    config (`GRUPOS`). Aceitar qualquer `modules/<x>/<y>/index.ts` "para permitir grupos" transforma
    toda pasta interna com `index.ts` em fachada. Medido no `superadmin` em 16/09/2026 (PR #183): uma
    rota importando `modules/x/interno/index.ts` saiu exit 0.

### 5.1 Cada tabela tem um módulo dono

Regra de mercado do monólito modular: **cada módulo só acessa as próprias tabelas; outro módulo que
precisa do dado pede à fachada do dono**. Sem ela, a fronteira de import vale e a de dados não: dois
módulos que fazem `SELECT` na mesma tabela estão acoplados pelo banco, e o gate de imports sai verde.

| regra                   | em português claro                                                                    | severidade |
| ----------------------- | ------------------------------------------------------------------------------------- | ---------- |
| `dono-dos-dados`        | uma tabela (ou função RPC) só é lida e escrita pelo adaptador do módulo que a declara | erro       |
| `tabela-sem-dono`       | tabela citada no código sem nenhum módulo que a declare                               | erro       |
| `tabela-com-dois-donos` | a mesma tabela declarada por dois módulos                                             | erro       |

**Como se declara.** No `contrato` do módulo, uma constante com os nomes exatos, com schema quando não
for `public`:

```ts
// modules/conversation/contrato.ts
export const TABELAS = ["conversations", "conversation_blobs"] as const;
```

```python
# <package>/modules/conversation/contrato.py
TABELAS: tuple[str, ...] = ("conversations", "conversation_blobs")
```

**Como se cobra.** Não é import, então não é `dependency-cruiser`: é um gate próprio
(`gate:dono-dos-dados`), que lê as declarações e varre o código atrás de acesso a tabela
(`.from("<t>")`, `.rpc("<f>")` e SQL literal com `from`, `join`, `into` e `update`). O acesso vale só
dentro de um adaptador do módulo dono. Ficam fora da varredura só o que cria as tabelas:
`supabase/migrations/` e os arquivos de seed.

**Join entre tabelas de módulos diferentes** também é acesso ao dado de outro módulo. O caminho é pedir
à fachada do dono. Se o custo disso for inaceitável, a view (ou função) que faz o join pertence a um
dos dois módulos e é declarada nele: a decisão fica escrita, e não espalhada.

**Schema não é dono.** O schema (`raw`, `staging`, `analytics`, `public`) diz a camada do dado. O
módulo dono diz quem o lê e o escreve. Um não substitui o outro.

**O que este gate reconhecidamente NÃO mede:** nome de tabela montado em tempo de execução
(`from(variavel)`), acesso por ORM que não escreve o nome da tabela no código, e o que roda direto no
banco (trigger, cron do Postgres).

### 5.2 Tenant não é módulo

Módulo é **domínio de negócio**. Tenant é **cliente** do aplicativo. São dois eixos independentes:
Azure e AWS tratam tenancy como decisão de isolamento (silo, pool, bridge), não como forma de dividir
o código. Um `modules/<cliente>/` mistura os dois eixos e tem três efeitos medidos no desenho de
17/09/2026 para o `fiscal`: o código geral passa a morar dentro do nome de um cliente, o segundo
cliente passa a depender do primeiro, e o terceiro cliente repete tudo.

| regra                          | em português claro                                                                                        | severidade |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------- |
| `tenant-nao-e-modulo`          | nenhuma pasta em `modules/` tem o nome de um tenant declarado                                             | erro       |
| `tenant-resolvido-uma-vez`     | o tenant é resolvido num só lugar, `shared/tenant/`, a partir do host ou do caminho; ninguém mais o deduz | erro       |
| `tenant-literal-fora-do-lugar` | o identificador de um tenant (`'iconsai'`, `'labtech'`) só aparece em `shared/tenant/` e em `variants/`   | erro       |

**A forma, num aplicativo multi-tenant:**

```
shared/tenant/
  contrato.ts          TENANTS declarados, tipo Tenant, regra host → tenant (pura)
  index.ts             resolverTenant(request): a única função que decide
modules/<domain>/
  index.ts             recebe o tenant como argumento
  variants/<tenant>.ts o que muda para um tenant, e só isso
```

- **Isolamento de dados no modelo pool:** mesmo banco, `tenant_id` em toda tabela com dado de cliente e
  RLS filtrando por ele. O filtro na aplicação não substitui a RLS: é a RLS que segura o vazamento
  quando a aplicação erra.
- **O que é específico de um tenant** mora em `modules/<domain>/variants/<tenant>.ts`, escolhido pela
  fachada do domínio. `if (tenant === "labtech")` espalhado pelo código é o que a regra
  `tenant-literal-fora-do-lugar` reprova.
- **Aplicativo que não é multi-tenant** não declara `TENANTS` e não tem `shared/tenant/`. As três regras
  ficam fora do relatório com esse motivo escrito.

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

Um gate só vale depois de provado que ele reprova. Oito sabotagens, numa base que você **acabou de ver
limpa**, e cada uma tem de reprovar **pela regra certa** — conferir só o exit code não basta:

| #   | sabotagem                                                                          | tem de reprovar por                             |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | `contrato` importa `leitura` do mesmo módulo                                       | `porta-nao-conhece-adaptador` (e `sem-ciclo`)   |
| 2   | um módulo importa um arquivo interno de outro                                      | `fachada-modulo`                                |
| 3   | uma rota em `app/api/` importa um arquivo interno de um módulo                     | `fachada-de-fora`                               |
| 4   | um arquivo de módulo que não é adaptador importa o cliente do banco                | `so-o-adaptador-fala-com-o-banco`               |
| 5   | um arquivo de `shared/` importa um módulo                                          | `compartilhado-nao-conhece-modulo`              |
| 6   | um `contrato` importa o cliente de banco **do próprio repositório** (não o pacote) | `so-o-adaptador-fala-com-o-banco` (§5, item 11) |
| 7   | uma rota importa `modules/<x>/<pasta-interna>/index.ts`                            | `fachada-de-fora` (§5, item 13)                 |
| 8   | o adaptador do módulo A consulta uma tabela declarada pelo módulo B                | `dono-dos-dados` (§5.1)                         |

Aplicativo multi-tenant soma a nona: `if (tenant === "<slug>")` num arquivo de módulo fora de
`variants/`, que tem de reprovar por `tenant-literal-fora-do-lugar` (§5.2).

As sabotagens 6 e 7 são as que o `superadmin` achou buracos reais em 16/09/2026. A 8 existe porque a
fronteira de import sai verde com dois módulos lendo a mesma tabela.

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

**Medido em 17/09/2026**, em `origin/main`, na avaliação que levou à 1.1.0:

| medida                          | `superadmin` (`2785ab1`)        | `rotas` (`e1471016`)                                      | `fiscal` (`9a2998d`)            |
| ------------------------------- | ------------------------------- | --------------------------------------------------------- | ------------------------------- |
| arquivos `.ts`/`.tsx` em módulo | 16 de 337 (~5%)                 | 117 de 655 (~18%)                                         | 3 de 294 (~1%)                  |
| raízes de módulo                | 2 (`modules/`, `lib/modulos/`)  | 2, com três formas diferentes                             | 1 (`apps/api/modules/invoices`) |
| gate de fronteira no CI         | sim (`gates.yml`, `deploy.yml`) | **não** (só à mão)                                        | não existe                      |
| violações no baseline           | 2 avisos                        | 69 (53 `fachada-de-fora`, 13 órfãos, 2 de banco, 1 ciclo) | não medido                      |
| arquivos com mais de 400 linhas | 22 de 338                       | 36 de 734                                                 | 23 de 294 (um de 4.268)         |
| guideline na `main`             | 1.0.4                           | versão anterior (divergente)                              | ausente (PR #13 aberto)         |

Guideline 1.0.4 no ecossistema, na mesma data: **7 de 61** repositórios iguais à fonte (18 divergentes, 36
ausentes), medido por `canon/verificar_modularizacao.py`.

---

## 13. Como se prova que este documento está em 100% dos projetos

- Fonte única em `superadmin/docs/MODULARIZACAO.md`, lida da `main` publicada — nunca do disco.
- `iconsaiConfig/canon/MODULARIZACAO.md` é espelho da fonte, com o mesmo sha256. É dele que os scripts
  de propagação copiam, e o verificador reprova quando o espelho diverge da fonte.
- Cada repositório tem `docs/MODULARIZACAO.md` **com o mesmo sha256** da fonte, e uma linha no
  `CLAUDE.md`/`AGENTS.md` apontando para ele.
- **Mudança no guideline:** PR no `superadmin` → merge com CI verde → espelho no `iconsaiConfig` →
  `canon/atualizar_modularizacao.py` abre um PR por repositório → `canon/mergear_se_verde.py` faz o
  merge só com o CI verde, job a job. Editar o espelho ou uma cópia antes da fonte é divergência.
- `iconsaiConfig/canon/verificar_modularizacao.py` mede todos os repositórios e classifica cada um como
  `igual`, `divergente`, `ausente` ou `nao_medido`. **100% só é declarado quando todos são `igual`.**
  `nao_medido` não conta como cumprido, e worktree não conta como repositório.
- **O denominador é declarado, nunca argumentado.** Repositório fora do escopo entra em
  `EXCLUSOES` com o motivo escrito, e sai no relatório. Medido em 16/09/2026: rodar o verificador
  com `--raiz ~/projects/APP` em vez de `~/projects` derrubava a conta de 61 para 28 sem uma linha
  no relatório — um "100% cumprido" que media o argumento de linha de comando, não o ecossistema.
  Exclusão silenciosa estreita o denominador da própria medição, e é por isso que ela se escreve.

---

## 14. A implementação de referência: o `superadmin`

Ordem do dono, 17/09/2026: o `superadmin` é a _best practice_ do ecossistema. Na prática:

| o que copiar                              | de onde, no `superadmin`                                             |
| ----------------------------------------- | -------------------------------------------------------------------- |
| a forma de um módulo                      | `modules/conversation/` (fachada, porta, adaptador, `ui/`)           |
| a config de fronteira                     | `.dependency-cruiser.cjs`, com `GRUPOS` declarados                   |
| o gate, o baseline e o autoteste          | `scripts/harness/fronteira_modulos.py` (`--baseline`, `--autoteste`) |
| o gate no CI                              | `.github/workflows/gates.yml` e `deploy.yml`                         |
| os gates que varrem pastas com `modules/` | `scripts/check-service-role.sh` e `.eslintrc.json` (PR #183)         |

- **Toda regra nova entra primeiro no `superadmin`**, com a prova do vermelho, e só depois é copiada.
  Os gates `dono-dos-dados` (§5.1) e, para aplicativo multi-tenant, `tenant-*` (§5.2) nascem lá.
- **Repositório que achar um jeito melhor não diverge.** Abre PR no `superadmin` (código) ou na fonte
  deste documento (regra). Quando o PR entra, os outros copiam.
- **Cópia cita a origem:** o arquivo copiado diz de qual commit do `superadmin` veio, para que a
  divergência posterior seja medível.

---

## 15. Definição de pronto: quando um repositório está 100% modularizado

Um repositório só é declarado **100% modularizado** quando **todos** os itens abaixo são medidos na
`main` publicada e passam. Item não medido é cinza, e cinza não é verde. Não existe "pronto com
ressalva".

| #   | item                        | 100% é                                                                                                                                                                                                                                                   |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | guideline                   | `docs/MODULARIZACAO.md` com o sha256 da fonte, e ponteiro no `CLAUDE.md` e no `AGENTS.md`                                                                                                                                                                |
| 2   | código de negócio em módulo | nenhum arquivo de código em `lib/`, `components/`, `lib/modulos/` ou em qualquer pasta fora de `app/`, `modules/`, `shared/`, `script/`, testes, `supabase/` e config de raiz. Pacote Python segue a forma do §3 (`entrypoints/`, `modules/`, `shared/`) |
| 3   | forma                       | todo módulo tem `index` e `contrato`; todo módulo que faz I/O tem o adaptador; nenhuma forma antiga (`dados.ts`, `servidor.ts`) nem nome fora do §3                                                                                                      |
| 4   | uma raiz                    | só `modules/`; a config não tem mais `lib/modulos` nem a regra `fachada-modulo-legado`                                                                                                                                                                   |
| 5   | fronteira no CI             | gate **e autoteste** no workflow de PR e no de deploy, ferramenta em versão fixa; o autoteste com as oito sabotagens do §9 + o caso legítimo + o caso que prova que o gate roda                                                                          |
| 6   | baseline                    | zero violações de severidade erro. Os avisos `sem-orfao` restantes têm, cada um, a resposta da frente dona registrada                                                                                                                                    |
| 7   | banco                       | `so-o-adaptador-fala-com-o-banco` vale no repositório inteiro (§5, item 12), com o alvo completo (§5, item 11). É o **último** passo da adoção, como a raiz única (§8, passo 7): durante a migração a regra cobra só nas raízes de módulo                |
| 8   | dono dos dados              | gate `dono-dos-dados` no CI, com zero violações e 100% das tabelas citadas no código com dono (§5.1)                                                                                                                                                     |
| 9   | tenant                      | se multi-tenant: as três regras da §5.2 com zero violações, e RLS ativa em 100% das tabelas com `tenant_id`, medida no banco (`pg_policies`)                                                                                                             |
| 10  | gates que varrem pastas     | todos incluem `modules/` e `shared/`, cada um provado com a mesma sabotagem antes e depois (§5, item 9)                                                                                                                                                  |
| 11  | nomes                       | pastas internas em inglês (§4) e scripts em `script/<grupo>/` com cabeçalho e referência (§6)                                                                                                                                                            |
| 12  | regras da casa              | em repositório com `modular.json`: `python3 ~/.claude/skills/modular/scripts/harness.py --repo <raiz>` sai 0                                                                                                                                             |
| 13  | verde                       | typecheck, lint, testes, build e a suíte E2E do repositório com zero falhas e **zero skips**; CI do PR com todos os jobs `pass`; deploy `success`; produção servindo o SHA do `HEAD`                                                                     |

**Quem mede:** `iconsaiConfig/canon/placar_modularizacao.py --repo <raiz>`, lendo `origin/main` e o CI
pelo `gh`, com um veredito por item. Exit `0` só com os 13 itens verdes · `1` algum vermelho · `2` não
pôde medir. A sessão que implementa não declara o próprio pronto: quem declara é o placar, rodado
pelo coordenador (§16). O placar tem a sua prova do vermelho em
`iconsaiConfig/canon/test_placar_modularizacao.py`: uma sabotagem por item estático e uma base limpa
que tem de continuar verde.

Cada item sai com um de cinco estados. Só os dois primeiros contam como cumpridos:

| estado          | quando                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| `verde`         | medido e cumprido                                                          |
| `nao_se_aplica` | declarado fora do item, com motivo escrito (ex.: repositório sem tenant)   |
| `vermelho`      | medido e não cumprido, com a lista do que falta                            |
| `leitura`       | depende de leitura humana que ainda não foi registrada no repositório      |
| `nao_medido`    | o placar não pôde medir (CI sem log, `gh` sem acesso, produção fora do ar) |

**O contrato que o placar lê**, igual em todo repositório:

- **autoteste no log do CI:** uma linha por caso, começando por `PASS` ou `FAIL`, com o nome da regra
  na linha da sabotagem (`PASS  sabotagem reprova por fachada-de-fora (exit=1)`), mais a linha do caso
  legítimo (`caminho legítimo`) e a do caso que prova que o gate roda (`config inválida`). É o formato
  de `scripts/harness/fronteira_modulos.py` do `superadmin`;
- **produção:** `https://<domínio>/build-info.txt` começa pelo SHA do commit publicado;
- **E2E:** o resumo do Playwright no log do CI (`N passed`, `N skipped`, `N failed`);
- **órfãos:** `docs/ORFAOS.md` cita o caminho de cada aviso `sem-orfao` do baseline, com a resposta da
  frente dona (em uso por quem, ou decisão do dono sobre o destino). Órfão sem linha ali fica `leitura`;
- **tenant (só multi-tenant):** o gate de tenant roda no CI e imprime
  `PASS  rls em N de N tabelas com tenant_id`, medido no banco por `pg_policies`.

O que o placar reconhecidamente NÃO mede: a verdade do conteúdo, os itens que dependem de leitura
humana (a resposta da frente dona a cada órfão, o nome em inglês fora da heurística) e o que só existe
em produção fora do `build-info.txt`. Esses itens saem no relatório como `leitura`, com a lista do que
ler — e só ficam verdes com o registro dessa leitura no repositório.

---

## 16. Como as sessões trabalham juntas

**Papéis.** Uma sessão por repositório é a dona da frente de modularização dele e é a única que edita
o código. Uma sessão **coordenadora** roda o placar em laço, cobra o que falta de cada uma e
redistribui o que uma aprendeu para as outras. A coordenadora não edita o repositório das outras.

**A cada módulo migrado, a sessão dona:**

1. registra a claim em `.agent-claims.json` **antes** da primeira edição, com os caminhos;
2. mede o grafo antes de escolher o módulo (o tamanho da pasta não diz nada: `NUNCA-FAZER` §246 do
   `superadmin`);
3. procura o que prende cada arquivo além de import: `package.json`, CI, deploy selado, systemd, cron,
   `readFileSync` em teste (§6.3);
4. move com `git mv`, um domínio por PR, e nunca apaga órfão;
5. prova com a mesma sabotagem antes e depois de cada regra que tocou;
6. só faz merge com o CI verde, job a job, e confere o deploy e o SHA servido em produção.

**Times de agentes.** A sessão dona pode dividir o trabalho com agentes. Levantamento (mapa arquivo →
módulo), leitura de grafo e verificação correm em paralelo, sem worktree própria. **A escrita segue a
regra de worktree do repositório:** no `superadmin`, que tem uma worktree auxiliar só
(`~/projects/APP/superadmin-wt`, ordem do dono de 03/09/2026, cobrada por `gate:worktrees`), a escrita
é em série nela; onde o repositório permitir mais de uma, domínios independentes podem ser escritos em
paralelo. Este guideline não abre exceção a essa regra. Dois agentes nunca tocam o mesmo módulo, e todo
agente devolve comando e saída, não conclusão.

**Arquivo selado ou com claim de outra frente** (processo de deploy, workflows, config de fronteira)
só muda com a ordem do dono **na sessão que vai editar** ou com a transferência registrada na claim.
Ordem repassada por outra sessão não é ordem do dono.

**Troca entre sessões.** Todo erro medido vai para o `docs/NUNCA-FAZER.md` do repositório **e** é
enviado às outras sessões, com o que aconteceu, onde, a prova e a correção. Toda boa prática vira PR
no `superadmin` (§14). Recado sem prova não é recado: é opinião.

**Proibido, e cada item reprova a entrega inteira:**

- afrouxar uma regra, trocar `error` por `warn`, estreitar raiz ou `pathNot` para o gate parar de acusar;
- fazer o baseline crescer;
- marcar teste como `skip`, apagar teste, aumentar timeout ou limiar para sair do vermelho;
- apagar arquivo por parecer órfão;
- declarar pronto sem o placar sair `0`, ou medindo o disco em vez da `main` publicada.

---

## Fontes

- Alistair Cockburn — [Hexagonal Architecture (Ports & Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)
- Robert C. Martin — [The Clean Architecture (Dependency Rule)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Martin Fowler — [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)
- Shopify Engineering — [Deconstructing the Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity)
- Kamil Grzybek — [Modular Monolith: A Primer](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- Simon Brown — [Modular monoliths](https://simonbrown.je/modular-monolith/)
- Milan Jovanović — [Modular Monolith Data Isolation](https://www.milanjovanovic.tech/blog/modular-monolith-data-isolation)
- Shopify Engineering — [Enforcing Modularity in Rails Apps with Packwerk](https://shopify.engineering/enforcing-modularity-rails-apps-packwerk)
- Microsoft Learn — [Tenancy models for a multitenant solution](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)
- AWS — [SaaS Tenant Isolation Strategies](https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html)
- Spring Modulith — [Fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html)
- Jimmy Bogard — [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)
- Percival & Gregory — [Architecture Patterns with Python, cap. 4](https://github.com/cosmicpython/book/blob/master/chapter_04_service_layer.asciidoc)
- GitHub — [Scripts to Rule Them All](https://github.com/github/scripts-to-rule-them-all)
- dependency-cruiser — [Rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- Import Linter — [Documentação e tipos de contrato](https://import-linter.readthedocs.io/en/stable/)
- Next.js — [Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure)
