# Arquitetura Zero-Trust no Microsoft Azure (ACA + Key Vault + Blob Storage + OIDC)

Este projeto está preparado para rodar no **nível corporativo Zero-Trust** dentro da cota gratuita/baixíssimo custo do Azure:

- **Zero Senhas no GitHub:** deploy via **OIDC Federated Credentials** com Microsoft Entra ID.
- **Zero Storage Account Keys:** Storage Account com `allowSharedKeyAccess: false` e `allowBlobPublicAccess: false`; acesso exclusivo via **User-Assigned Managed Identity** (`DefaultAzureCredential` + RBAC `Storage Blob Data Contributor`).
- **Zero Senhas em YAML/Env:** `BLOG_ADMIN_PASSWORD` e `BLOG_SESSION_SECRET` lidos direto do **Azure Key Vault (RBAC)** via `Key Vault Secrets User`.
- **Container Hardened:** imagem multi-stage `node:22-alpine` rodando com usuário não-root (`USER node`), sem `devDependencies`, com health probes (`/healthz` e `/readyz`) e cabeçalhos HTTP de segurança.
- **FinOps:** Container Apps no plano **Consumption** com `minReplicas: 0` (escala para zero na cota grátis mensal) + imagem gratuita no `ghcr.io` + TLS gerenciado gratuito para domínio próprio.

---

## Passo 1 — Criar Resource Group e Provisionar Infra com Bicep

> **Importante:** Antes do primeiro deploy do Container App, crie os 2 segredos no Key Vault (ou rode o passo 1a + 1b abaixo).

```bash
# 1. Login no Azure
az login

# 2. Variáveis
RG="rg-blog-humberto-prod"
LOCATION="brazilsouth"
PREFIX="hjezusblog"
IMAGE="ghcr.io/SEU_USUARIO/SEU_REPO:latest"

# 3. Criar Resource Group
az group create --name $RG --location $LOCATION

# 4. (Opcional antes do Bicep) Validar plano com What-If
az deployment group what-if \
  --resource-group $RG \
  --template-file infra/main.bicep \
  --parameters appPrefix=$PREFIX containerImage=$IMAGE
```

### Criar os segredos no Key Vault (RBAC)
Como o Container App referencia os segredos do Key Vault no provisionamento, você pode:
1. Criar o Key Vault primeiro (ou rodar o Bicep, anotar o nome do Key Vault e popular os segredos):
```bash
# Conceder a si mesmo permissão temporária de criar segredos no Key Vault
MY_OID=$(az ad signed-in-user show --query id -o tsv)
KV_NAME="<nome-do-keyvault-gerado>"
KV_ID=$(az keyvault show --name $KV_NAME --resource-group $RG --query id -o tsv)

az role assignment create \
  --role "Key Vault Secrets Officer" \
  --assignee-object-id $MY_OID \
  --assignee-principal-type User \
  --scope $KV_ID

# Cadastrar senha forte do admin e chave aleatória da sessão
az keyvault secret set --vault-name $KV_NAME --name "blog-admin-password" --value "SUA_SENHA_FORTE_AQUI"
az keyvault secret set --vault-name $KV_NAME --name "blog-session-secret" --value "$(openssl rand -hex 32)"
```

2. Rodar o deploy completo do Bicep:
```bash
az deployment group create \
  --resource-group $RG \
  --template-file infra/main.bicep \
  --parameters appPrefix=$PREFIX containerImage=$IMAGE
```

---

## Passo 2 — Configurar GitHub Actions com OIDC (Sem Client Secret)

1. Crie uma **App Registration** no Microsoft Entra ID (ex.: `github-oidc-blog-deploy`).
2. Em **Certificates & secrets → Federated credentials → Add credential**:
   - Scenario: **GitHub Actions deploying Azure resources**
   - Organization / Repository / Branch: `main`
3. Dê a role **Contributor** (escopo restrito apenas ao Resource Group `$RG`) para essa App Registration.
4. No GitHub (**Settings → Secrets and variables → Actions**):
   - **Secrets:** `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
   - **Variables:** `AZURE_RESOURCE_GROUP` (`rg-blog-humberto-prod`), `AZURE_CONTAINER_APP_NAME` (`hjezusblog-app`)
5. No pacote do GitHub (`ghcr.io`), deixe a imagem como **Public** (ou configure credencial de pull no ACA).

---

## Passo 3 — Domínio Próprio + Certificado HTTPS Grátis no ACA

No Portal do Azure → seu Container App → **Custom domains → Add custom domain**:
1. Informe seu domínio (ex.: `blog.humbertojezus.com.br`).
2. Selecione **Managed certificate (Free)**.
3. Crie o registro `CNAME` e o registro `TXT` (`asuid`) no seu DNS.
4. Valide e aguarde ~2 minutos — o Azure emite e renova o TLS automaticamente de graça.

---

## Próximos Níveis de Evolução (para estudo avançado AZ-500 / AZ-700)

1. **VNet Integration + Private Endpoints:** integrar o ACA Environment a uma VNet dedicada e fechar o Storage Account e o Key Vault com `publicNetworkAccess: 'Disabled'` + Private Endpoints + Private DNS Zones.
2. **WAF na borda:** colocar **Azure Front Door** ou **Cloudflare WAF** na frente do domínio customizado.
3. **Observabilidade KQL:** criar alertas no Log Analytics para tentativas repetidas de login (`429`/`401` em `/api/auth/login`) e latência de rotas.
