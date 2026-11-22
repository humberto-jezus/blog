# Padrão Oficial de Diagramas de Arquitetura Azure (Humberto Jezus)

Sempre que o usuário Humberto Jezus solicitar a geração de diagramas de arquitetura, este é o **padrão visual obrigatório**:

### 1. Diretrizes Visuais (Template Oficial Azure Architecture Center):
- **Fundo:** 100% Branco (`#ffffff`).
- **Logo Oficial:** Logotipo oficial da Microsoft com 4 quadrados coloridos (`#f25022`, `#7fba00`, `#00a4ef`, `#ffb900`) + texto `Microsoft Azure` no canto inferior esquerdo.
- **Delimitação de Ambiente:** Contorno em **azul pontilhado** (`stroke="#0078d4"`, `stroke-dasharray="6,5"`) com cantos arredondados, identificando o serviço principal no topo e a tag do Resource Group no canto inferior.
- **Subdivisões de Serviço:** Caixas internas com contorno cinza fino (`#94a3b8`) com os títulos centralizados (ex: `Front end`, `Container Services`, `Back-end services`, `Utility services`).
- **Ícones Oficiais:** Utilização exclusiva dos SVGs oficiais do Azure (`ContainerApps.svg`, `StorageAccounts.svg`, `ResourceGroup.svg`, `ManagedIdentityUserAssignedIdentities.svg`, etc.).
- **Roteamento de Linhas sem Atropelamento (Zero-Collision):**
  - Todas as linhas e setas pretas finas (`stroke="#1e293b"`) devem possuir pílulas com fundo branco (`<rect fill="#ffffff" stroke="#e2e8f0"/>`) sob os textos das setas para que a linha **nunca cruze ou atropele** letras ou rótulos.
  - Linhas de deploy ou assíncronas devem ser pontilhadas (`stroke-dasharray="5,4"`).
  - Rotas de fluxo devem fazer curvas ortogonais limpas (90 graus) contornando as caixas de serviço sem invadi-las.

### 2. Script Gerador de Referência:
- Arquivo: `scripts/generate_azure_center_diagram.py`
- Execução: `python scripts/generate_azure_center_diagram.py` (Gera SVG e renderiza PNG 2x via Playwright).
