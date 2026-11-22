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

html_content = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }}
  body {{
    background: #f8fafc;
    width: 1440px;
    height: 840px;
    padding: 32px;
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
    padding-bottom: 16px;
  }}
  .title-group h1 {{
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .title-group p {{
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
    font-weight: 500;
  }}
  .badge-tag {{
    background: #0078d4;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
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

  /* Main Canvas */
  .canvas {{
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    flex: 1;
    margin-top: 20px;
  }}

  /* External Panel */
  .external-panel {{
    display: flex;
    flex-direction: column;
    gap: 16px;
  }}
  .card {{
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }}
  .card-header {{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 10px;
  }}
  .card-body {{
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
  }}
  .pill {{
    display: inline-block;
    padding: 2px 8px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: Consolas, monospace;
    font-size: 11px;
    color: #0f172a;
    font-weight: 600;
  }}

  /* Azure Cloud Box */
  .azure-cloud {{
    background: white;
    border: 2px solid #0078d4;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    box-shadow: 0 10px 15px -3px rgba(0, 120, 212, 0.08);
  }}
  .cloud-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 700;
    color: #0078d4;
  }}
  .region-tag {{
    background: #e0f2fe;
    color: #0284c7;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
  }}

  /* Resource Group Box */
  .rg-box {{
    background: #f8fafc;
    border: 1.5px dashed #0284c7;
    border-radius: 14px;
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }}
  .rg-header {{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #0369a1;
  }}

  .rg-grid {{
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 18px;
    flex: 1;
  }}

  /* CAE Box */
  .cae-box {{
    background: white;
    border: 1.5px solid #38bdf8;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }}
  .cae-header {{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 700;
    color: #0284c7;
  }}
  .container-app-box {{
    background: #f0f9ff;
    border: 1.5px solid #0078d4;
    border-radius: 10px;
    padding: 14px;
  }}

  /* Storage Box */
  .storage-box {{
    background: white;
    border: 1.5px solid #10b981;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }}
  .storage-header {{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 700;
    color: #059669;
  }}

  /* Footer Specs */
  .footer-bar {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    background: #0f172a;
    color: white;
    padding: 14px 22px;
    border-radius: 12px;
    font-size: 11.5px;
  }}
  .spec-item strong {{
    display: block;
    color: #38bdf8;
    font-size: 12.5px;
    margin-bottom: 2px;
  }}
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="title-group">
      <h1>
        <img src="{icon_sub}" width="28" height="28" style="vertical-align: middle;"/>
        Arquitetura Serverless em Produção com Custo Zero (FinOps)
        <span class="badge-tag">Microsoft Azure</span>
      </h1>
      <p>Azure Container Apps (Consumption) + Azure Files Persistent SMB Mount + Managed TLS + GitHub Actions</p>
    </div>
    <div class="author-badge">
      <strong>Humberto Jezus</strong>
      Enterprise Cloud Architect &amp; MCT | humbertojezus-techblog.com
    </div>
  </div>

  <!-- Main Canvas -->
  <div class="canvas">

    <!-- Left Column: External Clients & CI/CD -->
    <div class="external-panel">
      
      <!-- Users & DNS -->
      <div class="card">
        <div class="card-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Internet &amp; Custom DNS
        </div>
        <div class="card-body">
          <p><strong>Tráfego Web Seguro (HTTPS / 443)</strong></p>
          <div style="margin: 8px 0; display: flex; flex-direction: column; gap: 4px;">
            <span class="pill">www.humbertojezus-techblog.com</span>
            <span class="pill">humbertojezus-techblog.com</span>
          </div>
          <p style="color: #10b981; font-weight: 700; margin-top: 6px;">✓ Certificado SSL/TLS Gerenciado Gratuito</p>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Renovação 100% automatizada pela Microsoft</p>
        </div>
      </div>

      <!-- GitHub Actions CI/CD -->
      <div class="card">
        <div class="card-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#24292f"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub Actions CI/CD
        </div>
        <div class="card-body">
          <p><strong>Repositório:</strong> <span class="pill">humberto-jezus/blog</span></p>
          <p style="margin-top: 4px;"><strong>Trigger:</strong> Push na branch <span class="pill">main</span></p>
          <p style="margin-top: 4px;"><strong>Docker:</strong> Multi-Stage Build (Node 22)</p>
          <div style="margin-top: 8px; padding: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 11px; color: #1e40af;">
            <strong>Microsoft Entra ID:</strong> Service Principal restrito ao Resource Group (PoLP - Menor Privilégio).
          </div>
        </div>
      </div>

    </div>

    <!-- Right: Azure Region & Resource Group -->
    <div class="azure-cloud">
      
      <div class="cloud-header">
        <span style="display: flex; align-items: center; gap: 8px;">
          <img src="{icon_sub}" width="22" height="22"/>
          Microsoft Azure – MSDN Platforms Subscription
        </span>
        <span class="region-tag">Region: East US 2 (Virginia)</span>
      </div>

      <!-- Resource Group -->
      <div class="rg-box">
        
        <div class="rg-header">
          <img src="{icon_rg}" width="22" height="22"/>
          Resource Group: rg-blog-humberto-prod-eus2
          <span style="margin-left: auto; font-size: 11.5px; background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 6px; font-weight: 700;">
            💰 Custo Estimado: R$ 0,00 / mês
          </span>
        </div>

        <div class="rg-grid">
          
          <!-- CAE Column -->
          <div class="cae-box">
            <div class="cae-header">
              <img src="{icon_cae}" width="24" height="24"/>
              Container Apps Environment: cae-blog-prod-eus2
            </div>
            
            <div style="font-size: 11px; color: #475569; display: flex; gap: 6px; flex-wrap: wrap;">
              <span class="pill">Workload: Consumption</span>
              <span class="pill">Scale-to-Zero (0-10)</span>
              <span class="pill">180k vCPU-s Free/mês</span>
            </div>

            <!-- Ingress & Container App -->
            <div class="container-app-box">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 700; color: #0078d4; font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
                  <img src="{icon_aca}" width="22" height="22"/>
                  Container App: blog
                </span>
                <span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">EM PRODUÇÃO</span>
              </div>

              <div style="font-size: 11.5px; line-height: 1.7; color: #334155;">
                <div>• <strong>Runtime:</strong> Node.js 22 LTS Alpine + Vite React</div>
                <div>• <strong>Segurança:</strong> Execução sob usuário <span class="pill">node:node</span> (Non-Root)</div>
                <div>• <strong>Ingress:</strong> External HTTPS (Porta 3000 interna / 443 externa)</div>
                <div>• <strong>Volume Mapeado:</strong> <span class="pill" style="background: #dcfce7; border-color: #86efac; color: #166534;">/app/data</span> (Persistent Mount)</div>
              </div>
            </div>

            <div style="font-size: 11px; color: #475569; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #0078d4;">
              <strong>Definição no Ambiente:</strong> Volume <span class="pill">blog-storage</span> registrado com chave gerenciada e criptografada no CAE.
            </div>

          </div>

          <!-- Storage Account Column -->
          <div class="storage-box">
            <div class="storage-header">
              <img src="{icon_storage}" width="24" height="24"/>
              Storage Account: sttechblog
            </div>

            <div style="font-size: 11px; color: #475569; display: flex; gap: 6px;">
              <span class="pill">Tier: Standard LRS</span>
              <span class="pill">Shared Key: Enabled</span>
            </div>

            <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-top: 4px;">
              <div style="font-weight: 700; color: #065f46; font-size: 12.5px; margin-bottom: 6px;">
                📁 Azure File Share: blogdata
              </div>
              <div style="font-size: 11.5px; color: #047857; line-height: 1.6;">
                <div>• <strong>Protocolo:</strong> SMB 3.0</div>
                <div>• <strong>Access Tier:</strong> Transaction Optimized</div>
                <div>• <strong>Arquivo Persistido:</strong> <span class="pill">blog-db.json</span></div>
                <div>• <strong>Azure Backup:</strong> Desativado (Zero Extra Cost)</div>
              </div>
            </div>

            <div style="font-size: 11px; color: #065f46; background: #f0fdf4; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #10b981; margin-top: auto;">
              <strong>Garantia de Estado:</strong> O container é efêmero, mas o disco é persistente. Qualquer deploy ou restart preserva 100% dos dados.
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

  <!-- Footer Specs -->
  <div class="footer-bar">
    <div class="spec-item">
      <strong>1. FinOps &amp; Custo Zero</strong>
      R$ 0,00 mensal usando cotas gratuitas permanentes do ACA + Storage LRS.
    </div>
    <div class="spec-item">
      <strong>2. Persistência de Estado</strong>
      Desacoplamento de réplicas efêmeras via Azure Files SMB Mount.
    </div>
    <div class="spec-item">
      <strong>3. Segurança e Identidade</strong>
      Service Principal com escopo PoLP no Resource Group + Container Non-Root.
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
    page = browser.new_page(viewport={"width": 1440, "height": 840}, device_scale_factor=2)
    page.goto("file:///" + html_file.replace(os.sep, "/"))
    page.screenshot(path=png_file, full_page=True)
    browser.close()

print("Architecture diagram PNG generated successfully at:", png_file)
print("File size:", os.path.getsize(png_file), "bytes")
