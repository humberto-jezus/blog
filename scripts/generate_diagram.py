import os
import base64
from playwright.sync_api import sync_playwright

icon_dir = r"C:\Users\Humberto\.vscode\extensions\ms-azuretools.vscode-azureresourcegroups-0.12.7\resources\azureIcons"
out_dir = r"c:\Users\Humberto\Aplicações\Blog\humberto-jezus\public\images"
os.makedirs(out_dir, exist_ok=True)

def get_b64(fname):
    fpath = os.path.join(icon_dir, fname)
    if os.path.exists(fpath):
        with open(fpath, "rb") as f:
            return "data:image/svg+xml;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

icon_aca = get_b64("ContainerApps.svg")
icon_cae = get_b64("ContainerAppsEnvironment.svg")
icon_storage = get_b64("StorageAccounts.svg")
icon_rg = get_b64("ResourceGroup.svg")
icon_sub = get_b64("Subscription.svg")
icon_ip = get_b64("PublicIpAddresses.svg")
icon_identity = get_b64("ManagedIdentityUserAssignedIdentities.svg")

html_content = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }}
  body {{
    background: #f8fafc;
    width: 1560px;
    height: 940px;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #1e293b;
  }}
  .header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 12px;
  }}
  .title-group h1 {{
    font-size: 23px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .badge-tag {{
    background: #0078d4;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .author-badge {{
    text-align: right;
    font-size: 12px;
    color: #475569;
  }}
  .author-badge strong {{
    font-size: 14px;
    color: #0078d4;
    display: block;
  }}
  .canvas-container {{
    position: relative;
    width: 1496px;
    height: 720px;
    margin-top: 12px;
  }}
  svg.diagram {{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }}
  .footer-bar {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    background: #0f172a;
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 11px;
  }}
  .spec-item strong {{
    display: block;
    color: #38bdf8;
    font-size: 12px;
    margin-bottom: 2px;
  }}
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="title-group">
      <h1>
        <img src="{icon_sub}" width="26" height="26" style="vertical-align: middle;"/>
        Diagrama de Arquitetura de Referência: Fluxo de Dados e Componentes
        <span class="badge-tag">Azure Production</span>
      </h1>
      <p style="font-size: 12.5px; color: #64748b; margin-top: 2px;">
        Azure Container Apps (Consumption) • Persistência Azure Files SMB • Managed TLS • CI/CD GitHub Actions
      </p>
    </div>
    <div class="author-badge">
      <strong>Humberto Jezus</strong>
      Enterprise Cloud Architect &amp; MCT | humbertojezus-techblog.com
    </div>
  </div>

  <!-- Diagram Canvas with Native SVG Elements, Icons and Flow Arrows -->
  <div class="canvas-container">
    <svg class="diagram" viewBox="0 0 1496 720">
      
      <!-- Definitions for Arrows and Shadows -->
      <defs>
        <!-- Standard Arrow Marker (Blue) -->
        <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
        </marker>

        <!-- Standard Arrow Marker (Green) -->
        <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
        </marker>
        <marker id="arrow-green-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 10 1 L 0 5 L 10 9 z" fill="#10b981" />
        </marker>

        <!-- DevOps Arrow Marker (Dark Blue) -->
        <marker id="arrow-devops" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
        </marker>

        <!-- Security Arrow Marker (Purple) -->
        <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
        </marker>

        <!-- Card Shadow Filter -->
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.06"/>
        </filter>
      </defs>

      <!-- ================= 1. BOUNDING BOXES ================= -->

      <!-- Azure Cloud Boundary -->
      <rect x="350" y="20" width="1120" height="680" rx="16" fill="#ffffff" stroke="#0078d4" stroke-width="2" filter="url(#cardShadow)"/>
      <image href="{icon_sub}" x="370" y="36" width="22" height="22"/>
      <text x="400" y="52" fill="#0078d4" font-size="13.5" font-weight="700">Microsoft Azure (MSDN Platforms Subscription)</text>
      
      <!-- Region Badge -->
      <rect x="1300" y="34" width="150" height="26" rx="6" fill="#e0f2fe"/>
      <text x="1375" y="51" fill="#0284c7" font-size="11" font-weight="700" text-anchor="middle">Region: East US 2</text>

      <!-- Resource Group Boundary -->
      <rect x="375" y="80" width="1070" height="600" rx="14" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="6,4"/>
      <image href="{icon_rg}" x="395" y="96" width="22" height="22"/>
      <text x="425" y="112" fill="#0369a1" font-size="13" font-weight="700">Resource Group: rg-blog-humberto-prod-eus2</text>
      
      <rect x="1270" y="94" width="155" height="24" rx="6" fill="#dcfce7"/>
      <text x="1347" y="110" fill="#15803d" font-size="11" font-weight="700" text-anchor="middle">💰 Custo: R$ 0,00 / mês</text>

      <!-- Container Apps Environment (CAE) Boundary -->
      <rect x="400" y="145" width="570" height="515" rx="12" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5"/>
      <image href="{icon_cae}" x="420" y="160" width="24" height="24"/>
      <text x="452" y="177" fill="#0284c7" font-size="12.5" font-weight="700">Container Apps Environment: cae-blog-prod-eus2</text>
      <text x="452" y="193" fill="#64748b" font-size="10.5" font-weight="600">Workload Profile: Consumption | Scale-to-Zero (0-10 réplicas) | 180k vCPU-s Free</text>

      <!-- Storage Account Boundary -->
      <rect x="1010" y="145" width="415" height="515" rx="12" fill="#ffffff" stroke="#10b981" stroke-width="1.5"/>
      <image href="{icon_storage}" x="1030" y="160" width="24" height="24"/>
      <text x="1062" y="177" fill="#059669" font-size="12.5" font-weight="700">Storage Account: sttechblog</text>
      <text x="1062" y="193" fill="#64748b" font-size="10.5" font-weight="600">Standard LRS | Shared Key Enabled (Necessária para SMB Mount)</text>


      <!-- ================= 2. EXTERNAL NODES (LEFT) ================= -->

      <!-- Users & Internet Card -->
      <rect x="25" y="155" width="280" height="200" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
      <circle cx="60" cy="190" r="18" fill="#e0f2fe"/>
      <path d="M52 196 C52 190, 68 190, 68 196 M60 188 A4 4 0 1 0 60 180 A4 4 0 1 0 60 188" stroke="#0078d4" stroke-width="2" fill="none"/>
      <text x="88" y="195" fill="#0f172a" font-size="13.5" font-weight="700">Usuários &amp; Internet</text>

      <text x="42" y="230" fill="#475569" font-size="11.5" font-weight="600">Acesso Web via Domínio Próprio:</text>
      <rect x="42" y="240" width="246" height="24" rx="5" fill="#f1f5f9"/>
      <text x="50" y="256" fill="#0f172a" font-size="11" font-family="Consolas, monospace" font-weight="700">www.humbertojezus-techblog.com</text>

      <rect x="42" y="270" width="246" height="24" rx="5" fill="#f1f5f9"/>
      <text x="50" y="286" fill="#0f172a" font-size="11" font-family="Consolas, monospace" font-weight="700">humbertojezus-techblog.com (Apex)</text>

      <text x="42" y="318" fill="#10b981" font-size="11" font-weight="700">✓ Resolução DNS (CNAME + A-Record)</text>
      <text x="42" y="334" fill="#10b981" font-size="11" font-weight="700">✓ Certificado SSL Gerenciado Grátis</text>

      <!-- GitHub Actions Card -->
      <rect x="25" y="445" width="280" height="215" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
      <circle cx="60" cy="480" r="18" fill="#f1f5f9"/>
      <path d="M60 468 C53.4 468 48 473.4 48 480 C48 485.3 51.4 489.8 56.2 491.4 C56.8 491.5 57 491.1 57 490.8 L57 488.6 C54 489.2 53.2 487.8 53 487.1 C52.9 486.8 52.3 485.7 51.8 485.4 C51.4 485.2 50.8 484.6 51.8 484.6 C52.7 484.6 53.4 485.5 53.6 485.8 C54.7 487.6 56.4 487.1 57.1 486.8 C57.2 486 57.5 485.5 57.9 485.2 C55.2 484.9 52.4 483.9 52.4 479.3 C52.4 478 52.9 476.9 53.6 476.1 C53.5 475.8 53.1 474.6 53.7 472.9 C53.7 472.9 54.7 472.6 57 474.1 C58 473.8 59 473.7 60 473.7 C61 473.7 62 473.8 63 474.1 C65.3 472.6 66.3 472.9 66.3 472.9 C66.9 474.6 66.5 475.8 66.4 476.1 C67.1 476.9 67.6 478 67.6 479.3 C67.6 483.9 64.8 484.9 62.1 485.2 C62.5 485.6 62.9 486.3 62.9 487.4 L62.9 490.8 C62.9 491.1 63.1 491.5 63.7 491.4 C68.5 489.8 72 485.3 72 480 C72 473.4 66.6 468 60 468 Z" fill="#24292f"/>
      <text x="88" y="485" fill="#0f172a" font-size="13.5" font-weight="700">GitHub Actions (CI/CD)</text>

      <text x="42" y="520" fill="#475569" font-size="11.5" font-weight="600">Repositório Oficial de Código:</text>
      <rect x="42" y="528" width="246" height="24" rx="5" fill="#f1f5f9"/>
      <text x="50" y="544" fill="#0f172a" font-size="11" font-family="Consolas, monospace" font-weight="700">github.com/humberto-jezus/blog</text>

      <text x="42" y="575" fill="#334155" font-size="11.5">• Trigger: Push na branch <tspan font-family="Consolas" font-weight="700">main</tspan></text>
      <text x="42" y="595" fill="#334155" font-size="11.5">• Multi-stage Docker Build (Node 22)</text>
      <text x="42" y="615" fill="#334155" font-size="11.5">• Automação: <tspan font-family="Consolas" font-weight="700">azure/container-apps-deploy</tspan></text>
      <text x="42" y="635" fill="#7c3aed" font-size="11" font-weight="700">🔒 Secrets: AZURE_CREDENTIALS</text>


      <!-- ================= 3. INTERNAL NODES (INSIDE CAE & STORAGE) ================= -->

      <!-- Node A: Ingress Controller / TLS Endpoint -->
      <g id="node-ingress">
        <rect x="425" y="240" width="190" height="150" rx="10" fill="#f0f9ff" stroke="#0078d4" stroke-width="1.5" filter="url(#cardShadow)"/>
        <image href="{icon_ip}" x="445" y="255" width="28" height="28"/>
        <text x="480" y="274" fill="#0078d4" font-size="12.5" font-weight="700">ACA Ingress</text>

        <rect x="440" y="295" width="160" height="20" rx="4" fill="#e0f2fe"/>
        <text x="520" y="309" fill="#0284c7" font-size="10.5" font-weight="700" text-anchor="middle">Porta Externa: 443 (HTTPS)</text>

        <text x="440" y="335" fill="#334155" font-size="11">• Terminação TLS Automática</text>
        <text x="440" y="352" fill="#334155" font-size="11">• Roteamento HTTP/2</text>
        <text x="440" y="369" fill="#10b981" font-size="10.5" font-weight="600">✓ Managed Cert Validado</text>
      </g>

      <!-- Node B: Container App 'blog' -->
      <g id="node-app">
        <rect x="680" y="240" width="265" height="390" rx="12" fill="#ffffff" stroke="#0078d4" stroke-width="2" filter="url(#cardShadow)"/>
        
        <rect x="680" y="240" width="265" height="42" rx="12" fill="#0078d4"/>
        <image href="{icon_aca}" x="692" y="248" width="26" height="26"/>
        <text x="726" y="266" fill="#ffffff" font-size="13" font-weight="700">Container App: blog</text>
        
        <rect x="850" y="250" width="80" height="20" rx="4" fill="#22c55e"/>
        <text x="890" y="264" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">REVISÃO ATIVA</text>

        <g transform="translate(696, 300)">
          <text x="0" y="0" fill="#0f172a" font-size="12" font-weight="700">Especificações do Container:</text>
          
          <rect x="0" y="10" width="233" height="24" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="8" y="26" fill="#334155" font-size="11">Stack: <tspan font-weight="700">Node.js 22 LTS Alpine</tspan></text>

          <rect x="0" y="42" width="233" height="24" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="8" y="58" fill="#334155" font-size="11">Frontend: <tspan font-weight="700">React + Vite + Tailwind</tspan></text>

          <rect x="0" y="74" width="233" height="24" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="8" y="90" fill="#334155" font-size="11">Backend: <tspan font-weight="700">Express ESM API (Port 3000)</tspan></text>

          <rect x="0" y="106" width="233" height="24" rx="4" fill="#fef2f2" stroke="#fecaca"/>
          <text x="8" y="122" fill="#991b1b" font-size="11" font-weight="700">Segurança: Non-Root (node:node)</text>

          <text x="0" y="155" fill="#0369a1" font-size="12" font-weight="700">Ponto de Montagem do Volume:</text>
          
          <rect x="0" y="165" width="233" height="54" rx="6" fill="#ecfdf5" stroke="#6ee7b7"/>
          <text x="10" y="184" fill="#065f46" font-size="11" font-weight="700">Mount Path: /app/data</text>
          <text x="10" y="200" fill="#047857" font-size="10.5">Mapeado via SMB para `sttechblog`</text>
          <text x="10" y="213" fill="#047857" font-size="10.5">Persiste o banco `blog-db.json`</text>

          <text x="0" y="246" fill="#64748b" font-size="10.5" font-style="italic">
            * Réplica pode escalar para zero ou reiniciar
            sem nenhuma perda de dados.
          </text>
        </g>
      </g>

      <!-- Node C: Azure File Share (Storage Account) -->
      <g id="node-storage">
        <rect x="1040" y="240" width="355" height="390" rx="12" fill="#ffffff" stroke="#10b981" stroke-width="2" filter="url(#cardShadow)"/>
        
        <rect x="1040" y="240" width="355" height="42" rx="12" fill="#059669"/>
        <image href="{icon_storage}" x="1052" y="248" width="26" height="26"/>
        <text x="1086" y="266" fill="#ffffff" font-size="13" font-weight="700">Azure Files: sttechblog</text>
        <rect x="1270" y="250" width="115" height="20" rx="4" fill="#047857"/>
        <text x="1327" y="264" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">PERSISTENTE</text>

        <g transform="translate(1060, 305)">
          <text x="0" y="0" fill="#0f172a" font-size="12.5" font-weight="700">Compartilhamento de Arquivo:</text>
          
          <rect x="0" y="12" width="315" height="38" rx="6" fill="#ecfdf5" stroke="#a7f3d0"/>
          <text x="12" y="30" fill="#065f46" font-size="12" font-weight="700">📁 File Share: blogdata</text>
          <text x="12" y="44" fill="#047857" font-size="10.5">Protocolo: SMB 3.0 | Tier: Transaction Optimized</text>

          <text x="0" y="78" fill="#0f172a" font-size="12" font-weight="700">Arquivos Persistidos na Nuvem:</text>
          
          <rect x="0" y="88" width="315" height="85" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="12" y="110" fill="#334155" font-size="11.5">📄 <tspan font-family="Consolas" font-weight="700">blog-db.json</tspan> (Artigos, Tags, Admin)</text>
          <text x="12" y="130" fill="#334155" font-size="11.5">🖼️ <tspan font-family="Consolas">/uploads</tspan> (Imagens de posts e perfil)</text>
          <text x="12" y="155" fill="#15803d" font-size="11" font-weight="700">✓ Sobrevive a novos deploys e reinícios</text>

          <text x="0" y="196" fill="#0369a1" font-size="12" font-weight="700">Decisão Arquitetural de FinOps:</text>
          <rect x="0" y="206" width="315" height="70" rx="6" fill="#eff6ff" stroke="#bfdbfe"/>
          <text x="10" y="224" fill="#1e40af" font-size="11">• Sem custo fixo de banco gerenciado (SQL/Cosmos)</text>
          <text x="10" y="242" fill="#1e40af" font-size="11">• Custo: frações de centavos por GB armazenado</text>
          <text x="10" y="260" fill="#1e40af" font-size="11">• Sem custos de Recovery Services Vault (No Backup)</text>
        </g>
      </g>

      <!-- Security / Entra ID Box (Top Middle) -->
      <g id="node-entraid">
        <rect x="730" y="90" width="320" height="46" rx="8" fill="#faf5ff" stroke="#c084fc" stroke-width="1.5"/>
        <image href="{icon_identity}" x="740" y="100" width="24" height="24"/>
        <text x="772" y="112" fill="#6b21a8" font-size="11.5" font-weight="700">Microsoft Entra ID (Service Principal)</text>
        <text x="772" y="126" fill="#7e22ce" font-size="10">Escopo RBAC: Contributor restrito a rg-blog-humberto-prod-eus2</text>
      </g>


      <!-- ================= 4. FLOW ARROWS WITH BADGES & LABELS ================= -->

      <!-- ARROW 1: Users -> Ingress -->
      <path d="M 305 255 L 417 255" fill="none" stroke="#0284c7" stroke-width="3" marker-end="url(#arrow-blue)"/>
      <rect x="315" y="235" width="95" height="20" rx="4" fill="#0284c7"/>
      <text x="362" y="249" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">1. HTTPS :443</text>

      <!-- ARROW 2: Ingress -> Container App -->
      <path d="M 615 315 L 672 315" fill="none" stroke="#0078d4" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
      <rect x="620" y="295" width="55" height="18" rx="4" fill="#e0f2fe"/>
      <text x="647" y="308" fill="#0078d4" font-size="9" font-weight="700" text-anchor="middle">HTTP :3000</text>

      <!-- ARROW 3: Container App <===> Azure Files (SMB Mount) -->
      <!-- Thick Bidirectional Green Line -->
      <path d="M 953 460 L 1030 460" fill="none" stroke="#10b981" stroke-width="5" marker-end="url(#arrow-green)" marker-start="url(#arrow-green-start)"/>
      <rect x="948" y="425" width="88" height="28" rx="5" fill="#10b981" filter="url(#cardShadow)"/>
      <text x="992" y="440" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">3. SMB 3.0</text>
      <text x="992" y="450" fill="#ffffff" font-size="8.5" font-weight="600" text-anchor="middle">Mount /app/data</text>

      <!-- ARROW 4: GitHub Actions -> Container App (CI/CD Deploy) -->
      <path d="M 305 550 L 510 550 L 510 470 L 672 470" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-devops)"/>
      <rect x="420" y="538" width="130" height="22" rx="4" fill="#2563eb"/>
      <text x="485" y="553" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">4. CI/CD: Deploy Revision</text>

      <!-- ARROW 5: GitHub Actions -> Entra ID (Auth) -->
      <path d="M 165 445 L 165 113 L 722 113" fill="none" stroke="#7c3aed" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow-purple)"/>
      <rect x="320" y="103" width="180" height="20" rx="4" fill="#7c3aed"/>
      <text x="410" y="117" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">Autenticação: AZURE_CREDENTIALS</text>

    </svg>
  </div>

  <!-- Footer Specs -->
  <div class="footer-bar">
    <div class="spec-item">
      <strong>1. FinOps &amp; Custo Zero</strong>
      R$ 0,00 mensal usando cota gratuita perpétua do ACA Consumption + Storage LRS.
    </div>
    <div class="spec-item">
      <strong>2. Persistência de Estado</strong>
      Desacoplamento de réplicas efêmeras via Azure Files SMB Mount bidirecional.
    </div>
    <div class="spec-item">
      <strong>3. Segurança e Identidade</strong>
      Service Principal com escopo restrito (PoLP) no Resource Group + Container Non-Root.
    </div>
    <div class="spec-item">
      <strong>4. Exames Relacionados</strong>
      AZ-104 (Admin/Storage), AZ-305 (Solutions Architect), AZ-400 (DevOps).
    </div>
  </div>

</body>
</html>
"""

html_file = os.path.join(out_dir, "architecture.html")
with open(html_file, "w", encoding="utf-8") as f:
    f.write(html_content)

png_file = os.path.join(out_dir, "azure-blog-architecture.png")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1560, "height": 940}, device_scale_factor=2)
    page.goto("file:///" + html_file.replace(os.sep, "/"))
    page.screenshot(path=png_file, full_page=True)
    browser.close()

# Also copy to artifact directory
import shutil
art_dir = r"C:\Users\Humberto\.gemini\antigravity\brain\4de0e761-de9f-480a-a0cf-c5c824d9c155"
shutil.copy2(png_file, os.path.join(art_dir, "azure-blog-architecture.png"))

print("Visual flowchart diagram PNG generated successfully at:", png_file)
print("File size:", os.path.getsize(png_file), "bytes")
