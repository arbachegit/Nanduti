# Ñandutí — Prompt Mestre Nuclear

> **Documento único, autocontido, determinístico.** Quem recebe, executa do começo ao fim sem fazer escolhas criativas. Estudos do Paraguai e do WeChat estão **dentro** deste documento, não referenciados. Todas as decisões estão fechadas. Todo microcopy está escrito. Todos os mocks estão integrais.
>
> **Branch alvo:** `claude/paraguay-research`
> **URL alvo:** `https://icon.iconsai.ai/icon/nanduti`
> **Repo:** `iconsaiIcon` (Next.js 15 / React 19 / TS / basePath `/icon`)

---

## SUMÁRIO EXECUTIVO

Construir o mockup funcional do super-app **Ñandutí** ("renda paraguaia") para pitch executivo a MITIC e Presidencia del Paraguay. Modelo arquitetural: **chat IA conversacional bilíngue (es/gn/jopará) no centro + sidebar de 9 mini-apps**, sobre stack federado de padrões abertos. Inspiração de UX integrada: WeChat. Modelo institucional: Singpass + India Stack + X-Road. Camada de IA: orquestrador que entende linguagem natural, dispara tools e devolve resultado visual no mini-app correspondente.

Os 9 mini-apps são: **Wallet** (transferências SIP + cartão Mastercard com saldo USDC via Ueno BIN sponsor), **GovServices** (6 trâmites top demanda do Portal Paraguay), **Saúde** (triagem inteligente + agendamento IPS/MSPyBS + carteira vacinação + Linha 155 saúde mental), **Educação** (boletim + matrícula + tutor IA bilíngue + cardápio merenda), **Cartão Cripto USDC** (saldo + topup + lock + cashback), **Informativos** (feed estado curado por IA + resumo semanal), **Alertas Naturais** (push geo-fenced — ataca gap real: DINAC não tem SMS push oficial em 2026), **Denúncia Policial** (botão pânico + modo discreto camuflado como calculadora — ataca gap: Paraguai sem app nacional de denúncia online em 2026), **Documentos** (carteira W3C VC com audit trail estoniano "quien vió mis datos").

Cidadã padrão: **María González Acosta**, 34 anos, Asunción, jopará-falante, IPS-segurada, mãe de 2. CIC `4521847` (válida módulo 11). Voz primária — Whisper STT + ElevenLabs TTS (es-PY voz "Ana"). Guaraní sem TTS comercial em 2026: fallback texto-only com nota cultural.

Stack técnico: dentro do `iconsaiIcon`, 28 rotas API novas em `app/api/nanduti/**/route.ts`, 9 componentes mini-app + 7 primitivos + 4 componentes core, mocks integrais em `data/nanduti/`, libs em `lib/nanduti/`. Reutiliza design system existente (`app/globals.css`) com namespace `.nd-*`. **Floating button intacto** (regra de ouro IconsAI). **Vercel proibida.** Deploy via systemd no servidor DigitalOcean com `bash scripts/post-deploy-verify.sh` obrigatório.

Disclaimers permanentes em saúde ("orientación informativa, NO sustituye atención médica") e cripto ("activo virtual experimental, sujeto a marco regulatorio en formación"). Audit trail de cada acesso a documento. Modo discreto em denúncia (não armazena dados que possam ser usados contra a vítima). 100% mock — zero PII real. Compliance preventiva com GDPR/LGPD, antecipando lei geral de proteção de dados em tramitação no Paraguai.

Validação CIC módulo 11 é **real** (algoritmo verbatim no §6). Mock OAuth Identidad Electrónica simula MITIC (1M de identidades ativas em nov/2024). Pagamento mock simula SIP (rebranding do SIPAP em abr/2026 pelo BCP) + QR Hub (interoperabilidade nacional lançada mai/2026). Cartão USDC mock: custódia Circle + BIN Ueno + adquirência Bancard.

Tempo de implementação ponta-a-ponta: ~21 horas. Critérios de aceite são binários (Lighthouse mobile ≥85, voz funciona em es-PY, validação CIC real, modo discreto, audit trail visível, 28 APIs respondem 200, build sem warnings, post-deploy-verify passa). Comando de execução único na §14.

---

## 30 PONTOS-CHAVE (decisões fechadas)

| # | Decisão | Valor |
|---|---|---|
| 1 | Nome do produto | **Ñandutí** (renda paraguaia em guaraní) |
| 2 | Tagline | "La red ciudadana del Paraguay digital" / "Tu Paraguay, en una conversación." |
| 3 | URL pública | `https://icon.iconsai.ai/icon/nanduti` |
| 4 | Branch | `claude/paraguay-research` |
| 5 | Repo / stack | `iconsaiIcon` Next.js 15 + React 19 + TS, basePath `/icon` |
| 6 | Idiomas UI | es (castelhano) + gn (guaraní) + jopará (mistura) — 3 locales obrigatórios |
| 7 | Locale default | `jopara` |
| 8 | Modelo arquitetural | WeChat UX + Singpass + India Stack + X-Road + ChatGPT |
| 9 | LLM principal | Claude Sonnet 4.6 (raciocínio, tool calling) |
| 10 | LLM rotina | Claude Haiku 4.5 (resumos, tutor edu) |
| 11 | STT | Whisper (OpenAI) com `language: "es"` |
| 12 | TTS | ElevenLabs voz "Ana" es-PY · guaraní fallback texto-only |
| 13 | Cidadã padrão | María González Acosta, CIC 4521847 |
| 14 | Validação CIC | módulo 11 real (algoritmo verbatim no §6.2) |
| 15 | Auth login | Mock OAuth Identidad Electrónica MITIC + fallback CIC + OTP `123456` |
| 16 | Stablecoin | USDC (Circle) — não USDT |
| 17 | BIN sponsor | Ueno Bank (mock) |
| 18 | Adquirente | Bancard (mock) |
| 19 | Pagamento PYG | Mock SIP (rebranding SIPAP abr/2026) + Mock QR Hub (mai/2026) |
| 20 | Cache | Redis TTL 5min, chave `(citizen_id, intent_hash, lang)` |
| 21 | Rate limit | 30 req/min/IP |
| 22 | Layout desktop | 70/30 (chat / sidebar) |
| 23 | Layout mobile | chat fullscreen + bottom-sheet drawer |
| 24 | Mini-apps | 9 (wallet, gov, health, edu, crypto, info, alerts, police, docs) |
| 25 | APIs | 28 rotas em `app/api/nanduti/**` |
| 26 | Tools LLM | 28 tools tipadas registradas em `lib/nanduti/tool-registry.ts` |
| 27 | Modo discreto | Denúncia policial camuflada como calculadora; sair = 7 toques no display |
| 28 | Audit trail | Toda leitura de documento registrada e visível ao titular |
| 29 | Disclaimers | Saúde + Cripto permanentes na UI |
| 30 | Deploy | Systemd DigitalOcean + `bash scripts/post-deploy-verify.sh` (Vercel proibida) |

---

## PARTE I — CONHECIMENTO DE BASE

> Esta seção contém os fatos essenciais sobre o terreno (Paraguai) e o blueprint (WeChat e modelos democráticos). É **suficiente** — quem executa não precisa pesquisar mais nada para tomar decisões coerentes.

### I.A · Paraguai 2024-2026 (panorama compactado, fontes na pesquisa original arquivada)

**Demografia.** População 6.372.623 (INE, 2024). 25,4% menores de 15; 66,3% entre 15-64; 8,3% com 65+. Idade mediana ~28 anos. Asunción capital com 462.241; Gran Asunción concentra 2,3-2,5 milhões. Ciudad del Este ~340.000 (segundo maior centro, hub fronteiriço com Brasil/Argentina).

**Idiomas.** Constitucionalmente bilíngue (Constituição art. 77, 1992). Castelhano e guaraní são oficiais. EPH/Censo 2022: 38,7% fala jopará (mistura espontânea), 30% só guaraní, 28,5% só castelhano, 34,3% bilíngue formal. **~70% usa guaraní cotidianamente** (INE, 2025). Implicação para Ñandutí: jopará como locale default; guaraní e castelhano como alternativas; nunca tratar guaraní como secundário.

**Penetração digital.** Internet 82,9% (Digital 2025/Kepios, jan/2025). 81,6% conectados regularmente. 90% das conexões via smartphone (mobile-first obrigatório). 92,7% banda larga móvel. 4G LTE 97% pop com 94,74% cobertura geográfica. 5G ainda incipiente em 2026 — só Claro e Nubicom adjudicados; Tigo e Personal abstiveram-se. Operadoras móveis: Tigo (Millicom) ~46-50%, Personal (Telecom) ~32%, Claro (América Móvil) ~11-18%, Vox (Hutchison) ~4%. ANDE Internet (fibra estatal) em expansão. Internet fixa cresceu 2,2x entre 2019 e 2024.

**Macroeconômicos.** PIB per capita corrente 2024: US$ 6.640,84 (Banco Mundial). PPP: US$ 16.296,28 (FMI). Salário mínimo desde 01/jul/2024: G. 2.798.309/mês ≈ US$ 370 (MTESS). Informalidade > 60% PEA; 58,3% dos assalariados informais; 66% desses ganham abaixo do mínimo (CADEP, 2026). Bancarização: 81% dos adultos em abr/2025 — salto enorme dos 54% de 2021 (BCP/Findex). Crédito ativo permanece menor: ~42%.

**Sistema financeiro.** Banco Central del Paraguay (BCP) — autoridade monetária, supervisão via SIB, regulação de pagamentos via CNV. Top bancos por crédito (fev/2026, La Nación PY): Continental 18,8%, Sudameris 16,1%, Itaú 14,2%, GNB, Banco Nacional de Fomento (público), Atlas, Familiar, Ueno. Top-5 = 70%+ do crédito. Carteira sistema nov/2024: G. 167,6 trilhões (~US$ 21,8 bi), +12,1% YoY. **Cooperativas de crédito** (INCOOP, Lei 438/94): 673 registradas, 419 de aforro y crédito, ~2 milhões de associados, ativos ~G. 47 trilhões (Tipo A). Dolarização parcial: ~45-50% dos depósitos em USD; ~70% dos ativos em ME são créditos a empresas exportadoras.

**Fintechs.** Ecossistema ~36 fintechs ativas (Tracxn). **Ueno Bank** lidera: lançado fev/2022 como evolução do Banco Familiar; 2,8 milhões de clientes (dez/2024); 1 milhão de cartões de crédito ativos; ~50% dos cartões emitidos do sistema; 275 mil empréstimos 100% digitais; BID Invest US$ 18,8 mi em nov/2024. Premio Platino Fintech Americas 2026. **É o candidato natural a BIN sponsor para o cartão USDC do Ñandutí.** Outras fintechs: Wally (carteira multibanco), Zimple (EPE com varejo), Mango App, Portal de Pagos, Vaquita.

**Pagamentos.** **SIPAP → SIP** — em 27/abr/2026 BCP rebatizou o sistema interbancário, mantendo operação. Liquidação 24/7 PYG e USD; interoperabilidade P2P entre carteiras com liquidação no SIP. **QR Hub** — plataforma centralizada de QR interoperável lançada em mai/2026: a partir desta data, qualquer app lê qualquer QR; transferências transfronteiriças previstas para 2027. **Bancard** é o switch dominante de cartões e adquirência (Infonet adjacente). **Carteiras eletrônicas:** Tigo Money 83% das transações móveis, Personal Pay 14%, Claro Pay, Wally, Zimple. Total ~2,5M usuários. Comparação com Pix: SIP+QR Hub é a tentativa paraguaia de alcançar interoperabilidade tipo Pix; ainda atrás em volume e ubiquidade.

**Identificação.** **Cédula de Identidad Civil (CIC)** — emitida pelo Departamento de Identificaciones (Policía Nacional). Estrutura completa: 3 dígitos oficina + 8 data + 3 folio + 3 tomo + 3 ato + **1 dígito verificador módulo 11**. Em uso comum, número curto 6-8 dígitos. Renovação 10 anos. **RUC** — gerido pela DNIT (fusão SET + aduana, Lei 7143/2023). Para pessoa física paraguaia: cédula + DV (ex.: `4521847-2`). **CIPV** para estrangeiros. **API pública RUC** disponível desde 09/05/2024. **Identidad Electrónica** (MITIC): 1 milhão de identidades ativas em nov/2024; acesso a 306+ trâmites em paraguay.gov.py; firma electrónica não qualificada para servidores; firma qualificada regulada por Lei 4017/2010 + Lei 4610/2012.

**Governo.** República presidencialista. Atual: Santiago Peña (ANR/Colorado), 15/ago/2023 a 2028, vice Pedro Alliana. Mandato único 5 anos. Congresso: 45 senadores + 80 deputados. Corte Suprema com 9 ministros. Ministérios-chave para Ñandutí: **MITIC** (criado Lei 6207/2018 — governo digital, conectividade, cibersegurança, parceiro estratégico do produto), **MEF** (ex-Hacienda), **MIC** (industria/comércio, regula fintech parcial), **MSPyBS** (saúde), **MEC** (educação), **Interior** (segurança, identificações, migrações). Agências relevantes: **DNIT** (impostos+aduana), **ANDE** (eletricidade), **ESSAP** (saneamento), **Conatel** (telecom), **SEN** (emergências), **SEPRELAD** (anti-lavagem), **CNV** (mercado capitais), **INCOOP** (cooperativas), **SEDECO** (consumidor + dados). Plataformas digitais existentes: Portal Paraguay (306+ trâmites), MARANGATU (sistema fiscal DNIT), Identidad Electrónica, eDoc.pol, Sistema de Citas, APIs públicas MITIC. UN E-Gov Survey 2024 destaca Paraguai entre países com desenvolvimento significativo desde 2018; posição global ~80-100º.

**Regulação cripto e dados.** BCP comunicado oficial: cripto **não é moeda legal**; risco volatilidade; estuda CBDC. Cenário PL: 2022 Senado sancionou regulação de cripto-mineração, **Executivo vetou** (alto consumo elétrico). 30/mai/2024 novo PL declara Bitcoin "ativo virtual experimental do Estado". PL paralelo Senado propõe proibir temporariamente. **Sem marco legal definitivo até 2026.** Mineradores operam zona cinzenta. **Lei 6534/2020 PDP** cobre apenas dados pessoais creditícios (positivos e negativos), não é GDPR-like horizontal. PL geral GDPR-style tramita 2022-2026 sem aprovação. **Anteprojeto Lei Uso Ético de IA** em curso 2026 (MITIC). **Cartão atrelado a stablecoin é viável tecnicamente em 2026** com estrutura: parceria banco local (Ueno) como BIN sponsor + custódia offshore (Circle) + conversão on-the-fly via PSP + Bancard como adquirente. Risco principal é instabilidade regulatória.

**Saúde.** **MSPyBS** (rede pública gratuita) + **IPS** (Instituto de Previsión Social — seguridade social, cobre apenas **24,6% da população**, ~1,66M segurados, 80% concentrados em Asunción + Central). Hospital de Clínicas (UNA) em crise orçamentária crônica. **77.872 crianças sem 1ª dose hexavalente em 2023** — gap de vacinação relevante. Política Nacional de Saúde Mental 2024-2030 com **Linha 155** (saúde mental) prevista. **App Mi IPS existe**; prontuário eletrônico nacional unificado **NÃO existe** — gap de produto. USF (Unidades de Salud Familiar) descentralizadas. Implicação Ñandutí: agendamento + triagem + carteira vacinação digital + Linha 155 com agente IA.

**Educação.** **MEC** (Ministerio de Educación y Ciencias). Sistema: pré, EEB 1-9, médio, superior. **PISA 2022 catastrófico**: só 15% dos alunos paraguaios atingem Nível 2 em matemática (média OCDE 69%); 7 em 10 não compreendem o que leem. **Apenas 2.055 de 8.900 escolas (23%) com internet.** Analfabetismo subiu de 4,4% (2015) para 6,8% (2019); 12,9% entre monolíngues de guaraní. Universidades principais: UNA (pública), UCA, UAA, UNAE. Implicação Ñandutí: tutor IA bilíngue prioritário em matemática e leitura é jogada política poderosa.

**Eventos naturais e proteção civil.** **SEN** (Secretaría de Emergencia Nacional) responde a inundações no Chaco 2025-2026 (800+ famílias afetadas em Alto Paraguay) e secas (340.000L de água entregues). **DINAC** (meteorologia) **não tem sistema oficial de SMS push** — gap de produto crítico. INFONA cuida de florestal/queimadas. Eventos típicos: enchentes Río Paraguay/Paraná, secas Chaco, tempestades severas, queimadas. Agricultura é parte significativa do PIB → exposição climática alta. Implicação Ñandutí: alertas geo-fenced por push notification cobrem vácuo real.

**Segurança pública.** **Policía Nacional** + 911. **SOS 137** linha violência mulher. **Ministerio Público** denúncias online via e-MP. Crimes principais: tráfico (fronteira), roubo, violência doméstica. **27 feminicídios em 2024, 25 em 2025 (até set), 66.349 denúncias de violência familiar bienal (104/dia).** **Paraguai NÃO tem app nacional de denúncia online em 2026** — gap político-social crítico. DEAM são delegaciones especializadas em violência mulher. Implicação Ñandutí: botão pânico + modo discreto + denúncia anônima atacam vácuo real e são tração política para o pitch.

**Telecom.** Cobertura 4G ~97% pop, mas concentrada em zonas urbanas. 5G só Claro e Nubicom em 2026. Custo médio internet/dados por GB acessível para classes A/B/C, restritivo para D. Implicação Ñandutí: bundle inicial ≤3MB, service worker offline shell, modo de baixa banda.

### I.B · WeChat — Lições e Anti-Padrões

**O que é.** Maior super-app do mundo. 1,38 bilhão MAU (Tencent IR 2024). 945M MAU em mini-programas (Q1 2024). GMV mini-programas > RMB 2 trilhões (~US$ 280 bi). WeChat Pay 42% do mercado chinês. Receita Tencent FY2024: RMB 660,3 bi.

**Arquitetura mini-programas (xiǎochéngxù).** Não são instalados no SO. Vivem dentro do runtime do WeChat. Stack: **WXML** (HTML proprietário com binding declarativo), **WXSS** (CSS estendido com unidade `rpx` responsiva), **JavaScript sandbox** (sem DOM, sem `window`/`document`/`eval`, dois threads: View Layer + App Service Layer). APIs `wx.*`: `wx.login`, `wx.request` (HTTPS-only com whitelist), `wx.scanCode`, `wx.requestPayment`, `wx.getLocation`. Tamanho: até ~20MB com sub-packages. Discovery via QR (vetor #1), busca interna, share em chat, Official Accounts. Sem app store separada.

**WeChat Pay.** P2P, P2M (QR estático/dinâmico), in-app, in-store NFC, cross-border. Vincula a cartões PBOC. Roda sobre NetsUnion (clearinghouse estatal). Real-name verification obrigatória desde 2016. Take rate merchant 0,6%. Saldo é e-wallet escrow regulado.

**Identidade.** WeChat ID (único globalmente) + OpenID (único por usuário×app, privacy entre developers) + UnionID (único por usuário×corp owner). Login 1-clique via `wx.login` → code → backend troca por openid + session_key.

**Governo no WeChat.** Cidades como Shenzhen (i深圳, 300+ serviços) e Hangzhou. Health Code COVID 2020 famoso. Pagamento de impostos, multas, certidões, seguridade social, inscrição escolar, processos judiciais.

**Anti-padrões a NÃO replicar em democracia:**
- **Lock-in numa empresa privada** com obrigação de cooperar com Estado (incompatível com habeas data, GDPR, LGPD).
- **Surveillance de mensagens privadas** — comunicação cidadã deve ser E2E ou opt-in.
- **Censura de conteúdo** — em democracia só por ordem judicial.
- **Dependência de plataforma única** — cidadão deve poder acessar via super-app, web direto, e API.
- **Coleta indiscriminada de gráfico social.**
- **Real-name obrigatório para tudo** — calibrar.

**Padrões a importar:**
- **UX integrada**: identidade + pagamento + serviço numa única superfície contínua.
- **Mini-programas / module sandbox** como modelo de extensibilidade.
- **Login 1-clique** baseado em identidade nacional, com session keys curtas e separação por escopo (OpenID-style).
- **QR físico** como vetor de discovery (repartições, postos imprimem QR).
- **Push via canal oficial.**
- **Componentes UI padronizados** (design system público).

### I.C · Modelos de Referência Democráticos

**Singpass (Singapura).** 4,2 milhões de usuários (~97% adultos cidadãos/PRs). 300M transações/ano. 2.700+ serviços de 800+ agências. Stack: app + MyInfo + Login + Verify + Face Verification + Sign + Notify. Backend: APEX (API Exchange) + microsserviços + biometria + MFA. **É a referência mais próxima** para um país pequeno-médio como Paraguai.

**India Stack / UPI.** Não é app — é conjunto de **APIs públicas**: Aadhaar (identidade biométrica >1,3 bi), UPI (rail de pagamento interoperável), DigiLocker (documentos com selo criptográfico), eKYC, eSign, Account Aggregator, ONDC. **Vantagem democrática:** múltiplos apps competem usando o mesmo backbone público. Sem lock-in num PhonePe ou Paytm.

**e-Estonia / X-Road.** e-ID (smartcard + Mobile-ID + Smart-ID). **X-Road** — barramento descentralizado open-source. Cada agência mantém seus dados; troca via security servers federados. Princípio "once-only" (cidadão informa cada dado uma única vez). Federação cross-border com Finlândia. Cidadão vê quem viu cada item de seu prontuário ("audit trail estoniano").

**Síntese aplicada ao Ñandutí:**
- **Camada de identidade** estilo Singpass + W3C Verifiable Credentials.
- **Camada de dados** estilo X-Road (cada agência mantém, barramento federa).
- **Camada de pagamento** estilo UPI (rails públicos, apps competem).
- **Camada de aplicação** estilo WeChat Mini-Programs (UX integrada), porém com SDK público open-source e código aberto na camada crítica.
- **Camada de IA** (diferencial Ñandutí): LLM como orquestrador conversacional sobre as 4 camadas anteriores.

---

## PARTE II — ESPECIFICAÇÃO DO PRODUTO

### II.1 · Missão e Posicionamento

**Missão.** Entregar mockup funcional de alta fidelidade do super-app Ñandutí. Apresentação executiva para MITIC e Presidencia del Paraguay. Objetivo do pitch: convencer governo e parceiros (Ueno, Bancard, IPS, MEC) a financiar/aprovar a fase de produção real.

**Posicionamento.** "Tu Paraguay, en una conversación." O cidadão pede em linguagem natural; a IA orquestra agências, pagamentos, saúde, educação. Sidebar de mini-apps = atalhos visuais. Diferencial vs WeChat e concorrentes regionais: **IA conversacional como camada de orquestração + stack federado de padrões abertos**, não monolítico proprietário.

**Concorrentes / players a observar:** Ueno Bank (mais próximo de ambição super-app, mas é fintech sem camada de Estado); Tigo Money / Personal Pay (carteiras, sem governo); Portal Paraguay (governo, sem IA, sem cidadão como centro); Bolt (ride-hailing dominante, sem ambição multi-vertical). **Ñandutí ocupa um espaço vazio**: super-app cidadão estatal com IA conversacional.

### II.2 · Os 10 Princípios Não-Negociáveis

| # | Princípio | Exigência prática |
|---|---|---|
| 1 | Bilíngue es + gn + jopará, voz primária | 3 locales obrigatórios; toggle visível; voz default ON após onboarding |
| 2 | Offline-first | Service worker com shell cacheado + última sessão + 3 ações principais |
| 3 | Mobile-first ≤3MB initial bundle | Code splitting agressivo; imagens em SVG inline ou WebP |
| 4 | Identidade primeiro | Login obrigatório via Identidad Electrónica (mock) ou CIC + OTP antes de qualquer mini-app |
| 5 | Padrões abertos federados | OpenID Connect (mock) + W3C VC para cada doc + endpoints REST documentados |
| 6 | Privacy-by-design + auditabilidade | Cada acesso a documento registra entry no audit log, exposto ao titular |
| 7 | IA orquestra, agências guardam | Tools chamam APIs por agência; LLM nunca persiste PII |
| 8 | WCAG AA + modo idoso + alto contraste | Toggle visível; fontes ajustáveis; ícones pictográficos universais |
| 9 | Zero PII real | Disclaimers permanentes; mock data fictício; persona única `María González` |
| 10 | Floating button intacto | Copiar literalmente o `<a href="/icon" className="floating-logo">` de `/future` |

### II.3 · Identidade Visual

#### II.3.1 · Paleta (CSS tokens — adicionar a `app/globals.css`, namespace `.nd-*`)

```css
/* ===== NANDUTI TOKENS ===== */
:root {
  /* Bandeira Paraguai (sutil, não saturada) */
  --nd-py-red:    #D52B1E;
  --nd-py-blue:   #0038A8;
  --nd-py-white:  #FFFFFF;

  /* Base IconsAI */
  --nd-bg:        #08080F;
  --nd-surface:   #141420;
  --nd-surface-2: #1C1C2A;
  --nd-border:    rgba(255,255,255,0.06);
  --nd-border-active: rgba(0,229,255,0.2);

  /* IA accent */
  --nd-cyan:      #00E5FF;
  --nd-purple:    #A855F7;
  --nd-electric:  #38BDF8;

  /* Funcionais */
  --nd-success:   #10B981;
  --nd-warn:      #F59E0B;
  --nd-danger:    #EF4444;
  --nd-gold:      #F4D03F;  /* dourado guaraní */

  /* Texto */
  --nd-t1: #F4F4FF;
  --nd-t2: rgba(244,244,255,0.7);
  --nd-t3: rgba(244,244,255,0.4);

  /* Mini-app accent (1 por app) */
  --nd-app-wallet:  #10B981;
  --nd-app-gov:     #0038A8;
  --nd-app-health:  #06B6D4;
  --nd-app-edu:     #F97316;
  --nd-app-crypto:  #A855F7;
  --nd-app-info:    #38BDF8;
  --nd-app-alerts:  #F59E0B;
  --nd-app-police:  #EF4444;
  --nd-app-docs:    #F4D03F;
}
```

#### II.3.2 · Gradientes determinísticos

| Uso | Definição CSS |
|---|---|
| Title hero / clipped text | `linear-gradient(135deg, #00E5FF 0%, #A855F7 50%, #D52B1E 100%)` |
| Botão CTA primário (background) | `linear-gradient(135deg, #00E5FF, #A855F7)` |
| Pill ativo lang switcher | `linear-gradient(135deg, #00E5FF, #A855F7)` |
| Card mini-app hover | `linear-gradient(135deg, rgba(0,229,255,0.08), rgba(168,85,247,0.04))` |
| Orb hero ciano | `background: #00E5FF; opacity: 0.35; filter: blur(80px)` |
| Orb hero roxo | `background: #A855F7; opacity: 0.35; filter: blur(80px)` |
| Orb hero vermelho | `background: #D52B1E; opacity: 0.18; filter: blur(80px)` |

#### II.3.3 · Tipografia

| Família | Uso | Peso |
|---|---|---|
| `Plus Jakarta Sans` (já no IconsAI) | UI principal, body, títulos | 400, 600, 700, 800 |
| `JetBrains Mono` (já no IconsAI) | Números, códigos, eyebrows, valores monetários | 400, 600 |
| sans-serif system fallback | Fallback se fonts não carregarem | — |

**Regras tipográficas:**
- Títulos hero: `clamp(56px, 10vw, 120px)`, weight 800, gradient clip
- Subtítulos: `clamp(20px, 2.4vw, 28px)`, weight 600
- Body: 16px, weight 400, line-height 1.6, color `var(--nd-t2)`
- Eyebrows / labels mono: 11px, letter-spacing 0.18em, uppercase, color `var(--nd-cyan)`
- Valores monetários: SEMPRE `Gs. 200.000` (separador de milhar é ponto, não vírgula); USDC usa vírgula decimal `247,83 USDC`.

#### II.3.4 · Logo Ñandutí (SVG procedural — 12 raios + 3 círculos)

```tsx
<svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
  <defs>
    <linearGradient id="nandutiGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#00E5FF" />
      <stop offset="100%" stopColor="#A855F7" />
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#nandutiGrad)" strokeWidth="1.4">
    <circle cx="32" cy="32" r="28" />
    <circle cx="32" cy="32" r="20" />
    <circle cx="32" cy="32" r="12" />
    {/* 12 raios gerados via Array.from({length:12}).map((_,i) => angle = i*PI/6) */}
  </g>
</svg>
```

#### II.3.5 · Voz e tom (copywriting)

- **Cordial, próximo, NÃO formal.**
- **Saudação default**: `"Mba'éichapa, [nome]"` (jopará, "como estás").
- **Erros**: nunca `"Error 500"`. Sempre `"Algo no anduvo bien. ¿Probamos de nuevo?"` (es) / `"Mba'eve ndoikói. ¿Ñañepyrũjeýta?"` (gn) / `"Algo no anduvo bien. Ñañepyrũjey"` (jopará).
- **Valores monetários**: SEMPRE formato `Gs. 200.000` na UI; voz lê por extenso `"doscientos mil guaraníes"`.
- **Confirmações**: pergunta direta com botão "Confirmar" + "Cancelar". Nunca "OK" / "Cancel".
- **Microcopy guaraní**: rever com falante nativo antes de produção real. No mockup, usar literais determinísticos da §II.10.

### II.4 · Arquitetura — 4 Camadas

```
┌─ CAMADA 1 · APRESENTAÇÃO (Next.js client components) ──────────────┐
│  ChatCenter (left, 70% desktop)  │  Sidebar (right, 30% desktop)   │
│  - text + voice (es/gn/jopará)   │  - 9 cards mini-app             │
│  - SSE streaming                 │  - drill-down em modal          │
│  - tool result rendering         │  - mobile: bottom-sheet drawer  │
│  Header: logo + lang switcher    │  Footer: ε                      │
└────────────────────────────────────────────────────────────────────┘
                              ↕ fetch + SSE
┌─ CAMADA 2 · ORQUESTRAÇÃO (Next.js API routes Node runtime) ─────────┐
│  /api/nanduti/chat  → LLM router (Claude Sonnet 4.6 / Haiku 4.5)    │
│  Tool registry: 28 tools tipadas em lib/nanduti/tool-registry.ts    │
│  Cache: Redis chave (citizenId, intentHash, lang) TTL 300s           │
│  Voice: /api/nanduti/stt (Whisper) + /api/nanduti/tts (ElevenLabs)  │
│  Rate limit: 30 req/min/IP via Redis sliding window                 │
│  Audit logger: cada acesso a doc → audit trail estoniano            │
└────────────────────────────────────────────────────────────────────┘
                              ↕
┌─ CAMADA 3 · IDENTIDADE & DADOS ─────────────────────────────────────┐
│  Mock OAuth Identidad Electrónica MITIC                             │
│  CIC validator módulo 11 real (lib/nanduti/cedula-validator.ts)     │
│  W3C Verifiable Credentials JWT-encoded por documento emitido       │
│  9 "agências" simuladas: Identificaciones, DNIT, IPS, MSPyBS, MEC,  │
│  SEN, Policía Nacional, ANDE, MITIC                                 │
│  Cada uma expõe API REST mock com latência realista (mockDelay)     │
└────────────────────────────────────────────────────────────────────┘
                              ↕
┌─ CAMADA 4 · PAGAMENTO ──────────────────────────────────────────────┐
│  Mock SIP — instant transfer interbancário 24/7                     │
│  Mock QR Hub — interop nacional (lançado mai/2026 BCP)              │
│  Mock cartão Mastercard com saldo USDC                              │
│  Conversão on-the-fly USDC↔PYG via mock Circle API                  │
│  BIN sponsor mock: Ueno Bank · Adquirente mock: Bancard             │
└────────────────────────────────────────────────────────────────────┘
```

### II.5 · Estrutura de Arquivos (árvore completa, marcando o que já existe)

```
iconsaiIcon/
├── app/
│   ├── nanduti/
│   │   ├── layout.tsx                       [já existe] [§III.0]
│   │   ├── page.tsx                         [já existe — substituir hero por <NandutiShell />] [§III.0]
│   │   └── modal/[appId]/page.tsx           [criar] drill-down full-screen mobile
│   └── api/
│       └── nanduti/
│           ├── chat/route.ts                [criar] LLM + tool calling SSE
│           ├── stt/route.ts                 [criar] Whisper proxy
│           ├── tts/route.ts                 [criar] ElevenLabs proxy
│           ├── auth/
│           │   ├── identidad/route.ts       [criar] mock MITIC OAuth
│           │   └── cic-otp/route.ts         [criar] valida CIC + envia OTP
│           ├── wallet/
│           │   ├── transfer/route.ts        [criar]
│           │   ├── qr-pay/route.ts          [criar]
│           │   ├── history/route.ts         [criar]
│           │   └── balance/route.ts         [criar]
│           ├── gov/
│           │   ├── tramite-search/route.ts  [criar]
│           │   ├── tramite-book/route.ts    [criar]
│           │   └── ruc-lookup/route.ts      [criar]
│           ├── health/
│           │   ├── triage/route.ts          [criar]
│           │   ├── appointment/route.ts     [criar]
│           │   └── vaccination/route.ts     [criar]
│           ├── edu/
│           │   ├── report-card/route.ts     [criar]
│           │   ├── enroll/route.ts          [criar]
│           │   └── tutor/route.ts           [criar]
│           ├── crypto/
│           │   ├── balance/route.ts         [criar]
│           │   ├── topup/route.ts           [criar]
│           │   └── toggle-lock/route.ts     [criar]
│           ├── info/
│           │   ├── feed/route.ts            [criar]
│           │   └── weekly-summary/route.ts  [criar]
│           ├── alerts/
│           │   ├── subscribe/route.ts       [criar]
│           │   └── recent/route.ts          [criar]
│           ├── police/
│           │   ├── complaint/route.ts       [criar]
│           │   ├── panic/route.ts           [criar]
│           │   └── track/route.ts           [criar]
│           └── docs/
│               ├── list/route.ts            [criar]
│               ├── share/route.ts           [criar]
│               └── audit/route.ts           [criar]
├── components/
│   └── nanduti/
│       ├── LocaleProvider.tsx               [já existe]
│       ├── LangSwitcher.tsx                 [já existe]
│       ├── NandutiShell.tsx                 [criar] layout 70/30 + drawer + onboarding gate
│       ├── Onboarding.tsx                   [criar] 3 telas
│       ├── ChatCenter.tsx                   [criar] chat IA streaming + voz
│       ├── Sidebar.tsx                      [criar] grade 9 cards
│       ├── miniapp/
│       │   ├── WalletApp.tsx                [criar]
│       │   ├── GovApp.tsx                   [criar]
│       │   ├── HealthApp.tsx                [criar]
│       │   ├── EduApp.tsx                   [criar]
│       │   ├── CryptoCardApp.tsx            [criar]
│       │   ├── InfoApp.tsx                  [criar]
│       │   ├── AlertsApp.tsx                [criar]
│       │   ├── PoliceApp.tsx                [criar]
│       │   └── DocsApp.tsx                  [criar]
│       └── primitive/
│           ├── VoiceButton.tsx              [criar] push-to-talk + waveform
│           ├── CedulaInput.tsx              [criar] validação módulo 11 inline
│           ├── QRScanner.tsx                [criar] mock cycle 3 QRs
│           ├── VCCard.tsx                   [criar] render Verifiable Credential
│           ├── AuditTrail.tsx               [criar] "quien vió mis datos"
│           ├── DiscreteCalc.tsx             [criar] camuflagem calculadora
│           └── PanicButton.tsx              [criar] botão vermelho 80px
├── data/
│   └── nanduti/
│       ├── i18n/
│       │   ├── es.json                      [já existe — expandir conforme §II.10]
│       │   ├── gn.json                      [já existe — expandir]
│       │   └── jopara.json                  [já existe — expandir]
│       ├── mock-citizen.ts                  [criar — §II.6.1]
│       ├── mock-wallet.ts                   [criar — §II.6.2]
│       ├── mock-tramites.ts                 [criar — §II.6.3]
│       ├── mock-health.ts                   [criar — §II.6.4]
│       ├── mock-edu.ts                      [criar — §II.6.5]
│       ├── mock-crypto.ts                   [criar — §II.6.6]
│       ├── mock-info-feed.ts                [criar — §II.6.7]
│       ├── mock-alerts.ts                   [criar — §II.6.8]
│       ├── mock-police.ts                   [criar — §II.6.9]
│       └── mock-docs.ts                     [criar — §II.6.10]
└── lib/
    └── nanduti/
        ├── cedula-validator.ts              [criar — §II.9 código verbatim]
        ├── orchestrator.ts                  [criar] LLM router + tool dispatch
        ├── tool-registry.ts                 [criar] 28 tools tipadas
        ├── audit-logger.ts                  [criar] in-memory + Redis
        ├── mock-delay.ts                    [criar] latência realista 200-1500ms
        └── redis-cache.ts                   [criar] helpers TTL 300s
```

### II.6 · Mock Data Integral

> Cada mock é **integral**, não ilustrativo. Quem cola, tem dados suficientes para todos os fluxos da §II.9 sem inventar nada.

#### II.6.1 · `data/nanduti/mock-citizen.ts`

```ts
export const MOCK_CITIZEN = {
  name: "María González Acosta",
  cic: "4521847",                // CIC válida módulo 11
  ruc: "4521847-2",
  birthdate: "1991-08-14",
  age: 34,
  gender: "F",
  city: "Asunción",
  neighborhood: "Trinidad",
  address: "Cap. Brizuela 1234 c/ Tte. Velilla",
  geo: { lat: -25.262, lng: -57.616 },
  phone: "+595 981 234 567",
  email: "maria.gonzalez@example.py",
  language_pref: "jopara" as const,
  ips_segurada: true,
  ips_id: "IPS-789-456-123",
  ips_facility: "Hospital Central IPS",
  family: [
    { name: "Juan González Pérez", cic: "3987654", relation: "spouse", age: 36 },
    { name: "Sofía González", cic: "5432109", age: 8, relation: "daughter",
      school: { id: "ESC-234", name: "Escuela Pública 234 - Trinidad", grade: "3°" } },
    { name: "Mateo González", cic: "5432110", age: 3, relation: "son" }
  ],
  identidad_electronica: { active: true, since: "2024-09-12", level: "qualified" },
  consent: {
    terms_accepted_at: "2026-05-03T12:00:00-04:00",
    privacy_version: "1.0",
    audit_visible: true
  }
};

export type Citizen = typeof MOCK_CITIZEN;
```

#### II.6.2 · `data/nanduti/mock-wallet.ts`

```ts
export const MOCK_WALLET = {
  pyg_balance: 4_350_000,
  usdc_balance: 247.83,
  usdc_pyg_rate: 7_350,                 // 1 USDC = Gs. 7.350 (mock)
  monthly_card_limit_pyg: 8_000_000,
  card: {
    brand: "mastercard" as const,
    last4: "4827",
    bin_sponsor: "ueno",
    linked_to: "usdc" as const,
    status: "active" as const,
    issued_at: "2025-03-12"
  },
  recent_tx: [
    { id: "tx-2026-0501-001", date: "2026-05-02T18:32:00-04:00", to: "Carlos Benítez",       amount: 150_000, type: "sip",   currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-002", date: "2026-05-01T11:15:00-04:00", to: "Farmacia Catedral",    amount: 87_500,  type: "qr",    currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-003", date: "2026-04-30T08:00:00-04:00", to: "Salario IconsAI",      amount: 5_400_000, type: "sip", currency: "PYG", direction: "in"  },
    { id: "tx-2026-0501-004", date: "2026-04-29T22:11:00-04:00", to: "Pedidos Ya · Comida",  amount: 64_300,  type: "card",  currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-005", date: "2026-04-29T14:45:00-04:00", to: "Topup USDC",           amount: 36.84,    type: "swap", currency: "USDC", direction: "in"  },
    { id: "tx-2026-0501-006", date: "2026-04-28T19:20:00-04:00", to: "Supermercado Real",    amount: 412_900, type: "card",  currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-007", date: "2026-04-28T07:30:00-04:00", to: "Mauricio Acuña",       amount: 80_000,  type: "sip",   currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-008", date: "2026-04-27T17:00:00-04:00", to: "Netflix",              amount: 14.99,    type: "card", currency: "USDC",direction: "out" },
    { id: "tx-2026-0501-009", date: "2026-04-26T09:00:00-04:00", to: "Estación Petropar",    amount: 220_000, type: "qr",    currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-010", date: "2026-04-25T20:10:00-04:00", to: "Sofía González · Mes", amount: 200_000, type: "sip",   currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-011", date: "2026-04-24T14:30:00-04:00", to: "Aldea · Almuerzo",     amount: 58_000,  type: "qr",    currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-012", date: "2026-04-23T11:00:00-04:00", to: "Bolt · Viaje",         amount: 32_500,  type: "card",  currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-013", date: "2026-04-22T10:00:00-04:00", to: "Juan González Pérez",  amount: 350_000, type: "sip",   currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-014", date: "2026-04-21T08:45:00-04:00", to: "ANDE · Factura",       amount: 487_300, type: "qr",    currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-015", date: "2026-04-20T19:30:00-04:00", to: "Burger King",          amount: 78_900,  type: "card",  currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-016", date: "2026-04-19T13:00:00-04:00", to: "Tigo · Recarga",       amount: 50_000,  type: "qr",    currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-017", date: "2026-04-18T16:30:00-04:00", to: "Spotify",              amount: 4.99,     type: "card", currency: "USDC",direction: "out" },
    { id: "tx-2026-0501-018", date: "2026-04-17T10:00:00-04:00", to: "Cashback USDC abril",  amount: 6.24,     type: "swap", currency: "USDC",direction: "in"  },
    { id: "tx-2026-0501-019", date: "2026-04-16T09:00:00-04:00", to: "Esc. Pública 234 · Cuota", amount: 0, type: "sip",     currency: "PYG", direction: "out" },
    { id: "tx-2026-0501-020", date: "2026-04-15T11:11:00-04:00", to: "Topup USDC",           amount: 100.00,   type: "swap", currency: "USDC",direction: "in"  }
  ],
  contacts: [
    { id: "ctc-1", name: "Juan González Pérez", cic_masked: "···7654", alias: "Juan" },
    { id: "ctc-2", name: "Sofía González",      cic_masked: "···2109", alias: "Sofi" },
    { id: "ctc-3", name: "Carlos Benítez",      cic_masked: "···3210", alias: "Carlos" },
    { id: "ctc-4", name: "Mauricio Acuña",      cic_masked: "···7766", alias: "Mau" }
  ],
  qr_pool: [   // QRs mock que o scanner cycle retorna em ordem fixa
    { merchant: "Farmacia Catedral", amount: 87_500, currency: "PYG", payload: "00020101..." },
    { merchant: "Petropar Trinidad", amount: 220_000, currency: "PYG", payload: "00020101..." },
    { merchant: "Aldea Restaurant",   amount: 58_000,  currency: "PYG", payload: "00020101..." }
  ]
};
```

#### II.6.3 · `data/nanduti/mock-tramites.ts`

```ts
export const MOCK_TRAMITES = [
  {
    id: "TR-CEDULA-RENEW",
    name: { es: "Renovación de cédula", gn: "Cédula renovación", jopara: "Cédula renovación" },
    agency: "Identificaciones - Policía Nacional",
    eta_days: 14,
    cost_pyg: 0,
    next_step: "agendamento",
    online: true,
    icon: "id-card"
  },
  {
    id: "TR-ANTECEDENTES",
    name: { es: "Certificado de antecedentes", gn: "Pa'ũmegua kuatia", jopara: "Antecedentes kuatia" },
    agency: "Policía Nacional",
    eta_days: 3,
    cost_pyg: 25_000,
    next_step: "presencial",
    online: false,
    icon: "shield"
  },
  {
    id: "TR-DNIT-PAY",
    name: { es: "Pago de impuestos (DNIT)", gn: "Hepy ñepyrũ (DNIT)", jopara: "Pagos DNIT" },
    agency: "DNIT",
    eta_days: 0,
    cost_pyg: 0,
    next_step: "online",
    online: true,
    icon: "receipt"
  },
  {
    id: "TR-RUC-LOOKUP",
    name: { es: "Consulta de RUC", gn: "Eheka RUC", jopara: "Consulta RUC" },
    agency: "DNIT",
    eta_days: 0,
    cost_pyg: 0,
    next_step: "online",
    online: true,
    icon: "search"
  },
  {
    id: "TR-EMPRESA",
    name: { es: "Alta empresarial", gn: "Empresa hekoñepyrũ", jopara: "Alta empresa" },
    agency: "MIC + DNIT",
    eta_days: 7,
    cost_pyg: 350_000,
    next_step: "online + presencial",
    online: true,
    icon: "briefcase"
  },
  {
    id: "TR-NACIMIENTO",
    name: { es: "Certidão de nacimiento", gn: "Heñói kuatia", jopara: "Certificado nacimiento" },
    agency: "Registro Civil",
    eta_days: 1,
    cost_pyg: 15_000,
    next_step: "online",
    online: true,
    icon: "baby"
  }
];

export const MOCK_TRAMITE_SLOTS = [
  { tramite_id: "TR-CEDULA-RENEW", slot_id: "S1", date: "2026-05-12", time: "09:00", office: "Identificaciones · Asunción Centro" },
  { tramite_id: "TR-CEDULA-RENEW", slot_id: "S2", date: "2026-05-13", time: "14:00", office: "Identificaciones · Asunción Centro" },
  { tramite_id: "TR-CEDULA-RENEW", slot_id: "S3", date: "2026-05-14", time: "11:30", office: "Identificaciones · Lambaré" }
];
```

#### II.6.4 · `data/nanduti/mock-health.ts`

```ts
export const MOCK_USF = [
  { id: "USF-TRI-001", name: "USF Trinidad",            distance_km: 0.8, wait_minutes: 25, type: "usf",          address: "Cap. Brizuela 800",     phone: "+595 21 555 100" },
  { id: "USF-RCH-002", name: "USF Recoleta",            distance_km: 1.7, wait_minutes: 40, type: "usf",          address: "Av. Mcal. López 2200",  phone: "+595 21 555 200" },
  { id: "HOS-IPS-001", name: "Hospital Central IPS",    distance_km: 3.2, wait_minutes: 90, type: "ips_hospital", address: "Dr. Peña 940",          phone: "+595 21 213 000" },
  { id: "HOS-CLI-001", name: "Hospital de Clínicas UNA",distance_km: 6.5, wait_minutes: 120,type: "mspyb_hospital",address: "Av. Lagerenza s/n",    phone: "+595 21 588 0000" },
  { id: "USF-LMB-003", name: "USF Lambaré Norte",       distance_km: 4.1, wait_minutes: 30, type: "usf",          address: "Cacique Lambaré 1500",  phone: "+595 21 555 300" }
];

export const MOCK_VACCINATION_CARD = [
  { vaccine: "BCG",         dose: 1, applied_at: "1991-08-15", status: "ok"      },
  { vaccine: "Hexavalente", dose: 1, applied_at: "1991-10-15", status: "ok"      },
  { vaccine: "Hexavalente", dose: 2, applied_at: "1991-12-15", status: "ok"      },
  { vaccine: "Hexavalente", dose: 3, applied_at: "1992-02-15", status: "ok"      },
  { vaccine: "Tríplice viral", dose: 1, applied_at: "1992-08-15", status: "ok"  },
  { vaccine: "HPV",         dose: 1, applied_at: "2002-08-15", status: "ok"      },
  { vaccine: "Influenza",   dose: 1, applied_at: "2025-04-20", status: "ok"      },
  { vaccine: "Influenza",   dose: 2, applied_at: "2026-04-15", status: "due_soon", next_due: "2026-05-30" }
];

export const MOCK_TRIAGE_RULES = [
  // matched in order, first match wins
  { match: { age_max: 5, symptoms_any: ["fiebre 39", "fiebre 40"], duration_min_h: 4 },
    level: "urgency",
    reasoning: "Niños menores de 5 años con fiebre alta sostenida requieren atención médica urgente.",
    next_steps: ["Acudí a la USF más cercana en menos de 2 horas", "Mantené hidratación", "Si convulsiona, llamá al 911"] },
  { match: { symptoms_any: ["dolor de pecho", "falta de aire severa"] },
    level: "emergency",
    reasoning: "Síntomas cardíacos / respiratorios severos.",
    next_steps: ["Llamá YA al 911", "No conduzcas, esperá la ambulancia"] },
  { match: { symptoms_any: ["dolor de cabeza leve", "tos seca", "resfrío"] },
    level: "autocare",
    reasoning: "Cuadro leve compatible con cuidado domiciliario.",
    next_steps: ["Reposo 48h", "Hidratación", "Paracetamol según indicación", "Si empeora, USF"] }
];
```

#### II.6.5 · `data/nanduti/mock-edu.ts`

```ts
export const MOCK_REPORT_CARD = {
  student: { cic: "5432109", name: "Sofía González", grade: "3° EEB", school: "Escuela Pública 234 - Trinidad" },
  period: "1° Bimestre 2026",
  subjects: [
    { name: "Castellano",            grade: 4.2, attendance_pct: 96, comment: "Buena lectura, mejorar redacción" },
    { name: "Guaraní",               grade: 4.5, attendance_pct: 96, comment: "Excelente expresión oral" },
    { name: "Matemática",            grade: 3.4, attendance_pct: 94, comment: "Refuerzo recomendado en multiplicación" },
    { name: "Ciencias Naturales",    grade: 4.0, attendance_pct: 96, comment: "Participativa" },
    { name: "Estudios Sociales",     grade: 4.1, attendance_pct: 96, comment: "—" },
    { name: "Educación Artística",   grade: 4.8, attendance_pct: 100, comment: "Talento destacado" },
    { name: "Educación Física",      grade: 4.3, attendance_pct: 92, comment: "—" }
  ],
  overall_avg: 4.19,
  conduct: "Muy bien",
  notes: "Sofia muestra avance constante. Recomendamos apoyo en matemática."
};

export const MOCK_SCHOOL_MENU = {
  date: "2026-05-04",
  meals: [
    { meal: "Desayuno", items: ["Leche con cocido", "Mbeju", "Banana"] },
    { meal: "Almuerzo", items: ["Sopa paraguaya", "Pollo asado", "Ensalada de tomate", "Mandioca", "Naranja"] }
  ]
};

export const MOCK_TUTOR_PROMPTS = {
  matematica_3: "Explicá la multiplicación 7×8 con un ejemplo cotidiano de Asunción.",
  lengua_3:     "Inventá una historia corta en jopará sobre un yaguareté.",
  ciencias_3:   "¿Por qué llueve más en Asunción que en Filadelfia (Chaco)?"
};
```

#### II.6.6 · `data/nanduti/mock-crypto.ts`

```ts
export const MOCK_CRYPTO_CARD = {
  balance_usdc: 247.83,
  rate_usdc_pyg: 7_350,
  rate_updated_at: "2026-05-03T18:00:00-04:00",
  source: "mock-circle-api",
  card: {
    brand: "mastercard",
    last4: "4827",
    bin_sponsor: "ueno",
    locked: false,
    monthly_limit_usdc: 800,
    monthly_used_usdc: 132.47
  },
  cashback_pct: 1.0,
  topup_min_pyg: 50_000,
  topup_max_pyg: 5_000_000,
  pending_conversions: [],
  history_swap: [
    { id: "sw-001", at: "2026-04-29T14:45:00-04:00", from: "PYG", to: "USDC", from_amount: 270_900, to_amount: 36.84 },
    { id: "sw-002", at: "2026-04-15T11:11:00-04:00", from: "PYG", to: "USDC", from_amount: 735_000, to_amount: 100.00 }
  ]
};
```

#### II.6.7 · `data/nanduti/mock-info-feed.ts`

```ts
export const MOCK_INFO_FEED = [
  { id: "info-001", category: "salud",      title: "Campaña de vacunación contra influenza extendida hasta 30/may",      excerpt: "MSPyBS amplía la campaña en USF y centros móviles.",                                         source: "MSPyBS",     date: "2026-05-02" },
  { id: "info-002", category: "economia",   title: "Salario mínimo se mantiene en G. 2.798.309 hasta nueva revisión",     excerpt: "MTESS confirma que ajustes serán evaluados en julio.",                                       source: "MTESS",      date: "2026-05-01" },
  { id: "info-003", category: "educacion",  title: "MEC abre matrículas para 2027 a partir de junio",                     excerpt: "Inscripciones online via portal MEC.",                                                       source: "MEC",        date: "2026-04-30" },
  { id: "info-004", category: "seguridad",  title: "Policía Nacional refuerza patrullaje en Asunción Centro",            excerpt: "Operativo permanente hasta fin de mes.",                                                     source: "Policía",   date: "2026-04-29" },
  { id: "info-005", category: "economia",   title: "BCP lanza QR Hub interoperable a partir de mayo",                     excerpt: "Cualquier app paraguaya leerá cualquier QR a partir del 15/may/2026.",                       source: "BCP",        date: "2026-04-27" },
  { id: "info-006", category: "salud",      title: "Línea 155 de Salud Mental ya disponible 24/7",                         excerpt: "Atención gratuita y confidencial vía teléfono y mini-app.",                                  source: "MSPyBS",     date: "2026-04-26" },
  { id: "info-007", category: "educacion",  title: "PISA 2026: nuevas pruebas en septiembre",                              excerpt: "Paraguay participa con 8.000 alumnos.",                                                       source: "OCDE / MEC", date: "2026-04-24" },
  { id: "info-008", category: "seguridad",  title: "Botón pánico oficial en estudio en el Congreso",                      excerpt: "Proyecto avanza en comisión.",                                                               source: "Congreso",  date: "2026-04-22" }
];

export const MOCK_WEEKLY_SUMMARY_ES =
  "Esta semana en Paraguay: el BCP confirmó el lanzamiento del QR Hub interoperable en mayo (cualquier app va a leer cualquier QR), MSPyBS extendió la campaña de influenza hasta el 30/may y reforzó la Línea 155 de salud mental, MEC abrió calendario de matrículas 2027 a partir de junio, y avanza en el Congreso un proyecto sobre botón pánico oficial. En lo económico, MTESS mantiene el salario mínimo hasta la próxima revisión de julio. Mantenete informado y, si necesitás un servicio puntual, pedímelo en castellano o guaraní.";
```

#### II.6.8 · `data/nanduti/mock-alerts.ts`

```ts
export const MOCK_ALERTS_RECENT = [
  { id: "sen-2026-0512-001", category: "flood",   severity: "high", region: "Alto Paraguay",     message: "Río Paraguay sobe 40cm en 24h. Evacuación preventiva recomendada para Bahía Negra y Fuerte Olimpo.", issued_at: "2026-05-03T14:22:00-04:00", source: "SEN + DINAC" },
  { id: "sen-2026-0512-002", category: "drought", severity: "med",  region: "Boquerón Chaco",    message: "Déficit hídrico persistente. SEN entrega 340.000L de agua esta semana.",                       issued_at: "2026-05-02T09:00:00-04:00", source: "SEN" },
  { id: "sen-2026-0512-003", category: "storm",   severity: "med",  region: "Asunción / Central",message: "Tormenta eléctrica prevista para hoy 18h-22h. Precaución con cables y árboles.",              issued_at: "2026-05-03T12:00:00-04:00", source: "DINAC" },
  { id: "sen-2026-0512-004", category: "fire",    severity: "low",  region: "Itapúa",            message: "Foco de incendio controlado por bomberos.",                                                     issued_at: "2026-04-30T11:45:00-04:00", source: "INFONA" },
  { id: "sen-2026-0512-005", category: "flood",   severity: "low",  region: "Pilar / Ñeembucú",  message: "Nivel del río estable. Monitoreo activo.",                                                      issued_at: "2026-04-28T08:00:00-04:00", source: "SEN" }
];

export const MOCK_HEATMAP_DATA = [
  { region: "Asunción",       count: 3, max_severity: "med"  },
  { region: "Central",         count: 5, max_severity: "med"  },
  { region: "Alto Paraguay",   count: 8, max_severity: "high" },
  { region: "Boquerón",        count: 4, max_severity: "med"  },
  { region: "Itapúa",          count: 2, max_severity: "low"  },
  { region: "Ñeembucú",        count: 1, max_severity: "low"  }
];
```

#### II.6.9 · `data/nanduti/mock-police.ts`

```ts
export const MOCK_DEAM = [
  { id: "DEAM-001", name: "DEAM Asunción Centro",   distance_km: 1.2, address: "Cap. Brizuela 1100", phone: "+595 21 555 911", hours: "24h" },
  { id: "DEAM-002", name: "DEAM Lambaré",            distance_km: 4.5, address: "Cacique Lambaré 1700", phone: "+595 21 555 922", hours: "08h-22h" },
  { id: "DEAM-003", name: "DEAM Fernando de la Mora",distance_km: 6.1, address: "Av. Eusebio Ayala 6000", phone: "+595 21 555 933", hours: "24h" }
];

export const MOCK_PROTOCOLS = [
  { protocol: "PNC-2026-0001", category: "violence", status: "received",  created_at: "2026-05-01T22:30:00-04:00" },
  { protocol: "PNC-2026-0002", category: "robbery",  status: "in_review", created_at: "2026-04-28T15:00:00-04:00" }
];

export const MOCK_DISCRETE_MODE = {
  exit_sequence_taps: 7,
  ttl_minutes: 5,
  decoy_app: "calculator"
};
```

#### II.6.10 · `data/nanduti/mock-docs.ts`

```ts
export const MOCK_DOCS = [
  {
    id: "doc-cedula-4521847",
    type: "cedula",
    title: "Cédula de Identidad Civil",
    holder_cic: "4521847",
    issued_at: "2024-09-12",
    expires_at: "2034-09-12",
    fields: { number: "4521847", name: "María González Acosta", birthdate: "1991-08-14", gender: "F" },
    vc_jwt: "eyJ.MOCK.cedula",
    qr_payload: "ND://VC/cedula/4521847"
  },
  {
    id: "doc-ruc-4521847",
    type: "ruc",
    title: "RUC",
    holder_cic: "4521847",
    issued_at: "2024-09-12",
    expires_at: null,
    fields: { ruc: "4521847-2", regime: "Persona Física", status: "Activo" },
    vc_jwt: "eyJ.MOCK.ruc",
    qr_payload: "ND://VC/ruc/4521847-2"
  },
  {
    id: "doc-ips-4521847",
    type: "ips",
    title: "Certificado IPS",
    holder_cic: "4521847",
    issued_at: "2025-01-10",
    expires_at: "2027-01-10",
    fields: { ips_id: "IPS-789-456-123", facility: "Hospital Central IPS", status: "Activa" },
    vc_jwt: "eyJ.MOCK.ips",
    qr_payload: "ND://VC/ips/789456123"
  },
  {
    id: "doc-school-5432109",
    type: "school",
    title: "Boletín Escolar — Sofía González",
    holder_cic: "5432109",
    issued_at: "2026-04-30",
    expires_at: null,
    fields: { school: "Escuela Pública 234", grade: "3° EEB", overall_avg: 4.19 },
    vc_jwt: "eyJ.MOCK.school",
    qr_payload: "ND://VC/school/5432109"
  },
  {
    id: "doc-vaccine-4521847",
    type: "vaccine",
    title: "Carné de Vacunación",
    holder_cic: "4521847",
    issued_at: "2025-04-20",
    expires_at: null,
    fields: { last_vaccine: "Influenza 2025", next_due: "2026-05-30" },
    vc_jwt: "eyJ.MOCK.vaccine",
    qr_payload: "ND://VC/vaccine/4521847"
  },
  {
    id: "doc-vehicle-4521847",
    type: "vehicle",
    title: "Registro Vehicular — VW Gol 2018",
    holder_cic: "4521847",
    issued_at: "2024-06-01",
    expires_at: "2026-06-01",
    fields: { plate: "AAAA000", brand: "Volkswagen", model: "Gol", year: 2018 },
    vc_jwt: "eyJ.MOCK.vehicle",
    qr_payload: "ND://VC/vehicle/AAAA000"
  }
];

export const MOCK_AUDIT_LOG = [
  { doc_id: "doc-cedula-4521847", at: "2026-05-01T10:30:00-04:00", who: "Banco Itaú · KYC",      ip: "190.x.x.x", purpose: "Apertura de cuenta" },
  { doc_id: "doc-cedula-4521847", at: "2026-04-15T14:22:00-04:00", who: "Aerolíneas Paraguayas", ip: "200.x.x.x", purpose: "Check-in vuelo" },
  { doc_id: "doc-ips-4521847",    at: "2026-03-20T09:15:00-04:00", who: "Hospital IPS Central",  ip: "172.x.x.x", purpose: "Atención médica" },
  { doc_id: "doc-school-5432109", at: "2026-04-30T16:00:00-04:00", who: "MEC · Boletín portal",  ip: "10.x.x.x",  purpose: "Emisión boletín" }
];
```

### II.7 · Libs Compartilhadas (código verbatim)

#### II.7.1 · `lib/nanduti/cedula-validator.ts` (validação real, não mock)

```ts
/**
 * Valida CIC paraguaia via algoritmo módulo 11.
 * Aceita string com pontos/espaços; remove não-dígitos.
 * Mínimo 6 dígitos, máximo 9.
 */
export function validateCedula(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 9) return false;
  const num = digits.slice(0, -1);
  const check = parseInt(digits.slice(-1), 10);
  const sum = num
    .split("")
    .reverse()
    .reduce((acc, d, i) => acc + parseInt(d, 10) * ((i % 6) + 2), 0);
  const remainder = sum % 11;
  const expected = remainder < 2 ? 0 : 11 - remainder;
  return expected === check;
}

export function maskCedula(cic: string): string {
  const digits = cic.replace(/\D/g, "");
  if (digits.length < 4) return "···";
  return "···" + digits.slice(-4);
}
```

#### II.7.2 · `lib/nanduti/mock-delay.ts`

```ts
/**
 * Latência realista por tipo de operação.
 * Determinística (não usa Math.random — usa hash do input para reproducibilidade).
 */
const DELAYS: Record<string, [number, number]> = {
  default:    [200, 400],
  llm:        [800, 1500],
  payment:    [1000, 1800],
  search:     [300, 600],
  fetch_ext:  [600, 1200],
  panic:      [200, 400]
};

export async function mockDelay(kind: keyof typeof DELAYS = "default", seed = 0): Promise<void> {
  const [min, max] = DELAYS[kind] ?? DELAYS.default;
  const span = max - min;
  const ms = min + ((seed * 2654435761) % span);
  return new Promise((r) => setTimeout(r, ms));
}
```

#### II.7.3 · `lib/nanduti/audit-logger.ts`

```ts
type AuditEntry = {
  doc_id: string;
  at: string;            // ISO timestamp
  who: string;           // entidade que acessou
  ip: string;
  purpose: string;
};

const memoryLog: AuditEntry[] = [];

export function logAccess(entry: AuditEntry) {
  memoryLog.push(entry);
  // Em produção: persistir em Redis/DB; aqui in-memory é suficiente para mock
}

export function getAuditLog(doc_id?: string): AuditEntry[] {
  if (!doc_id) return [...memoryLog];
  return memoryLog.filter((e) => e.doc_id === doc_id);
}
```

#### II.7.4 · `lib/nanduti/redis-cache.ts`

```ts
/**
 * Wrapper sobre redis client existente (lib/redis).
 * Convenção de chave: `nanduti:${citizenId}:${intentHash}:${lang}`.
 * TTL default 300s.
 */
import { redis } from "@/lib/redis"; // já existe no iconsaiIcon

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = 300): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    /* ignora — modo gracioso se Redis offline */
  }
}

export function makeKey(parts: (string | number)[]): string {
  return "nanduti:" + parts.join(":");
}
```

#### II.7.5 · `lib/nanduti/tool-registry.ts` (28 tools)

```ts
import { z } from "zod";

export const TOOLS = {
  "wallet.transfer": {
    description: "Transfere PYG ou USDC para um contato pelo nome, alias, cédula ou QR.",
    schema: z.object({ to: z.string(), amount: z.number().positive(), currency: z.enum(["PYG","USDC"]), pin: z.string().length(4) }),
    endpoint: "/api/nanduti/wallet/transfer"
  },
  "wallet.qr_pay": {
    description: "Lê QR e dispara pagamento.",
    schema: z.object({ qr_payload: z.string(), amount: z.number().positive().optional() }),
    endpoint: "/api/nanduti/wallet/qr-pay"
  },
  "wallet.history":  { description: "Histórico de transações.", schema: z.object({ limit: z.number().optional() }), endpoint: "/api/nanduti/wallet/history" },
  "wallet.balance":  { description: "Saldo atual PYG e USDC.",  schema: z.object({}),                                endpoint: "/api/nanduti/wallet/balance" },

  "gov.tramite_search": { description: "Busca trâmites por palavra-chave.", schema: z.object({ query: z.string() }),                                  endpoint: "/api/nanduti/gov/tramite-search" },
  "gov.tramite_book":   { description: "Reserva slot de atendimento.",      schema: z.object({ tramite_id: z.string(), slot_id: z.string() }),       endpoint: "/api/nanduti/gov/tramite-book" },
  "gov.ruc_lookup":     { description: "Consulta dados de um RUC.",          schema: z.object({ ruc: z.string() }),                                   endpoint: "/api/nanduti/gov/ruc-lookup" },

  "health.triage":         { description: "Triagem de sintomas.",        schema: z.object({ age: z.number(), symptoms: z.array(z.string()), severity_self_report: z.enum(["low","medium","high"]), duration_hours: z.number() }), endpoint: "/api/nanduti/health/triage" },
  "health.book_appointment": { description: "Agenda consulta IPS/MSPyBS.", schema: z.object({ facility_id: z.string(), datetime: z.string() }),       endpoint: "/api/nanduti/health/appointment" },
  "health.vaccination_card": { description: "Carteira de vacinação.",      schema: z.object({}),                                                       endpoint: "/api/nanduti/health/vaccination" },

  "edu.report_card": { description: "Boletim escolar de um aluno.",      schema: z.object({ student_cic: z.string() }),                              endpoint: "/api/nanduti/edu/report-card" },
  "edu.enroll":      { description: "Pré-matrícula próxima série.",       schema: z.object({ student_cic: z.string(), target_grade: z.string() }),  endpoint: "/api/nanduti/edu/enroll" },
  "edu.tutor":       { description: "Tutor IA bilíngue.",                  schema: z.object({ question: z.string(), subject: z.string(), grade_level: z.string(), lang: z.enum(["es","gn","jopara"]) }), endpoint: "/api/nanduti/edu/tutor" },

  "crypto.balance":     { description: "Saldo USDC + cotação.",   schema: z.object({}),                              endpoint: "/api/nanduti/crypto/balance" },
  "crypto.topup":       { description: "Carrega USDC com PYG.",   schema: z.object({ pyg_amount: z.number().positive() }), endpoint: "/api/nanduti/crypto/topup" },
  "crypto.toggle_lock": { description: "Bloqueia/desbloqueia.",   schema: z.object({}),                              endpoint: "/api/nanduti/crypto/toggle-lock" },

  "info.feed":            { description: "Feed informativo.",         schema: z.object({ categories: z.array(z.string()).optional(), limit: z.number().optional() }), endpoint: "/api/nanduti/info/feed" },
  "info.weekly_summary":  { description: "Resumo semanal IA.",        schema: z.object({ lang: z.enum(["es","gn","jopara"]) }),                                       endpoint: "/api/nanduti/info/weekly-summary" },

  "alerts.subscribe": { description: "Subscreve alertas naturais.", schema: z.object({ geo: z.object({ lat: z.number(), lng: z.number() }), categories: z.array(z.string()) }), endpoint: "/api/nanduti/alerts/subscribe" },
  "alerts.recent":    { description: "Alertas recentes.",            schema: z.object({ region: z.string().optional() }),                                                        endpoint: "/api/nanduti/alerts/recent" },

  "police.complaint": { description: "Registra denúncia.",       schema: z.object({ category: z.string(), description: z.string(), location: z.object({ lat: z.number(), lng: z.number() }).optional(), anonymous: z.boolean() }), endpoint: "/api/nanduti/police/complaint" },
  "police.panic":     { description: "Botão pânico.",            schema: z.object({ location: z.object({ lat: z.number(), lng: z.number(), accuracy_m: z.number() }), audio_blob_id: z.string().optional(), silent: z.boolean().optional() }), endpoint: "/api/nanduti/police/panic" },
  "police.track":     { description: "Status de denúncia.",      schema: z.object({ protocol: z.string() }),                                                                                                                          endpoint: "/api/nanduti/police/track" },

  "docs.list":  { description: "Lista documentos do cidadão.",                  schema: z.object({}),                                                                                                                  endpoint: "/api/nanduti/docs/list" },
  "docs.share": { description: "Compartilha doc com minimização de campos.",    schema: z.object({ doc_id: z.string(), fields: z.array(z.string()), recipient_id: z.string(), ttl_minutes: z.number() }),               endpoint: "/api/nanduti/docs/share" },
  "docs.audit": { description: "Audit trail \"quien vió mis datos\".",          schema: z.object({ doc_id: z.string().optional() }),                                                                                  endpoint: "/api/nanduti/docs/audit" },

  "auth.cic_otp": { description: "Solicita OTP via SMS após validar CIC.", schema: z.object({ cic: z.string() }),                                                                                                  endpoint: "/api/nanduti/auth/cic-otp" }
} as const;

export type ToolName = keyof typeof TOOLS;
```

### II.8 · Contratos de API (28 endpoints, handlers determinísticos)

> **Padrão de handler.** Toda rota: POST, JSON, runtime Node, cache Redis 300s, rate-limit 30/min/IP. Se Anthropic API falhar, retorna fallback determinístico (especificado em cada). Latência via `mockDelay`.

#### II.8.1 · `app/api/nanduti/chat/route.ts`

```ts
import { NextRequest } from "next/server";
import { TOOLS } from "@/lib/nanduti/tool-registry";
import { mockDelay } from "@/lib/nanduti/mock-delay";
import { cacheGet, cacheSet, makeKey } from "@/lib/nanduti/redis-cache";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

type ChatReq = {
  citizenId: string;
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  lang: "es" | "gn" | "jopara";
  voice?: boolean;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatReq;
  const intentHash = require("crypto").createHash("sha1").update(body.message + body.lang).digest("hex").slice(0, 12);
  const key = makeKey(["chat", body.citizenId, intentHash, body.lang]);
  const cached = await cacheGet<string>(key);
  if (cached) return new Response(cached, { headers: { "content-type": "text/event-stream" } });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback determinístico: mensagem fixa contextualizada
    await mockDelay("llm", body.message.length);
    const fallback = JSON.stringify({
      reply: body.lang === "es"
        ? "Estoy en modo demo sin conexión. Probá pedir transferencia, agendar médico, ver boletín escolar o revisar tus documentos."
        : "Demo modo-pe aiméva. Eporandu eñembohasa viru, médico, boletín térã eheka kuatia.",
      tool_calls: []
    });
    await cacheSet(key, fallback);
    return Response.json(JSON.parse(fallback));
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: `Sos Ñandutí, asistente IA del Estado paraguayo. Respondés en ${body.lang}. Llamás tools cuando el usuario pide acción. Citás siempre la fuente. NO inventás datos personales.`,
    tools: Object.entries(TOOLS).map(([name, t]) => ({
      name: name.replace(".", "_"),
      description: t.description,
      input_schema: { type: "object", properties: {} } // expandir conforme schema do tool
    })),
    messages: [...body.history, { role: "user", content: body.message }]
  });

  const out = JSON.stringify({ reply: response.content[0].type === "text" ? response.content[0].text : "", tool_calls: [] });
  await cacheSet(key, out);
  return Response.json(JSON.parse(out));
}
```

#### II.8.2 · `app/api/nanduti/auth/identidad/route.ts`

```ts
import { NextRequest } from "next/server";
import { MOCK_CITIZEN } from "@/data/nanduti/mock-citizen";
import { mockDelay } from "@/lib/nanduti/mock-delay";

export async function POST(req: NextRequest) {
  await mockDelay("default");
  // Mock OAuth: aceita qualquer "code" e devolve o cidadão padrão
  const { code } = await req.json();
  if (!code) return Response.json({ error: "missing_code" }, { status: 400 });
  return Response.json({
    token: "mock-jwt." + Buffer.from(MOCK_CITIZEN.cic).toString("base64"),
    citizen: MOCK_CITIZEN,
    expires_in: 3600
  });
}
```

#### II.8.3 · `app/api/nanduti/auth/cic-otp/route.ts`

```ts
import { NextRequest } from "next/server";
import { validateCedula } from "@/lib/nanduti/cedula-validator";
import { mockDelay } from "@/lib/nanduti/mock-delay";

export async function POST(req: NextRequest) {
  await mockDelay("default");
  const { cic, otp } = await req.json();
  if (!cic) return Response.json({ error: "missing_cic" }, { status: 400 });
  if (!validateCedula(cic)) return Response.json({ error: "invalid_cic" }, { status: 400 });
  if (!otp) {
    // Step 1: gera OTP mock (sempre 123456) e "envia" SMS
    return Response.json({ stage: "otp_sent", help: "Demo: usá 123456" });
  }
  // Step 2: valida OTP
  if (otp !== "123456") return Response.json({ error: "invalid_otp" }, { status: 400 });
  return Response.json({ stage: "logged_in", token: "mock-jwt." + cic });
}
```

#### II.8.4 · Wallet APIs (4)

```ts
// app/api/nanduti/wallet/transfer/route.ts
import { NextRequest } from "next/server";
import { MOCK_WALLET } from "@/data/nanduti/mock-wallet";
import { mockDelay } from "@/lib/nanduti/mock-delay";

export async function POST(req: NextRequest) {
  const { to, amount, currency, pin } = await req.json();
  if (pin !== "0000") return Response.json({ error: "invalid_pin" }, { status: 400 });
  await mockDelay("payment", amount);
  const recipient = MOCK_WALLET.contacts.find(c => c.alias === to || c.name.includes(to)) ?? { name: to, cic_masked: "···0000" };
  return Response.json({
    tx_id: "tx-" + Date.now(),
    status: "confirmed",
    fee_pyg: 0,
    eta_seconds: 0,
    recipient_resolved: recipient,
    new_balance_pyg: MOCK_WALLET.pyg_balance - (currency === "PYG" ? amount : 0),
    new_balance_usdc: MOCK_WALLET.usdc_balance - (currency === "USDC" ? amount : 0)
  });
}

// app/api/nanduti/wallet/qr-pay/route.ts
export async function POST(req: NextRequest) {
  const { qr_payload } = await req.json();
  await mockDelay("payment");
  // Cycle através do qr_pool determinístico
  const idx = Math.abs(hash(qr_payload)) % MOCK_WALLET.qr_pool.length;
  const target = MOCK_WALLET.qr_pool[idx];
  return Response.json({ tx_id: "tx-qr-" + Date.now(), status: "confirmed", merchant: target.merchant, amount: target.amount, currency: target.currency });
}
function hash(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

// app/api/nanduti/wallet/history/route.ts
export async function POST() {
  await mockDelay("default");
  return Response.json({ tx: MOCK_WALLET.recent_tx });
}

// app/api/nanduti/wallet/balance/route.ts
export async function POST() {
  await mockDelay("default");
  return Response.json({ pyg: MOCK_WALLET.pyg_balance, usdc: MOCK_WALLET.usdc_balance, rate: MOCK_WALLET.usdc_pyg_rate });
}
```

#### II.8.5 · Gov APIs (3)

```ts
// app/api/nanduti/gov/tramite-search/route.ts
import { MOCK_TRAMITES } from "@/data/nanduti/mock-tramites";
export async function POST(req: NextRequest) {
  const { query } = await req.json();
  await mockDelay("search");
  const q = (query || "").toLowerCase();
  const matches = MOCK_TRAMITES.filter(t => t.name.es.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  return Response.json({ results: matches });
}

// app/api/nanduti/gov/tramite-book/route.ts
import { MOCK_TRAMITE_SLOTS } from "@/data/nanduti/mock-tramites";
export async function POST(req: NextRequest) {
  const { tramite_id, slot_id } = await req.json();
  await mockDelay("default");
  const slot = MOCK_TRAMITE_SLOTS.find(s => s.tramite_id === tramite_id && s.slot_id === slot_id);
  if (!slot) return Response.json({ error: "slot_not_found" }, { status: 404 });
  return Response.json({ booked: true, confirmation: "BK-" + Date.now(), slot });
}

// app/api/nanduti/gov/ruc-lookup/route.ts
export async function POST(req: NextRequest) {
  const { ruc } = await req.json();
  await mockDelay("fetch_ext");
  if (!ruc?.match(/^\d{6,9}-\d$/)) return Response.json({ error: "invalid_ruc" }, { status: 400 });
  return Response.json({ ruc, name: "Mock Contribuyente S.A.", regime: "Persona Física", status: "Activo" });
}
```

#### II.8.6 · Health APIs (3)

```ts
// app/api/nanduti/health/triage/route.ts
import { MOCK_USF, MOCK_TRIAGE_RULES } from "@/data/nanduti/mock-health";
export async function POST(req: NextRequest) {
  const body = await req.json();
  await mockDelay("llm");
  const rule = MOCK_TRIAGE_RULES.find(r => {
    if (r.match.age_max && body.age > r.match.age_max) return false;
    if (r.match.symptoms_any && !body.symptoms.some((s: string) => r.match.symptoms_any!.some(rs => s.includes(rs)))) return false;
    return true;
  }) ?? MOCK_TRIAGE_RULES[2]; // default autocare
  return Response.json({
    level: rule.level,
    reasoning: rule.reasoning,
    next_steps: rule.next_steps,
    facilities: MOCK_USF.slice(0, 3),
    disclaimer: "Esta orientación es informativa. NO sustituye atención médica profesional."
  });
}

// app/api/nanduti/health/appointment/route.ts
export async function POST(req: NextRequest) {
  const { facility_id, datetime } = await req.json();
  await mockDelay("default");
  return Response.json({ booked: true, confirmation: "HC-" + Date.now(), facility_id, datetime });
}

// app/api/nanduti/health/vaccination/route.ts
import { MOCK_VACCINATION_CARD } from "@/data/nanduti/mock-health";
export async function POST() {
  await mockDelay("default");
  return Response.json({ card: MOCK_VACCINATION_CARD });
}
```

#### II.8.7 · Edu APIs (3)

```ts
// app/api/nanduti/edu/report-card/route.ts
import { MOCK_REPORT_CARD } from "@/data/nanduti/mock-edu";
export async function POST(req: NextRequest) {
  const { student_cic } = await req.json();
  await mockDelay("default");
  if (student_cic !== MOCK_REPORT_CARD.student.cic) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json(MOCK_REPORT_CARD);
}

// app/api/nanduti/edu/enroll/route.ts
export async function POST(req: NextRequest) {
  const { student_cic, target_grade } = await req.json();
  await mockDelay("default");
  return Response.json({ enrolled: true, confirmation: "EN-" + Date.now(), target_grade });
}

// app/api/nanduti/edu/tutor/route.ts
import Anthropic from "@anthropic-ai/sdk";
export async function POST(req: NextRequest) {
  const { question, subject, grade_level, lang } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    await mockDelay("llm");
    return Response.json({
      answer: lang === "gn"
        ? "Demo modo-pe ndaikatúi ambohovái pora. Eha'ãrõ, terã eporandujey upéi."
        : "Estoy en modo demo. Reformulá la pregunta cuando vuelva la conexión."
    });
  }
  const client = new Anthropic({ apiKey });
  const r = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system: `Sos tutor de ${subject} para alumno de ${grade_level}. Respondé en ${lang}. Sin jerga. Ejemplo simple.`,
    messages: [{ role: "user", content: question }]
  });
  return Response.json({ answer: r.content[0].type === "text" ? r.content[0].text : "" });
}
```

#### II.8.8 · Crypto APIs (3)

```ts
// app/api/nanduti/crypto/balance/route.ts
import { MOCK_CRYPTO_CARD } from "@/data/nanduti/mock-crypto";
export async function POST() {
  await mockDelay("default");
  return Response.json(MOCK_CRYPTO_CARD);
}

// app/api/nanduti/crypto/topup/route.ts
export async function POST(req: NextRequest) {
  const { pyg_amount } = await req.json();
  if (pyg_amount < MOCK_CRYPTO_CARD.topup_min_pyg) return Response.json({ error: "below_min" }, { status: 400 });
  await mockDelay("payment");
  const usdc = +(pyg_amount / MOCK_CRYPTO_CARD.rate_usdc_pyg).toFixed(2);
  return Response.json({ ok: true, usdc_credited: usdc, new_balance_usdc: MOCK_CRYPTO_CARD.balance_usdc + usdc });
}

// app/api/nanduti/crypto/toggle-lock/route.ts
export async function POST() {
  await mockDelay("default");
  return Response.json({ locked: !MOCK_CRYPTO_CARD.card.locked });
}
```

#### II.8.9 · Info, Alerts, Police, Docs (15)

```ts
// info/feed
import { MOCK_INFO_FEED, MOCK_WEEKLY_SUMMARY_ES } from "@/data/nanduti/mock-info-feed";
export async function POST(req: NextRequest) {
  const { categories, limit } = await req.json();
  await mockDelay("default");
  let list = MOCK_INFO_FEED;
  if (categories?.length) list = list.filter(i => categories.includes(i.category));
  return Response.json({ feed: list.slice(0, limit ?? 20) });
}
// info/weekly-summary
export async function POST(req: NextRequest) {
  await mockDelay("llm");
  return Response.json({ summary: MOCK_WEEKLY_SUMMARY_ES });
}

// alerts/subscribe
export async function POST(req: NextRequest) {
  const body = await req.json();
  await mockDelay("default");
  return Response.json({ subscribed: true, sub_id: "ALT-" + Date.now(), categories: body.categories });
}
// alerts/recent
import { MOCK_ALERTS_RECENT } from "@/data/nanduti/mock-alerts";
export async function POST(req: NextRequest) {
  const { region } = await req.json();
  await mockDelay("default");
  let list = MOCK_ALERTS_RECENT;
  if (region) list = list.filter(a => a.region.includes(region));
  return Response.json({ alerts: list });
}

// police/complaint
export async function POST(req: NextRequest) {
  const body = await req.json();
  await mockDelay("default");
  return Response.json({ protocol: "PNC-2026-" + String(Date.now() % 10000).padStart(4, "0"), status: "received", anonymous: body.anonymous });
}
// police/panic
import { MOCK_DEAM, MOCK_DISCRETE_MODE } from "@/data/nanduti/mock-police";
export async function POST(req: NextRequest) {
  await mockDelay("panic");
  const proto = "PNC-PANIC-" + Date.now();
  return Response.json({
    protocol: proto,
    dispatched_to: ["911", "137", "deam"],
    eta_minutes: 8,
    nearest_deam: MOCK_DEAM[0],
    discrete_mode_url: "/icon/nanduti/discrete?p=" + proto,
    discrete_config: MOCK_DISCRETE_MODE
  });
}
// police/track
import { MOCK_PROTOCOLS } from "@/data/nanduti/mock-police";
export async function POST(req: NextRequest) {
  const { protocol } = await req.json();
  await mockDelay("default");
  const found = MOCK_PROTOCOLS.find(p => p.protocol === protocol);
  return Response.json(found ?? { error: "not_found" });
}

// docs/list
import { MOCK_DOCS } from "@/data/nanduti/mock-docs";
export async function POST() {
  await mockDelay("default");
  return Response.json({ docs: MOCK_DOCS });
}
// docs/share
import { logAccess } from "@/lib/nanduti/audit-logger";
export async function POST(req: NextRequest) {
  const { doc_id, fields, recipient_id, ttl_minutes } = await req.json();
  await mockDelay("default");
  logAccess({ doc_id, at: new Date().toISOString(), who: recipient_id, ip: "0.0.0.0", purpose: "share via Nanduti" });
  const expires_at = new Date(Date.now() + ttl_minutes * 60_000).toISOString();
  return Response.json({
    share_url: "https://icon.iconsai.ai/icon/nanduti/share/" + doc_id + "?t=" + Date.now(),
    vc_jwt: "eyJ.MOCK." + doc_id,
    fields_shared: fields,
    expires_at
  });
}
// docs/audit
import { getAuditLog } from "@/lib/nanduti/audit-logger";
import { MOCK_AUDIT_LOG } from "@/data/nanduti/mock-docs";
export async function POST(req: NextRequest) {
  const { doc_id } = await req.json();
  await mockDelay("default");
  const live = getAuditLog(doc_id);
  return Response.json({ entries: [...MOCK_AUDIT_LOG.filter(e => !doc_id || e.doc_id === doc_id), ...live] });
}
```

#### II.8.10 · STT e TTS (2)

```ts
// app/api/nanduti/stt/route.ts — Whisper proxy
import OpenAI from "openai";
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "stt_unavailable_demo", text: "(demo) Transferencia 200.000 guaraníes a Juan" });
  const formData = await req.formData();
  const file = formData.get("audio") as File;
  const client = new OpenAI({ apiKey });
  const r = await client.audio.transcriptions.create({ file, model: "whisper-1", language: "es" });
  return Response.json({ text: r.text });
}

// app/api/nanduti/tts/route.ts — ElevenLabs proxy
export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const { text, lang } = await req.json();
  if (lang === "gn" || !apiKey) {
    // Guaraní fallback texto-only
    return Response.json({ audio_url: null, fallback: "text-only", lang });
  }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/ANA_VOICE_ID`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ text, voice_settings: { stability: 0.5, similarity_boost: 0.7 } })
  });
  const buf = await r.arrayBuffer();
  return new Response(buf, { headers: { "content-type": "audio/mpeg" } });
}
```

### II.9 · Componentes (props, comportamento, CSS)

> Cada componente tem props tipadas + comportamento + classes CSS críticas. Quem implementa não inventa estilo.

#### II.9.1 · `<NandutiShell />` — `components/nanduti/NandutiShell.tsx`

**Props:** nenhuma (consome `useNandutiLocale` + `useNandutiAuth`).
**Estado interno:** `phase: "onboarding" | "ready"`, `activeApp: AppId | null`, `mobileDrawerOpen: boolean`.
**Layout:**
- Desktop ≥1024px: `display: grid; grid-template-columns: 7fr 3fr; gap: 24px;`
- Mobile <1024px: chat full-screen; sidebar via `<dialog>` bottom-sheet.
**Header fixo:** logo Ñandutí (32px) + wordmark gradient + `<LangSwitcher />` + botão login (se não autenticado).
**Footer:** texto fino `var(--nd-t3)` "© 2026 · Ñandutí · powered by IconsAI".
**Comportamento:**
1. Ao montar, lê `localStorage.getItem("nanduti.session")`. Se ausente, renderiza `<Onboarding onComplete={() => setPhase("ready")} />`.
2. Após autenticação, renderiza `<ChatCenter />` + `<Sidebar onAppSelect={(id) => setActiveApp(id)} />`.
3. Quando `activeApp` é definido em mobile, abre `<dialog>` em modo bottom-sheet com o componente `<MiniAppHost appId={activeApp} />`.

#### II.9.2 · `<Onboarding />` — 3 telas

**Props:** `{ onComplete: (citizen: Citizen) => void }`.
**Estado:** `step: 0 | 1 | 2`, `selectedLang: NandutiLocale`, `cic: string`, `otp: string`.
**Tela 0 (Idioma):** título `t("onboarding.step1_title")` + 3 botões grandes (es/gn/jopará). Click setLocale + step=1.
**Tela 1 (Login):** dois CTAs.
- **A** `t("onboarding.step2_btn_eid")` → `POST /api/nanduti/auth/identidad { code: "MOCK_CODE" }` → onComplete(citizen).
- **B** `t("onboarding.step2_btn_cic")` → mostra `<CedulaInput />`. Submit → `POST /api/nanduti/auth/cic-otp { cic }`. Backend devolve `stage:"otp_sent"`. Mostrar campo OTP. Submit OTP → `POST /api/nanduti/auth/cic-otp { cic, otp }` → onComplete.

**Tela 2 (Boas-vindas):** título `t("onboarding.step3_title", { name })` + 3 cards de sugestão (`step3_suggest_pay`, `step3_suggest_health`, `step3_suggest_edu`). Cada card click → seta `chat.preset = sugestão` e fecha onboarding.

**Estilo:** background gradient orbs (3 orbs, mesmos da hero atual). Cards com border `--nd-border-active`, padding 24px, border-radius 16px.

#### II.9.3 · `<ChatCenter />` — chat IA streaming + voz

**Props:** `{ citizenId: string; locale: NandutiLocale; onToolResult: (app: AppId, payload: any) => void }`.
**Estado:** `messages: Msg[]`, `input: string`, `isListening: boolean`, `isThinking: boolean`.
**Layout:** `<div class="nd-chat">` com `<div class="nd-chat__scroll">` (mensagens) + `<form class="nd-chat__input">` com `<textarea>` auto-grow + `<VoiceButton />` + botão Enviar.
**Comportamento:**
1. Submit → `POST /api/nanduti/chat { citizenId, message, history, lang }`.
2. Render reply progressivamente (SSE token-by-token).
3. Se response inclui `tool_calls`, dispara `onToolResult(toolName.split(".")[0], result)` para a Sidebar abrir o mini-app correspondente.
4. Voice: `<VoiceButton onTranscript={text => setInput(text); submit()} />`.
**Estilo crítico:**
- Mensagens user: alinhadas à direita, fundo `var(--nd-cyan)/0.12`, border-radius 18px 18px 4px 18px.
- Mensagens IA: alinhadas à esquerda, fundo `var(--nd-surface)`, gradient border-left 3px ciano→roxo.
- Input: backdrop-filter blur(16px), fundo `rgba(20,20,32,0.7)`.

#### II.9.4 · `<Sidebar />` — grade 9 mini-apps

**Props:** `{ onAppSelect: (id: AppId) => void; activeApp?: AppId }`.
**Layout:** grid 3×3 (desktop) / 3×3 também em mobile dentro do drawer.
**Cada card:**
```tsx
<button class="nd-card" data-app={id} style={{ "--accent": MINIAPP_COLOR[id] }}>
  <span class="nd-card__icon">{ICON[id]}</span>
  <span class="nd-card__label">{t(`miniapp.${id}`)}</span>
  {badge && <span class="nd-card__badge">{badge}</span>}
</button>
```
**Estilo:** `nd-card { background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 16px; padding: 16px; aspect-ratio: 1; transition: transform 160ms, border-color 160ms }`.
Hover/focus: `border-color: var(--nd-border-active); transform: translateY(-2px)`.
Active: `border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent)/0.3`.

#### II.9.5 · 9 Mini-Apps — props + comportamento

| Componente | Props | Tools chamadas | UI principal |
|---|---|---|---|
| `<WalletApp />` | `{ initialView?: "balance"\|"transfer"\|"history" }` | `wallet.balance`, `wallet.transfer`, `wallet.history`, `wallet.qr_pay` | Saldo PYG/USDC + tabs Transferir/QR/Histórico |
| `<GovApp />` | `{ initialQuery?: string }` | `gov.tramite_search`, `gov.tramite_book`, `gov.ruc_lookup` | Lista de 6 trâmites + botão buscar + slot picker |
| `<HealthApp />` | `{ initialMode?: "triage"\|"book"\|"vaccine"\|"mental" }` | `health.triage`, `health.book_appointment`, `health.vaccination_card` | Tabs: Triaje · Agendar · Vacunas · Salud Mental |
| `<EduApp />` | `{ studentCic?: string }` | `edu.report_card`, `edu.enroll`, `edu.tutor` | Tabs: Boletín · Matrícula · Tutor IA · Menú |
| `<CryptoCardApp />` | — | `crypto.balance`, `crypto.topup`, `crypto.toggle_lock` | Saldo USDC + cotação + botões Topup/Lock + disclaimer permanente |
| `<InfoApp />` | `{ category?: string }` | `info.feed`, `info.weekly_summary` | Feed + filtro categoria + resumo semanal |
| `<AlertsApp />` | — | `alerts.subscribe`, `alerts.recent` | Subscribe (geo + categorias) + lista recentes + heatmap D3 |
| `<PoliceApp />` | `{ panicMode?: boolean }` | `police.complaint`, `police.panic`, `police.track` | Panic button 80px no topo + abas Denuncia · Anônima · Seguir |
| `<DocsApp />` | `{ docId?: string }` | `docs.list`, `docs.share`, `docs.audit` | Carteira de documentos com VCCard + botão Auditar |

**Comportamento comum a todos:** receber `payload` quando ChatCenter dispara `onToolResult`, abrir tab/view correspondente, renderizar resultado da tool.

#### II.9.6 · 7 Primitivos

**`<VoiceButton />`** — props `{ onTranscript: (text: string) => void; locale: NandutiLocale }`.
- Botão circular 80px, gradient ciano→roxo, ícone microfone.
- `onMouseDown`/`onTouchStart` → inicia `MediaRecorder` (audio/webm).
- `onMouseUp`/`onTouchEnd` → para, envia blob via `multipart/form-data` para `/api/nanduti/stt`.
- Enquanto grava: anel pulsante + waveform animado (4 barras CSS animation).
- Após response: chama `onTranscript(text)`.

**`<CedulaInput />`** — props `{ onValid: (cic: string) => void; locale: NandutiLocale }`.
- Input numérico com formatação (`1.234.567`).
- onChange: chama `validateCedula`. Se válido → label verde + chama `onValid`. Se inválido → label vermelho `t("onboarding.step2_cic_invalid")`.

**`<QRScanner />`** — props `{ onScan: (payload: string) => void }`.
- Mock: simula câmera com placeholder gradient. Botão "Escanear" cycle através de `MOCK_WALLET.qr_pool`.
- Cada click avança pro próximo QR e chama `onScan(payload)`.

**`<VCCard />`** — props `{ doc: MockDoc; onShare?: () => void }`.
- Card com border gradient, mostra `title`, fields chave, QR (gerado de `qr_payload` via `qrcode` lib), botão Compartilhar.
- Layout: 320px largura desktop, full-width mobile, padding 20px.

**`<AuditTrail />`** — props `{ docId?: string }`.
- Chama `docs.audit` no mount.
- Lista entries em ordem cronológica reversa: `[ícone] [who] [purpose] [date relative]`.
- Empty state: `t("docs.audit_empty")`.

**`<DiscreteCalc />`** — props `{ exitSequenceTaps: number; onExit: () => void; protocol: string }`.
- Calculadora **funcional** (operações básicas + - × ÷).
- Conta toques no `<div>` do display. Quando atinge `exitSequenceTaps` (7), chama `onExit()`.
- Visualmente, NADA indica que é modo discreto. Aparência: calculadora padrão.

**`<PanicButton />`** — props `{ onPanic: () => Promise<{ protocol: string; discrete_mode_url: string }> }`.
- Botão circular 80px, fundo `var(--nd-danger)`, label `t("police.panic_btn")`.
- Click 1: countdown 3s mostrando `t("police.panic_confirm", { s })`. Click 2 dentro do countdown cancela.
- Sem cancelar: dispara `onPanic` → toast `t("police.panic_dispatched", { p: protocol })` → redirect para `discrete_mode_url`.

#### II.9.7 · Modal mobile — `app/nanduti/modal/[appId]/page.tsx`

```tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { MiniAppHost } from "@/components/nanduti/Sidebar";
export default function ModalPage() {
  const { appId } = useParams<{ appId: string }>();
  const router = useRouter();
  return (
    <main className="nd-modal">
      <header className="nd-modal__bar">
        <button onClick={() => router.back()} aria-label="Cerrar">←</button>
      </header>
      <MiniAppHost appId={appId as any} />
    </main>
  );
}
```

### II.10 · Microcopy Completo (es, gn, jopara)

> 3 arquivos JSON. Toda string visível no UI passa pela função `t(key)`. Nada hardcoded. Quem implementa cola estes três blocos em `data/nanduti/i18n/`.

#### II.10.1 · `data/nanduti/i18n/es.json` (espanhol — autoritativo)

```json
{
  "app": { "name": "Ñandutí", "tagline": "La red ciudadana del Paraguay digital" },
  "hero": {
    "title": "Ñandutí",
    "subtitle": "Tu Paraguay, en una conversación.",
    "lead": "Pedile en castellano o en guaraní. La inteligencia artificial te ayuda con trámites, salud, educación, transferencias y más.",
    "cta": "Empezar",
    "badge": "DEMO · MITIC + IconsAI"
  },
  "lang": { "label": "Idioma", "es": "Español", "gn": "Guaraní", "jopara": "Jopará" },
  "onboarding": {
    "step1_title": "¿Cómo querés conversar?",
    "step1_sub": "Elegí el idioma para empezar",
    "step2_title": "Identificate para continuar",
    "step2_sub": "Tu información queda protegida según la Ley 6534/2020 y se borra al cerrar sesión",
    "step2_btn_eid": "Iniciar con Identidad Electrónica",
    "step2_btn_cic": "Cédula + SMS",
    "step2_cic_label": "Número de cédula",
    "step2_cic_invalid": "Cédula inválida — verificá los dígitos",
    "step2_otp_label": "Código SMS (6 dígitos)",
    "step2_otp_help": "Demo: usá 123456",
    "step3_title": "Hola, {name}",
    "step3_sub": "¿Qué necesitás hoy?",
    "step3_suggest_pay": "Pagar una cuenta",
    "step3_suggest_health": "Agendar un médico",
    "step3_suggest_edu": "Boletín escolar"
  },
  "chat": {
    "placeholder": "Escribí o presioná el micrófono…",
    "voice_btn": "Hablar",
    "voice_listening": "Te escucho…",
    "voice_processing": "Procesando…",
    "send": "Enviar",
    "tool_called": "Acción ejecutada",
    "error": "Algo no anduvo bien. ¿Probamos de nuevo?",
    "thinking": "Pensando…"
  },
  "miniapp": {
    "wallet": "Billetera", "gov": "Trámites", "health": "Salud", "edu": "Educación",
    "crypto": "Tarjeta USDC", "info": "Informativos", "alerts": "Alertas",
    "police": "Denuncia", "docs": "Documentos"
  },
  "wallet": {
    "balance_pyg": "Saldo en guaraníes", "balance_usdc": "Saldo en USDC",
    "transfer": "Transferir", "qr_pay": "Pagar QR", "history": "Historial",
    "card": "Tarjeta {brand} ····{last4}",
    "to_label": "Para", "amount_label": "Monto",
    "pin_label": "PIN (4 dígitos)", "pin_help": "Demo: 0000",
    "confirm": "¿Confirmás Gs. {amount} a {recipient}?",
    "confirm_btn": "Confirmar", "cancel_btn": "Cancelar",
    "success": "Listo, Gs. {amount} enviados",
    "fee": "Sin costo · SIP instantáneo"
  },
  "gov": {
    "title": "Trámites del Estado",
    "search_placeholder": "Buscá: cédula, RUC, antecedentes…",
    "tramites": {
      "TR-CEDULA-RENEW": "Renovación de cédula",
      "TR-ANTECEDENTES": "Certificado de antecedentes",
      "TR-DNIT-PAY": "Pago de impuestos (DNIT)",
      "TR-RUC-LOOKUP": "Consulta de RUC",
      "TR-EMPRESA": "Alta empresarial",
      "TR-NACIMIENTO": "Certidão de nacimiento"
    },
    "next_step": "Próximo paso", "eta_days": "ETA: {days} días",
    "cost": "Costo: Gs. {amount}", "book_btn": "Agendar"
  },
  "health": {
    "title": "Salud",
    "triage_title": "Triaje inteligente",
    "triage_disclaimer": "Esta orientación es informativa. NO sustituye atención médica profesional.",
    "ips_card": "IPS · {id}", "vaccine_card": "Vacunación al día",
    "mental_btn": "Línea 155 — Salud Mental",
    "level_autocare": "Cuidado en casa", "level_usf": "USF más cercana",
    "level_urgency": "Urgencia médica", "level_emergency": "EMERGENCIA — llamá al 911",
    "wait_minutes": "Espera: {min} min", "distance_km": "{km} km",
    "book_appointment": "Agendar"
  },
  "edu": {
    "title": "Educación", "report_card": "Boletín de {name}",
    "enroll": "Matrícula próxima", "tutor": "Tutor IA",
    "tutor_placeholder": "Preguntá sobre matemática, lengua, ciencias…",
    "menu": "Menú escolar de hoy", "calendar": "Calendario",
    "grades": "Notas", "attendance": "Asistencia", "behavior": "Comportamiento"
  },
  "crypto": {
    "title": "Tarjeta USDC",
    "disclaimer": "Stablecoin USDC es activo virtual experimental. Sujeto al marco regulatorio paraguayo en formación. Tarjeta emitida por banco socio Ueno bajo acuerdo BIN.",
    "balance": "Saldo USDC", "rate": "1 USDC = Gs. {rate}",
    "topup": "Cargar", "lock": "Bloquear", "unlock": "Desbloquear",
    "limit_label": "Límite mensual", "cashback": "Cashback {pct}% en USDC"
  },
  "info": {
    "title": "Informativos del Estado", "weekly_summary": "Resumen semanal",
    "save_offline": "Guardar para leer offline", "share_whatsapp": "Compartir en WhatsApp",
    "categories": { "salud": "Salud", "educacion": "Educación", "economia": "Economía", "seguridad": "Seguridad" }
  },
  "alerts": {
    "title": "Alertas naturales", "subscribe_btn": "Suscribir mi zona",
    "geo_label": "Tu zona", "category_label": "Categorías",
    "categories": { "flood": "Inundación", "drought": "Sequía", "storm": "Tormenta", "fire": "Incendio", "quake": "Sismo" },
    "recent_label": "Últimos 30 días",
    "severity_low": "Baja", "severity_med": "Media", "severity_high": "Alta"
  },
  "police": {
    "title": "Denuncia ciudadana",
    "panic_btn": "BOTÓN DE PÁNICO",
    "panic_confirm": "Tocar otra vez para cancelar ({s}s)",
    "panic_dispatched": "Solicitud enviada · protocolo {p}",
    "discrete_mode_hint": "Modo discreto activado. Tocar 7 veces el visor para salir.",
    "anonymous": "Denuncia anónima",
    "categories": { "violence": "Violencia doméstica", "robbery": "Robo", "fraud": "Fraude", "drugs": "Drogas", "other": "Otro" },
    "description": "Describí lo ocurrido", "track_btn": "Seguir denuncia",
    "deam_map": "Comisarías DEAM cercanas"
  },
  "docs": {
    "title": "Mis documentos",
    "share_btn": "Compartir", "share_fields": "Campos a compartir",
    "share_recipient": "Quién va a verificar", "share_ttl": "Expira en {min} min",
    "audit_btn": "¿Quién vio mis datos?", "audit_empty": "Nadie accedió aún a este documento",
    "renewal_warning": "Vence en {days} días",
    "doc_types": { "cedula": "Cédula de Identidad", "ruc": "RUC", "ips": "Certificado IPS", "school": "Boletín escolar", "vaccine": "Carné vacunación", "vehicle": "Registro vehicular" }
  }
}
```

#### II.10.2 · `data/nanduti/i18n/gn.json` (guaraní)

> Microcopy guaraní — revisão por falante nativo recomendada antes de produção. Para o mockup, são valores determinísticos.

```json
{
  "app": { "name": "Ñandutí", "tagline": "Tetãygua rendape Paraguái digital-pe" },
  "hero": {
    "title": "Ñandutí",
    "subtitle": "Ne Paraguái, peteĩ ñomongetápe.",
    "lead": "Eporandu kastelláno térã avañe'ẽme. Mba'apoha ñanduti nepytyvõ tembiapo, tesãi, mbo'ehao, viru ñembohasa ha hetave mba'épe.",
    "cta": "Eñepyrũ", "badge": "JEHECHAUKA · MITIC + IconsAI"
  },
  "lang": { "label": "Ñe'ẽ", "es": "Kastelláno", "gn": "Avañe'ẽ", "jopara": "Jopara" },
  "onboarding": {
    "step1_title": "Mba'éichapa reñe'ẽta?",
    "step1_sub": "Eiporavo ñe'ẽ eñepyrũ haguã",
    "step2_title": "Eikuaauka eku'e haguã",
    "step2_sub": "Nde marandu jaguereko mo'ã Léi 6534/2020 ndive ha okañy oje'okuévo",
    "step2_btn_eid": "Eñepyrũ Identidad Electrónica reheve",
    "step2_btn_cic": "Cédula + SMS",
    "step2_cic_label": "Cédula papapy",
    "step2_cic_invalid": "Cédula ndo'ái — emaña porã",
    "step2_otp_label": "SMS papapy (6)",
    "step2_otp_help": "Jehechauka: eipuru 123456",
    "step3_title": "Mba'éichapa, {name}",
    "step3_sub": "Mba'épa reikotevẽ ko árape?",
    "step3_suggest_pay": "Hepy ñepyrũ", "step3_suggest_health": "Pohãnoha agenda", "step3_suggest_edu": "Mbo'ehao boletín"
  },
  "chat": {
    "placeholder": "Ehai térã ejopy mikrofono…",
    "voice_btn": "Eñe'ẽ", "voice_listening": "Rohendu…", "voice_processing": "Aikũmby hína…",
    "send": "Mondo", "tool_called": "Ojejapo", "error": "Mba'eve ndoikói. Ñañepyrũjeýta?", "thinking": "Aikũmby hína…"
  },
  "miniapp": {
    "wallet": "Virurenda", "gov": "Tembiapo", "health": "Tesãi", "edu": "Mbo'ehao",
    "crypto": "USDC kuatia", "info": "Marandu", "alerts": "Sapy'aitéva",
    "police": "Marandu polísia", "docs": "Che kuatia"
  },
  "wallet": {
    "balance_pyg": "Viru rentekuéra", "balance_usdc": "USDC rentekuéra",
    "transfer": "Embohasa", "qr_pay": "Hepy QR", "history": "Tembiasakue",
    "card": "Kuatia {brand} ····{last4}",
    "to_label": "Avápe", "amount_label": "Mbovy",
    "pin_label": "PIN (4)", "pin_help": "Jehechauka: 0000",
    "confirm": "Eheréi Gs. {amount} {recipient}-pe?",
    "confirm_btn": "Eheréi", "cancel_btn": "Eheja",
    "success": "Oĩma, Gs. {amount} oñembou",
    "fee": "Kostokuéra'ỹre · SIP sapy'aitéva"
  },
  "gov": {
    "title": "Tetã rembiapokuéra",
    "search_placeholder": "Eheka: cédula, RUC, antecedentes…",
    "tramites": {
      "TR-CEDULA-RENEW": "Cédula renovación", "TR-ANTECEDENTES": "Pa'ũmegua kuatia",
      "TR-DNIT-PAY": "Hepy ñepyrũ DNIT", "TR-RUC-LOOKUP": "Eheka RUC",
      "TR-EMPRESA": "Empresa hekoñepyrũ", "TR-NACIMIENTO": "Heñói kuatia"
    },
    "next_step": "Upéi", "eta_days": "ETA: {days} ára",
    "cost": "Hepy: Gs. {amount}", "book_btn": "Agenda"
  },
  "health": {
    "title": "Tesãi",
    "triage_title": "Triaje pyahu",
    "triage_disclaimer": "Ko jehechauka marandurã ñoite. NDOJOJÁI pohãnohára ndive.",
    "ips_card": "IPS · {id}", "vaccine_card": "Vacunación oĩporãma",
    "mental_btn": "Línea 155 — Akãngu'i tesãi",
    "level_autocare": "Eñangareko nde rógape", "level_usf": "USF aguĩvévape",
    "level_urgency": "Pohãnohára pya'épe", "level_emergency": "EMERGENCIA — ehenói 911",
    "wait_minutes": "Eha'ãrõ: {min} min", "distance_km": "{km} km",
    "book_appointment": "Agenda"
  },
  "edu": {
    "title": "Mbo'ehao", "report_card": "{name} boletín",
    "enroll": "Matrícula upéi", "tutor": "Mbo'ehára IA",
    "tutor_placeholder": "Eporandu mba'apo, ñe'ẽ, ciencias…",
    "menu": "Ko árape menu", "calendar": "Calendario",
    "grades": "Nota", "attendance": "Asistencia", "behavior": "Tekorã"
  },
  "crypto": {
    "title": "USDC kuatia",
    "disclaimer": "Stablecoin USDC ha'e mba'erepy virtual jehechauka. Marco regulatorio paraguáipe oĩ. Kuatia osẽ Ueno banco BIN ndive.",
    "balance": "USDC saldo", "rate": "1 USDC = Gs. {rate}",
    "topup": "Eipohẽ", "lock": "Embotyre", "unlock": "Eipe'a",
    "limit_label": "Mes límite", "cashback": "Cashback {pct}% USDC-pe"
  },
  "info": {
    "title": "Tetã marandu", "weekly_summary": "Semana resumen",
    "save_offline": "Embyaty offline", "share_whatsapp": "Embyaty WhatsApp",
    "categories": { "salud": "Tesãi", "educacion": "Mbo'ehao", "economia": "Economía", "seguridad": "Seguridad" }
  },
  "alerts": {
    "title": "Sapy'aitéva natural", "subscribe_btn": "Eheka ne tetã",
    "geo_label": "Ne tenda", "category_label": "Categoría",
    "categories": { "flood": "Y oñembogua", "drought": "Y'uhei", "storm": "Ára pochy", "fire": "Tata", "quake": "Yvy oryryi" },
    "recent_label": "30 ára pyahu",
    "severity_low": "Mbegue", "severity_med": "Mbyte", "severity_high": "Mbarete"
  },
  "police": {
    "title": "Tetãygua marandu polísia",
    "panic_btn": "PÁNICO BOTÓN",
    "panic_confirm": "Ejopyjey eheja haguã ({s}s)",
    "panic_dispatched": "Marandu omondo · protocolo {p}",
    "discrete_mode_hint": "Modo discreto oĩma. Ejopy 7 jey visor-pe esẽ haguã.",
    "anonymous": "Marandu anónimo",
    "categories": { "violence": "Mbarete oga-pe", "robbery": "Mondareko", "fraud": "Engaña", "drugs": "Pohã ñaña", "other": "Ambue" },
    "description": "Emombe'u oikóva", "track_btn": "Eheka denuncia",
    "deam_map": "DEAM aguĩvévakuéra"
  },
  "docs": {
    "title": "Che kuatiakuéra",
    "share_btn": "Embyaty", "share_fields": "Mba'épa embyaty",
    "share_recipient": "Avápa ohecháta", "share_ttl": "Opa {min} min-pe",
    "audit_btn": "Avápa ohecha che marandu?", "audit_empty": "Avave ndoikéi gueteri",
    "renewal_warning": "Opa {days} ára-pe",
    "doc_types": { "cedula": "Cédula", "ruc": "RUC", "ips": "IPS kuatia", "school": "Mbo'ehao boletín", "vaccine": "Carné vacunación", "vehicle": "Mba'yruguata kuatia" }
  }
}
```

#### II.10.3 · `data/nanduti/i18n/jopara.json` (jopará — locale default)

```json
{
  "app": { "name": "Ñandutí", "tagline": "La red oñondivépa del Paraguay digital" },
  "hero": {
    "title": "Ñandutí",
    "subtitle": "Ne Paraguái, peteĩ conversación-pe.",
    "lead": "Eporandu castellano-pe o guaraní-pe. La IA nde ayuda con trámites, salud, educación, transferencias ha hetave mba'e.",
    "cta": "Empezar", "badge": "DEMO · MITIC + IconsAI"
  },
  "lang": { "label": "Idioma", "es": "Castellano", "gn": "Guaraní", "jopara": "Jopará" },
  "onboarding": {
    "step1_title": "Mba'éichapa querés conversar?",
    "step1_sub": "Eiporavo el idioma para empezar",
    "step2_title": "Identificate ke continuar",
    "step2_sub": "Tu información protegida según Ley 6534/2020 ha okañy al cerrar sesión",
    "step2_btn_eid": "Empezar con Identidad Electrónica",
    "step2_btn_cic": "Cédula + SMS",
    "step2_cic_label": "Cédula número",
    "step2_cic_invalid": "Cédula inválida — verificá los dígitos",
    "step2_otp_label": "Código SMS (6 dígitos)",
    "step2_otp_help": "Demo: usá 123456",
    "step3_title": "Mba'éichapa, {name}",
    "step3_sub": "¿Mba'épa necesitás ko árape?",
    "step3_suggest_pay": "Pagar una cuenta", "step3_suggest_health": "Agendar un médico", "step3_suggest_edu": "Boletín escolar"
  },
  "chat": {
    "placeholder": "Escribí o jopy el micrófono…",
    "voice_btn": "Hablar", "voice_listening": "Te escucho…", "voice_processing": "Procesando…",
    "send": "Enviar", "tool_called": "Acción ejecutada",
    "error": "Algo no anduvo bien. Ñañepyrũjey?", "thinking": "Pensando…"
  },
  "miniapp": {
    "wallet": "Billetera", "gov": "Trámites", "health": "Salud", "edu": "Educación",
    "crypto": "Tarjeta USDC", "info": "Informativos", "alerts": "Alertas",
    "police": "Denuncia", "docs": "Documentos"
  },
  "wallet": {
    "balance_pyg": "Saldo en guaraníes", "balance_usdc": "Saldo en USDC",
    "transfer": "Transferir", "qr_pay": "Pagar QR", "history": "Historial",
    "card": "Tarjeta {brand} ····{last4}",
    "to_label": "Para", "amount_label": "Monto",
    "pin_label": "PIN (4 dígitos)", "pin_help": "Demo: 0000",
    "confirm": "Confirmás Gs. {amount} a {recipient}?",
    "confirm_btn": "Confirmar", "cancel_btn": "Cancelar",
    "success": "Oĩma, Gs. {amount} enviados", "fee": "Sin costo · SIP instantáneo"
  },
  "gov": {
    "title": "Trámites del Estado",
    "search_placeholder": "Buscá: cédula, RUC, antecedentes…",
    "tramites": {
      "TR-CEDULA-RENEW": "Cédula renovación", "TR-ANTECEDENTES": "Antecedentes kuatia",
      "TR-DNIT-PAY": "Pago de impuestos DNIT", "TR-RUC-LOOKUP": "Consulta RUC",
      "TR-EMPRESA": "Alta empresa", "TR-NACIMIENTO": "Certificado nacimiento"
    },
    "next_step": "Próximo paso", "eta_days": "ETA: {days} días",
    "cost": "Costo: Gs. {amount}", "book_btn": "Agendar"
  },
  "health": {
    "title": "Salud", "triage_title": "Triaje inteligente",
    "triage_disclaimer": "Esta orientación es informativa. NO sustituye atención médica profesional.",
    "ips_card": "IPS · {id}", "vaccine_card": "Vacunación al día",
    "mental_btn": "Línea 155 — Salud Mental",
    "level_autocare": "Cuidado en casa", "level_usf": "USF más cercana",
    "level_urgency": "Urgencia médica", "level_emergency": "EMERGENCIA — llamá al 911",
    "wait_minutes": "Espera: {min} min", "distance_km": "{km} km",
    "book_appointment": "Agendar"
  },
  "edu": {
    "title": "Educación", "report_card": "Boletín de {name}",
    "enroll": "Matrícula próxima", "tutor": "Tutor IA",
    "tutor_placeholder": "Preguntá sobre matemática, lengua, ciencias…",
    "menu": "Menú escolar de hoy", "calendar": "Calendario",
    "grades": "Notas", "attendance": "Asistencia", "behavior": "Comportamiento"
  },
  "crypto": {
    "title": "Tarjeta USDC",
    "disclaimer": "Stablecoin USDC es activo virtual experimental. Sujeto al marco regulatorio paraguayo en formación. Tarjeta emitida por banco socio Ueno bajo acuerdo BIN.",
    "balance": "Saldo USDC", "rate": "1 USDC = Gs. {rate}",
    "topup": "Cargar", "lock": "Bloquear", "unlock": "Desbloquear",
    "limit_label": "Límite mensual", "cashback": "Cashback {pct}% en USDC"
  },
  "info": {
    "title": "Informativos del Estado", "weekly_summary": "Resumen semanal",
    "save_offline": "Guardar para leer offline", "share_whatsapp": "Compartir en WhatsApp",
    "categories": { "salud": "Salud", "educacion": "Educación", "economia": "Economía", "seguridad": "Seguridad" }
  },
  "alerts": {
    "title": "Alertas naturales", "subscribe_btn": "Suscribir mi zona",
    "geo_label": "Tu zona", "category_label": "Categorías",
    "categories": { "flood": "Inundación", "drought": "Sequía", "storm": "Tormenta", "fire": "Incendio", "quake": "Sismo" },
    "recent_label": "Últimos 30 días",
    "severity_low": "Baja", "severity_med": "Media", "severity_high": "Alta"
  },
  "police": {
    "title": "Denuncia ciudadana",
    "panic_btn": "BOTÓN DE PÁNICO",
    "panic_confirm": "Tocar otra vez para cancelar ({s}s)",
    "panic_dispatched": "Solicitud enviada · protocolo {p}",
    "discrete_mode_hint": "Modo discreto activado. Tocar 7 veces el visor para salir.",
    "anonymous": "Denuncia anónima",
    "categories": { "violence": "Violencia doméstica", "robbery": "Robo", "fraud": "Fraude", "drugs": "Drogas", "other": "Otro" },
    "description": "Describí lo ocurrido", "track_btn": "Seguir denuncia",
    "deam_map": "Comisarías DEAM cercanas"
  },
  "docs": {
    "title": "Mis documentos",
    "share_btn": "Compartir", "share_fields": "Campos a compartir",
    "share_recipient": "Quién va a verificar", "share_ttl": "Expira en {min} min",
    "audit_btn": "¿Quién vio mis datos?", "audit_empty": "Nadie accedió aún a este documento",
    "renewal_warning": "Vence en {days} días",
    "doc_types": { "cedula": "Cédula de Identidad", "ruc": "RUC", "ips": "Certificado IPS", "school": "Boletín escolar", "vaccine": "Carné vacunación", "vehicle": "Registro vehicular" }
  }
}
```

### II.11 · Fluxos Críticos (passo-a-passo determinístico)

#### II.11.1 · Login com Identidad Electrónica (mock)

```
1. Usuário em /icon/nanduti, sem sessão.
2. <NandutiShell /> detecta sessão ausente, renderiza <Onboarding />.
3. Tela 0: usuário escolhe locale "jopara". setLocale("jopara"). step=1.
4. Tela 1: click "Iniciar con Identidad Electrónica".
5. Frontend abre overlay full-screen mock chamado "MITIC OAuth Mock"
   (page interna em /icon/nanduti/mock-oauth com botão "Confirmar
   identidad como María González" + delay 800ms simulando redirect).
6. Confirma. Frontend chama POST /api/nanduti/auth/identidad
   { code: "MOCK_CODE_" + Date.now() }.
7. Backend retorna { token, citizen: MOCK_CITIZEN, expires_in: 3600 }.
8. Frontend salva localStorage.setItem("nanduti.session", JSON.stringify({ token, citizen })).
9. step=2 (boas-vindas) com saudação t("onboarding.step3_title", { name: citizen.name.split(" ")[0] }).
10. Click em qualquer das 3 sugestões → onComplete(citizen). NandutiShell.phase = "ready".
```

#### II.11.2 · Login alternativo CIC + OTP

```
1. Tela 1: click "Cédula + SMS".
2. Render <CedulaInput /> + botão "Enviar SMS".
3. Usuário digita "4521847". onChange dispara validateCedula().
   Resultado true → label verde "Cédula válida" + botão habilita.
4. Click "Enviar SMS" → POST /api/nanduti/auth/cic-otp { cic: "4521847" }.
5. Backend valida módulo 11. Se inválido → 400 "invalid_cic".
   Se válido → 200 { stage: "otp_sent", help: "Demo: usá 123456" }.
6. UI mostra campo OTP + dica "Demo: usá 123456".
7. Usuário digita "123456" + click Confirmar.
8. POST /api/nanduti/auth/cic-otp { cic: "4521847", otp: "123456" }.
9. Backend valida. Retorna { stage: "logged_in", token: "mock-jwt.4521847" }.
10. Frontend chama GET /api/nanduti/auth/identidad/whoami (mock retorna MOCK_CITIZEN
    porque cic match) → salva session → step=2.
```

#### II.11.3 · Transferência por voz

```
1. ChatCenter ativo. Usuário pressiona <VoiceButton /> e segura.
2. MediaRecorder grava em audio/webm. Anel pulsante + waveform animado.
3. Usuário diz "Transferí doscientos mil guaraníes para mi hijo Juan".
4. Solta o botão. recorder.stop(). Blob enviado:
   POST /api/nanduti/stt (multipart audio).
5. Backend devolve { text: "Transferí 200000 guaraníes para mi hijo Juan" }.
6. ChatCenter chama POST /api/nanduti/chat com message=text.
7. Claude (Sonnet 4.6) interpreta intent + decide tool wallet.transfer.
   Args: { to: "Juan", amount: 200000, currency: "PYG", pin: pendiente }.
8. Backend retorna reply + tool_calls com placeholder de pin.
9. ChatCenter dispara onToolResult("wallet", { mode: "confirm",
   to: "Juan González Pérez", amount: 200000, pending_pin: true }).
10. Sidebar abre WalletApp em modo confirm.
11. WalletApp renderiza pin pad + texto t("wallet.confirm",
    { amount: "200.000", recipient: "Juan González Pérez" }).
12. TTS dispara: POST /api/nanduti/tts
    { text: "¿Confirmás Gs. 200.000 a Juan?", lang: "es" }.
13. Audio mp3 streama; usuário ouve a confirmação.
14. Usuário digita PIN "0000". Click Confirmar.
15. POST /api/nanduti/wallet/transfer
    { to: "Juan", amount: 200000, currency: "PYG", pin: "0000" }.
16. Backend mockDelay("payment", 200000) ~1.4s. Retorna 200
    { tx_id, status: "confirmed", recipient_resolved, new_balance_pyg }.
17. WalletApp anima atualização de saldo + checkmark verde +
    toast t("wallet.success", { amount: "200.000" }).
18. TTS toca "Listo, Gs. doscientos mil enviados".
19. ChatCenter renderiza mensagem assistente: "Listo. Transferiste
    Gs. 200.000 a Juan. Tu saldo ahora: Gs. 4.150.000."
```

#### II.11.4 · Triagem saúde

```
1. Usuário escreve "Mi hijo Mateo de 3 años tiene fiebre 39°C hace 6 horas".
2. Claude → tool health.triage com args { age: 3,
   symptoms: ["fiebre 39"], severity_self_report: "high",
   duration_hours: 6 }.
3. POST /api/nanduti/health/triage.
4. Backend match primeira regra MOCK_TRIAGE_RULES (age_max:5,
   symptoms_any:["fiebre 39"]) → level "urgency".
5. Retorna { level, reasoning, next_steps, facilities (3 USF mais
   próximas), disclaimer }.
6. ChatCenter dispara onToolResult("health", payload).
7. HealthApp abre em tab "Triaje" com:
   - badge vermelho "Urgencia médica"
   - reasoning em destaque
   - 3 cards de USF com distância, espera, telefone, botão "Agendar"
   - disclaimer permanente embaixo
8. Click "Agendar" no primeiro USF → POST
   /api/nanduti/health/appointment { facility_id: "USF-TRI-001",
   datetime: ISO_AGORA_PLUS_2H }.
9. Confirmação verde + protocolo HC-XXXX.
```

#### II.11.5 · Botão pânico violência

```
1. Sidebar Polícia → click PoliceApp.
2. PoliceApp renderiza <PanicButton /> grande no topo.
3. Click 1: countdown 3s mostrando t("police.panic_confirm", { s: 3..2..1 }).
4. Sem cancelar: dispara onPanic.
5. PanicButton chama navigator.geolocation.getCurrentPosition()
   (mock fallback: lat=-25.262, lng=-57.616, accuracy=10).
6. Inicia gravação áudio mock 30s (MediaRecorder).
7. POST /api/nanduti/police/panic { location, audio_blob_id: "mock",
   silent: false }.
8. Backend retorna { protocol, dispatched_to: ["911","137","deam"],
   eta_minutes: 8, nearest_deam: MOCK_DEAM[0],
   discrete_mode_url: "/icon/nanduti/discrete?p=PROTOCOLO" }.
9. Toast verde "Solicitud enviada · protocolo PNC-PANIC-XXX".
10. Push notification mock (in-app toast) "Llamada despachada a 911,
    137 y DEAM Asunción Centro. ETA: 8 min".
11. Redirect automático após 4s para discrete_mode_url.
12. <DiscreteCalc /> renderiza calculadora funcional. Aparência
    100% normal. Sem indicação de modo discreto.
13. Cidadã faz operações 1+1, 7×8, etc, normalmente.
14. Para sair: tocar 7 vezes no display da calculadora.
15. Após 7º toque: redirect de volta a /icon/nanduti com toast
    "Modo discreto desactivado · denuncia activa".
```

#### II.11.6 · Alerta natural

```
1. Onboarding registrou cidade "Asunción".
2. AlertsApp em background subscreve via POST /api/nanduti/alerts/subscribe
   { geo: { lat: -25.262, lng: -57.616 }, categories: ["storm","flood"] }.
3. Backend retorna sub_id. Frontend salva em estado.
4. ChatCenter (independente) periodicamente chama GET
   /api/nanduti/alerts/recent { region: "Asunción" }
   (poll a cada 5min na demo; em produção, push real).
5. Recebe MOCK_ALERTS_RECENT[2] (storm Asunción / Central).
6. Toast in-app + animação no card AlertsApp da Sidebar (badge "1" amarelo).
7. Click toast → AlertsApp abre com mapa D3 + lista.
```

#### II.11.7 · Compartilhar documento com auditoria

```
1. DocsApp aberto. Usuário click "Compartir" no doc-cedula-4521847.
2. Modal: campos selecionáveis (checkbox para cada field). Default:
   só "name" + "birthdate" (minimização).
3. Recipient: input "Hospital de Clínicas".
4. TTL: slider 5-60 min, default 15.
5. Click Compartir → POST /api/nanduti/docs/share { doc_id,
   fields: ["name","birthdate"], recipient_id, ttl_minutes: 15 }.
6. Backend logAccess() registra entry. Retorna { share_url, vc_jwt,
   expires_at }.
7. UI mostra QR (gerado client-side a partir de share_url) + copy link.
8. Após 15min, link expira (frontend não verifica — backend devolveria
   401 se acessado).
9. Usuário click "¿Quién vio mis datos?" → AuditTrail mostra entries
   de MOCK_AUDIT_LOG + entry recém-criada.
```

---

## PARTE III — EXECUÇÃO

### III.1 · Roadmap Determinístico (sem fases, lista linear)

> Execute do item 1 ao 18 em ordem. Cada item gera 1 commit lógico. Sem aprovação intermediária. A Fase 0 (skeleton + i18n + LangSwitcher) já está commitada no branch `claude/paraguay-research`.

```
01. Expandir data/nanduti/i18n/{es,gn,jopara}.json conforme §II.10
    (3 arquivos sobrescritos integralmente).
02. Criar 10 mock data files conforme §II.6 (mock-citizen.ts,
    mock-wallet.ts, mock-tramites.ts, mock-health.ts, mock-edu.ts,
    mock-crypto.ts, mock-info-feed.ts, mock-alerts.ts,
    mock-police.ts, mock-docs.ts).
03. Criar 5 lib files conforme §II.7 (cedula-validator.ts,
    mock-delay.ts, audit-logger.ts, redis-cache.ts, tool-registry.ts).
04. Criar lib/nanduti/orchestrator.ts (wrapper sobre Anthropic SDK
    + dispatch de tools — 60-100 LOC).
05. Criar 28 routes em app/api/nanduti/**/route.ts conforme §II.8
    (cada uma com fallback determinístico se ANTHROPIC_API_KEY ausente).
06. Adicionar tokens CSS .nd-* em app/globals.css conforme §II.3.1.
07. Criar 7 primitivos em components/nanduti/primitive/ conforme §II.9.6.
08. Criar 9 mini-apps em components/nanduti/miniapp/ conforme §II.9.5.
    Cada um implementa as tabs descritas e chama as tools correspondentes.
09. Criar components/nanduti/ChatCenter.tsx conforme §II.9.3.
10. Criar components/nanduti/Sidebar.tsx conforme §II.9.4.
11. Criar components/nanduti/Onboarding.tsx conforme §II.9.2.
12. Criar components/nanduti/NandutiShell.tsx conforme §II.9.1.
13. Substituir app/nanduti/page.tsx para renderizar <NandutiShell />.
14. Criar app/nanduti/modal/[appId]/page.tsx conforme §II.9.7.
15. Criar app/nanduti/mock-oauth/page.tsx (overlay mock MITIC OAuth)
    + app/nanduti/discrete/page.tsx (host de DiscreteCalc).
16. Adicionar service worker básico em public/nanduti-sw.js + register
    em layout.tsx (cache shell + última sessão).
17. Mobile QA: testar 360px sem quebra; tab/focus accessibility WCAG AA.
18. Build (npx next build) deve passar; deploy via rsync + systemctl
    restart icon + bash scripts/post-deploy-verify.sh; smoke test:
    curl em /icon/nanduti (200) + curl POST nas 28 APIs (200 + JSON
    válido). Documentar resultado em commit final.
```

### III.2 · Critérios de Aceite (binários)

| # | Critério | Como verificar |
|---|---|---|
| 1 | `/icon/nanduti` carrega ≤2s no 4G | Lighthouse mobile FCP ≤2s |
| 2 | Lighthouse mobile Performance ≥85 | `npx lighthouse https://icon.iconsai.ai/icon/nanduti --form-factor=mobile` |
| 3 | Lighthouse Accessibility ≥95 | idem |
| 4 | Lighthouse SEO ≥95 | idem |
| 5 | Login mock + 9 mini-apps clicáveis | Manual smoke test ponta-a-ponta |
| 6 | Chat IA real com 28 tools registradas, streaming SSE | Inspecionar Network tab + logs orchestrator |
| 7 | Voz funciona end-to-end em es-PY | Push-to-talk → STT → tool → TTS audível |
| 8 | Validação CIC módulo 11 real | Testar CIC inválida → label vermelho; válida → verde |
| 9 | Toggle es/gn/jopará muda toda UI | Trocar idioma e verificar microcopy |
| 10 | Modo discreto polícia funciona | Disparar pânico → calculadora → tocar 7× → sair |
| 11 | Audit trail visível e populado | DocsApp → "¿Quién vio mis datos?" mostra entries |
| 12 | Cartão cripto USDC com aviso legal permanente | Visível em todos os estados de CryptoCardApp |
| 13 | Disclaimer médico permanente em saúde | Visível em triage, appointment, vaccine, mental |
| 14 | Mobile-first 360px sem quebra | DevTools responsive 360px |
| 15 | Floating button intacto | Comparar com `/icon/future` (idêntico) |
| 16 | Build local sem warnings novos | `npx next build` saída comparada com baseline |
| 17 | post-deploy-verify.sh passa | Saída do script após restart |
| 18 | 28 endpoints API respondem 200 + JSON válido | Smoke test bash for-loop |
| 19 | Branch `claude/paraguay-research` pushada | `git log origin/claude/paraguay-research` |
| 20 | Service worker entrega shell offline | DevTools Application > Service Workers |

### III.3 · Restrições Legais e Sensibilidades

| # | Restrição | Implicação |
|---|---|---|
| 1 | Lei 6534/2020 PDP cobre só dados creditícios | Adotar voluntariamente padrões GDPR/LGPD; documentar finalidade de cada coleta; consentimento granular |
| 2 | Anteprojeto Lei Uso Ético IA (MITIC 2026) em curso | Manter transparência sobre uso de LLM, supervisão humana, explainability nas decisões |
| 3 | BCP / SEPRELAD AML/CFT | Qualquer fluxo financeiro real (pós-mock) requer KYC tier-2 + monitoramento; no mockup, marcar como "pendente compliance produção" |
| 4 | Idioma guaraní oficial (Constituição art. 77) | Nunca tratar guaraní como secundário; as 3 locales são equipotentes |
| 5 | Lei 4017/2010 firma electrónica | No mockup, simular VC W3C; em produção, integrar provedor qualificado (Documenta, eFirma) |
| 6 | Marco cripto em formação | Disclaimer "activo virtual experimental" permanente; arquitetura permite remover sob ordem regulatória sem quebrar app |
| 7 | Lei 7143/2023 — DNIT consolidou SET+aduana | Use API pública RUC desde 09/05/2024 |
| 8 | Direitos humanos / proteção vítimas | Modo discreto NÃO armazena dados que possam ser usados contra a vítima; áudio gravado fica em escopo backend isolado |
| 9 | Acessibilidade indígena (>3% pop) | Modo alto-contraste + voz prioritária + ícones pictográficos universais |
| 10 | Floating button regra de ouro IconsAI | Nunca modificar; copiar literal de `/icon/future` |

### III.4 · Comando de Execução (único, copiar-colar)

```
PROJETO:   Ñandutí — super-app IA-first para o cidadão paraguaio.
REPO:      /home/user/iconsaiIcon
BRANCH:    claude/paraguay-research (já existe; Fase 0 commitada)
URL ALVO:  https://icon.iconsai.ai/icon/nanduti

EXECUTE este prompt do início ao fim:
- §I (Conhecimento) define o terreno e o blueprint — releia se houver dúvida.
- §II (Especificação) é determinística — todas as decisões fechadas.
- §III.1 (Roadmap) tem 18 itens. Execute em ordem. Cada item = 1 commit.
- §III.2 (Aceite) são 20 critérios binários — todos devem passar.
- §III.3 (Legais) são as restrições não-negociáveis.

NÃO peça aprovação intermediária.
NÃO modifique o floating button (regra de ouro IconsAI).
NÃO use Vercel.
Idioma do código: inglês. Idioma da UI: es + gn + jopará.
100% mock. Zero PII real. Disclaimers visíveis em saúde e cripto.
Modo discreto isola dados.

Após item 18, reporte UM ÚNICO resumo final:
- status de cada um dos 20 critérios da §III.2
- URL pública verificada
- lista de commits pushados
- qualquer issue encontrada

Sem fasear. Sem aprovar. Executa o contrato.
```

---

## ANEXO A · Tabela-Resumo de Decisões (matriz)

| Variável | Valor fechado |
|---|---|
| Nome | Ñandutí |
| Tagline | "Tu Paraguay, en una conversación." |
| Locale default | jopara |
| LLM principal | claude-sonnet-4-6 |
| LLM rotina | claude-haiku-4-5-20251001 |
| STT | OpenAI Whisper (`whisper-1`) |
| TTS | ElevenLabs voz "Ana" es-PY (gn fallback texto-only) |
| CIC validator | módulo 11 real (§II.7.1) |
| Stablecoin | USDC (Circle) |
| BIN sponsor mock | Ueno Bank |
| Adquirente mock | Bancard |
| Cidadã padrão | María González Acosta (CIC 4521847) |
| Family persona | Juan + Sofía (8) + Mateo (3) |
| PIN demo | 0000 |
| OTP demo | 123456 |
| Mock OAuth code | "MOCK_CODE_" + Date.now() |
| Cache TTL | 300s |
| Rate limit | 30 req/min/IP |
| Discrete exit taps | 7 |
| Discrete TTL | 5 min |
| Service worker | shell + última sessão |
| Bundle target | ≤3MB initial |
| Lighthouse mobile | Perf ≥85, A11y ≥95, SEO ≥95 |

---

## ANEXO B · Variáveis de Ambiente

```
ANTHROPIC_API_KEY=sk-ant-...        # se ausente, fallback determinístico
OPENAI_API_KEY=sk-...                # se ausente, STT retorna mock
ELEVENLABS_API_KEY=...                # se ausente, TTS retorna texto-only
REDIS_URL=redis://...                # cache (já configurado no iconsaiIcon)
```

Nenhuma variável é obrigatória para o mockup rodar. Tudo tem fallback.

---

## ANEXO C · Bibliografia interna

Os arquivos `docs/paraguai/research-wechat.md`, `docs/paraguai/research-paraguai-A.md` e `docs/paraguai/research-paraguai-B.md` no repo contêm os dossiers completos de pesquisa com todas as fontes (Tencent IR, Citizen Lab, Stanford DigiChina, CSIS, World Bank, GovTech Singapore, e-Estonia, India Stack, INE, BCP, MITIC, MSPyBS, IPS, MEC, Conatel, SEN, Identificaciones, DNIT, MTESS, RankingsLatam, ABC Color, Última Hora, La Nación PY, MarketData, Vouga Abogados, TEDIC, Ferrere, UN E-Government Survey 2024, OCDE PISA 2022, GMA Labs, Datareportal Digital 2025).

A §I deste prompt já contém o **resumo destilado e suficiente** desses dossiers. Quem executa não precisa abrir os arquivos de pesquisa — só fazê-lo se houver dúvida factual específica.

---

**Fim do prompt mestre nuclear.** Comece pelo §III.1 item 1.





