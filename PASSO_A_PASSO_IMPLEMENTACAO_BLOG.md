# Passo a Passo Manual (Clique a Clique) — Subindo o Blog no Microsoft Azure

Este guia foi feito para você criar **tudo na mão pelo Portal do Azure e GitHub**, seguindo o padrão de nomenclatura do **Cloud Adoption Framework (CAF)** da Microsoft, com **custo R$ 0,00** e **esteira automática via GitHub Actions (OIDC sem senha)**.

---

## 1. Qual região usar para pagar mais barato?

| Região Azure | Preço | Disponibilidade de Tiers Grátis | Latência (Brasil) | Recomendação |
| :--- | :--- | :--- | :--- | :--- |
| **`East US 2`** *(Leste dos EUA 2)* | **Mais barata** (~20% a 35% mais barata que o Brasil) | Excelente (F1, ACA Free, Azure SQL Free, Key Vault, Foundry) | ~110–130 ms (imperceptível num blog) | **MELHOR ESCOLHA** |
| **`East US`** *(Leste dos EUA)* | Mais barata (igual East US 2) | Muito boa (às vezes F1 fica sem cota em horários de pico) | ~110–130 ms | Boa alternativa |
| **`Brazil South`** *(Sul do Brasil)* | **Mais cara** (+25% a +40% em recursos pagos) | Boa, mas alguns recursos de IA/Foundry chegam depois | ~15–30 ms | Só se exigir dados no Brasil |

> **Regra de FinOps:** No plano **Free F1** o Web App custa **R$ 0,00** em qualquer região, mas escolher **`East US 2`** desde o começo garante que qualquer recurso que você adicionar depois (Storage, Key Vault, ACA, SQL ou AI Foundry) saia no **menor preço do Azure** e com menos risco de falta de cota no tier gratuito.

---

## 2. Tabela de Nomes dos Recursos (Padrão CAF)

Use estes nomes prontos ao longo de todo o passo a passo (se algum nome global já estiver em uso, adicione `01` no final):

| Recurso no Azure | Nome Sugerido | Região | Tier / Custo |
| :--- | :--- | :--- | :--- |
| **Resource Group** | `rg-blog-humberto-prod-eus2` | `East US 2` | Grátis |
| **App Service Plan** | `asp-blog-humberto-prod-eus2` | `East US 2` | **Free F1** (R$ 0,00) |
| **Web App (Linux)** | `humbertojezus` *(URL: `humbertojezus.azurewebsites.net`)* | `East US 2` | Incluso no F1 |
| **App Registration (Entra ID)** | `id-github-blog-humberto-prod` | Global (Entra ID) | Grátis |
| **Budget Alert (FinOps)** | `budget-blog-humberto-alerta` | Assinatura / RG | Grátis |

*(Opcional — nomes padrão caso um dia migre para **ACA Zero-Trust** usando `AZURE_ZERO_TRUST_DEPLOY.md`: `cae-blog-humberto-prod-eus2`, `ca-blog-humberto-prod-eus2`, `uami-blog-humberto-prod-eus2`, `kv-bloghumberto-eus2`, `stbloghumbertoeus2`, `law-blog-humberto-prod-eus2`.)*

---

## 3. Parte 1 — Baixar o projeto e testar no seu computador

1. Extraia o código baixado em uma pasta (ex.: `C:\projetos\blog-humberto-azure`).
2. Abra o **PowerShell** (ou Terminal do VS Code) nessa pasta e execute:
   ```powershell
   npm install
   npm run dev
   ```
3. Abra `http://localhost:3000` e confirme que o blog abriu normalmente.
4. Pressione `Ctrl + C` no terminal para encerrar o teste local.

---

## 4. Parte 2 — Criar o Repositório no GitHub e Subir o Código

1. Acesse **https://github.com** e clique em **New** (botão verde de novo repositório).
2. Preencha:
   - **Repository name:** `blog-humberto-azure`
   - **Visibility:** `Private` (ou `Public`, se quiser deixar como portfólio)
   - **Não** marque *Add a README* nem *.gitignore* (o projeto já tem).
3. Clique em **Create repository**.
4. No terminal, dentro da pasta do projeto no seu PC, rode:
   ```powershell
   git init
   git add .
   git commit -m "Versao inicial do blog Azure"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/blog-humberto-azure.git
   git push -u origin main
   ```
   *(Troque `SEU_USUARIO` pelo seu usuário exato do GitHub.)*

---

## 5. Parte 3 — Criar os Recursos na Mão no Portal do Azure

Acesse **https://portal.azure.com**.

### Passo 5.1 — Criar o Resource Group
1. Na barra de busca superior, digite **`Resource groups`** e abra.
2. Clique em **+ Create**.
3. Preencha:
   - **Subscription:** sua assinatura Azure
   - **Resource group:** `rg-blog-humberto-prod-eus2`
   - **Region:** `(US) East US 2`
4. Clique em **Next: Tags** e adicione (boa prática de governança/FinOps):
   - `Projeto` = `BlogHumberto`
   - `Ambiente` = `Prod`
   - `Dono` = `HumbertoJezus`
5. Clique em **Review + create → Create**.

---

### Passo 5.2 — Criar o Web App (Linux · Node 22 LTS · Free F1)
1. Na barra de busca superior, digite **`App Services`** e abra.
2. Clique em **+ Create → Web App**.
3. Na aba **Basics**, preencha exatamente assim:
   - **Resource Group:** `rg-blog-humberto-prod-eus2`
   - **Name:** `humbertojezus` *(se já existir, use `humbertojezus-blog` — essa será a sua URL `.azurewebsites.net`)*
   - **Publish:** `Code`
   - **Runtime stack:** `Node 22 LTS`
   - **Operating System:** `Linux`
   - **Region:** `East US 2`
   - **Linux Plan (App Service Plan):** clique em **Create new** e digite `asp-blog-humberto-prod-eus2`
   - **Pricing plan:** clique e selecione **`Free F1 (Shared infrastructure)`** *(confirme que aparece R$ 0 / Free)*
4. Aba **Database:** deixe desmarcado (*None*).
5. Aba **Deployment:** deixe **Continuous deployment = Disable** *(vamos usar o nosso workflow pronto com OIDC sem senha na Parte 4!)*.
6. Aba **Networking:** deixe **Enable public access = On**.
7. Aba **Monitor + secure:** marque **Enable Application Insights = No** *(para não gerar nenhum custo extra de ingestão)*.
8. Aba **Tags:** coloque as mesmas tags (`Projeto=BlogHumberto`, `Ambiente=Prod`).
9. Clique em **Review + create → Create** e aguarde ~1 minuto até aparecer **Your deployment is complete → Go to resource**.

---

### Passo 5.3 — Gerar a chave `BLOG_SESSION_SECRET` no seu PC
No **PowerShell** do seu computador, rode o comando abaixo e **copie** o texto gerado (você nunca precisará decorar):
```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

---

### Passo 5.4 — Configurar Variáveis de Ambiente no Web App
Dentro do seu Web App (`humbertojezus`), no menu esquerdo:
1. Vá em **Settings → Environment variables**.
2. Na aba **App settings**, clique em **+ Add** e crie **uma por uma** exatamente com estes nomes:

| Name *(exatamente assim)* | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `BLOG_DATA_DIR` | `/home/site/blog-data` |
| `BLOG_ADMIN_EMAIL` | `humbertojezus@gmail.com` |
| `BLOG_ADMIN_PASSWORD` | *(digite uma senha forte de 10+ caracteres para entrar no `/admin`)* |
| `BLOG_SESSION_SECRET` | *(cole a chave aleatória gerada no Passo 5.3)* |
| `APP_URL` | `https://humbertojezus.azurewebsites.net` *(use a URL exata do seu Web App, sem `/` no final)* |

3. Clique em **Apply** (embaixo) → **Confirm**.

---

### Passo 5.5 — Configurar o Startup Command e Segurança HTTPS/TLS
Ainda dentro do seu Web App, no menu esquerdo:
1. Vá em **Settings → Configuration → General settings**.
2. Em **Startup Command**, digite exatamente:
   ```text
   node dist-server/server.mjs
   ```
3. Role para baixo e confirme:
   - **HTTPS Only:** `On`
   - **Minimum Inbound TLS Version:** `1.2`
   - **FTPS state:** `Disabled` *(hardening — não usamos FTP)*
4. Clique em **Save → Continue**.

---

## 6. Parte 4 — Conectar GitHub Actions com OIDC (Sem Senha)

### Passo 6.1 — Criar App Registration no Microsoft Entra ID
1. Na barra de busca superior do Portal do Azure, digite **`App registrations`** e abra.
2. Clique em **+ New registration**.
3. Preencha:
   - **Name:** `id-github-blog-humberto-prod`
   - **Supported account types:** `Accounts in this organizational directory only (Single tenant)`
   - **Redirect URI:** deixe em branco.
4. Clique em **Register**.
5. Na tela **Overview** que abrir, copie e salve no bloco de notas:
   - **Application (client) ID** → será seu `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → será seu `AZURE_TENANT_ID`
   *(Aproveite e pegue também o **Subscription ID** na tela **Overview** do seu Web App → será seu `AZURE_SUBSCRIPTION_ID`.)*

### Passo 6.2 — Criar a Credencial Federada (OIDC) para o GitHub
Ainda dentro do App Registration `id-github-blog-humberto-prod`:
1. No menu esquerdo, vá em **Manage → Certificates & secrets**.
2. Clique na aba **Federated credentials → + Add credential**.
3. Preencha:
   - **Federated credential scenario:** `GitHub Actions deploying Azure resources`
   - **Organization:** seu usuário exato do GitHub
   - **Repository:** `blog-humberto-azure`
   - **Entity type:** `Branch`
   - **GitHub branch name:** `main`
   - **Name:** `github-main-deploy`
4. Clique em **Add**.

### Passo 6.3 — Dar Permissão de Menor Privilégio no Web App (IAM)
1. Volte para o seu **Web App** (`humbertojezus`).
2. No menu esquerdo, clique em **Access control (IAM) → + Add → Add role assignment**.
3. Na aba **Role**, procure e selecione: **`Website Contributor`** → clique em **Next**.
4. Na aba **Members**, clique em **+ Select members**, busque por **`id-github-blog-humberto-prod`**, selecione e clique em **Select**.
5. Clique em **Review + assign** (duas vezes).

### Passo 6.4 — Cadastrar Secrets e Variable no GitHub
1. Abra seu repositório no GitHub (`blog-humberto-azure`).
2. Clique em **Settings** (aba superior) → no menu esquerdo **Secrets and variables → Actions**.
3. Na aba **Secrets**, clique em **New repository secret** 3 vezes para criar:
   - `AZURE_CLIENT_ID` = *(Application client ID do Passo 6.1)*
   - `AZURE_TENANT_ID` = *(Directory tenant ID do Passo 6.1)*
   - `AZURE_SUBSCRIPTION_ID` = *(Subscription ID da sua conta Azure)*
4. Mude para a aba **Variables** (ao lado de Secrets) e clique em **New repository variable**:
   - `AZURE_WEBAPP_NAME` = `humbertojezus` *(nome exato do seu Web App no Azure)*

---

## 7. Parte 5 — Fazer o Primeiro Deploy e Testar Tudo

1. No GitHub, clique na aba **Actions**.
2. No menu esquerdo, clique em **`Build & Deploy Blog to Azure Web App (App Service)`**.
3. Clique em **Run workflow → Run workflow** (botão verde).
4. Acompanhe o passo a passo (~1 a 2 minutos) até ficar com o **check verde**.
5. Teste as URLs no navegador (troque `humbertojezus` pelo nome do seu Web App):
   - Blog no ar: `https://humbertojezus.azurewebsites.net`
   - Saúde da API: `https://humbertojezus.azurewebsites.net/healthz` *(deve retornar `{"status":"ok"}`)*
   - Armazenamento pronto: `https://humbertojezus.azurewebsites.net/readyz` *(deve retornar `{"status":"ready","storage":"local-disk"}`)*
   - SEO Google: `https://humbertojezus.azurewebsites.net/robots.txt` e `https://humbertojezus.azurewebsites.net/sitemap.xml`
   - Painel Admin: `https://humbertojezus.azurewebsites.net/admin` *(entre com `BLOG_ADMIN_EMAIL` e `BLOG_ADMIN_PASSWORD`)*

> **A partir de agora:**
> - **Escrever artigos / editar páginas:** faça direto em `/admin` no ar (salva em `/home/site/blog-data` e sobrevive a novos deploys).
> - **Mudar código / layout:** altere no computador e rode `git add . && git commit -m "ajuste" && git push` — o GitHub Actions atualiza o Azure sozinho!

---

## 8. Parte 6 — FinOps: Criar Alerta de Custo no Azure (R$ 0 de surpresa)

1. No Portal do Azure, busque por **`Cost Management`** → no menu esquerdo clique em **Budgets → + Add**.
2. Preencha:
   - **Scope:** selecione o Resource Group `rg-blog-humberto-prod-eus2` (ou sua assinatura inteira).
   - **Name:** `budget-blog-humberto-alerta`
   - **Reset period:** `Billing month`
   - **Budget amount:** `5` *(USD 5 ou BRL 5 — teto bem baixo para avisar imediatamente se qualquer recurso começar a cobrar)*
3. Em **Set alerts**, adicione:
   - `Actual` — `50%` do orçamento → coloque seu e-mail `humbertojezus@gmail.com`
   - `Actual` — `100%` do orçamento → `humbertojezus@gmail.com`
4. Clique em **Create**.

---

## 9. Parte 7 — Ativar Google Search Console e Testar LinkedIn

1. **Google Search Console (grátis):**
   - Acesse **https://search.google.com/search-console** → **Adicionar propriedade** → **Prefixo do URL** → cole `https://humbertojezus.azurewebsites.net`.
   - Após verificar, clique em **Sitemaps** no menu esquerdo, digite `sitemap.xml` e clique em **Enviar**.
2. **LinkedIn Post Inspector (validar cartão social):**
   - Acesse **https://www.linkedin.com/post-inspector/** e cole o link de um artigo (`https://humbertojezus.azurewebsites.net/post/1`).
   - Confirme que aparece a foto de capa, título e resumo do artigo.

---

## Solução Rápida de Problemas

- **Erro 502 / Application Error logo após o deploy:** aguarde 30s (cold start do F1) e recarregue. Se persistir, abra o Web App → **Monitoring → Log stream** e confirme que o *Startup Command* está exatamente `node dist-server/server.mjs` e `NODE_ENV=production`.
- **Erro no GitHub Actions (`AADSTS70021` / OIDC):** confira no Passo 6.2 se **Organization**, **Repository** e **Branch (`main`)** estão escritos exatamente iguais (maiúsculas/minúsculas) ao seu repositório no GitHub.
- **Erro `403 AuthorizationFailed` no deploy:** confira no Passo 6.3 se a role **`Website Contributor`** foi atribuída ao app `id-github-blog-humberto-prod` no IAM do Web App.
