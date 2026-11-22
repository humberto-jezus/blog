import os
import base64
from playwright.sync_api import sync_playwright
import shutil

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
icon_ip = get_b64("PublicIpAddresses.svg")
icon_identity = get_b64("ManagedIdentityUserAssignedIdentities.svg")

# The exact Microsoft Azure Architecture Center visual template
svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 680" width="1100" height="680" style="background:#ffffff; font-family: Segoe UI, -apple-system, Arial, sans-serif;">
  <defs>
    <!-- Solid Black Arrowhead -->
    <marker id="ms-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1e293b"/>
    </marker>
    <!-- Bidirectional Arrowhead -->
    <marker id="ms-arrow-start" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#1e293b"/>
    </marker>
  </defs>

  <!-- ================= TOP BADGE: AZURE CONTAINER APPS ================= -->
  <g transform="translate(570, 48)">
    <image href="{icon_cae}" x="-22" y="-22" width="44" height="44"/>
    <text x="32" y="-2" font-size="15" font-weight="600" fill="#1e293b">Azure Container Apps</text>
    <text x="32" y="16" font-size="12" fill="#64748b">cae-blog-prod-eus2 (Consumption)</text>
  </g>

  <!-- ================= MAIN ARCHITECTURE BOUNDARY (DASHED BLUE) ================= -->
  <!-- Dashed Container Apps Environment Boundary -->
  <rect x="400" y="110" width="450" height="340" rx="8" fill="none" stroke="#0078d4" stroke-width="1.8" stroke-dasharray="6,5"/>
  
  <!-- Boundary Label (Bottom Right) -->
  <g transform="translate(730, 465)">
    <image href="{icon_rg}" x="0" y="-8" width="18" height="18"/>
    <text x="24" y="6" font-size="11.5" font-weight="600" fill="#0078d4">Resource Group</text>
    <text x="24" y="20" font-size="10" fill="#64748b">rg-blog-humberto-prod-eus2</text>
  </g>

  <!-- Region Label (Bottom Left) -->
  <text x="415" y="468" font-size="11" fill="#64748b" font-weight="600">Region: East US 2 (Virginia)</text>


  <!-- ================= INNER BOX 1: FRONT END / INGRESS ================= -->
  <rect x="415" y="125" width="135" height="200" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="482" y="145" font-size="12.5" font-weight="600" fill="#1e293b" text-anchor="middle">Front end</text>

  <!-- Ingress Icon -->
  <g transform="translate(482, 215)">
    <circle cx="0" cy="0" r="22" fill="#f0f9ff" stroke="#0078d4" stroke-width="1.4"/>
    <image href="{icon_ip}" x="-13" y="-13" width="26" height="26"/>
    <text x="0" y="38" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">ACA Ingress</text>
    <text x="0" y="52" font-size="10" fill="#64748b" text-anchor="middle">Managed TLS</text>
  </g>
  <text x="482" y="315" font-size="10" fill="#94a3b8" text-anchor="middle">Port: 443</text>


  <!-- ================= INNER BOX 2: CONTAINER APP ================= -->
  <rect x="560" y="125" width="275" height="200" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="697" y="145" font-size="12.5" font-weight="600" fill="#1e293b" text-anchor="middle">Container Services</text>

  <!-- Container App Node -->
  <g transform="translate(697, 215)">
    <circle cx="0" cy="0" r="24" fill="#f0f9ff" stroke="#0078d4" stroke-width="1.5"/>
    <image href="{icon_aca}" x="-15" y="-15" width="30" height="30"/>
    <text x="0" y="40" font-size="13" font-weight="700" fill="#1e293b" text-anchor="middle">blog</text>
    <text x="0" y="55" font-size="10.5" fill="#475569" text-anchor="middle">Node.js 22 LTS Alpine</text>
    <text x="0" y="69" font-size="10" fill="#64748b" text-anchor="middle">React (Vite) + Express API</text>
  </g>
  <text x="697" y="315" font-size="10" fill="#94a3b8" text-anchor="middle">User: node (Non-Root)</text>


  <!-- ================= INNER BOX 3: UTILITY / ENVIRONMENT STORAGE ================= -->
  <rect x="415" y="335" width="420" height="100" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="625" y="354" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">Environment Configuration</text>

  <g transform="translate(520, 395)">
    <circle cx="0" cy="0" r="15" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
    <text x="0" y="4" font-size="9.5" font-weight="700" fill="#0078d4" text-anchor="middle">CAE</text>
    <text x="0" y="24" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">blog-storage</text>
    <text x="0" y="36" font-size="9" fill="#64748b" text-anchor="middle">(Volume Definition)</text>
  </g>

  <g transform="translate(730, 395)">
    <circle cx="0" cy="0" r="15" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
    <text x="0" y="4" font-size="9.5" font-weight="700" fill="#10b981" text-anchor="middle">SMB</text>
    <text x="0" y="24" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">Mount: /app/data</text>
    <text x="0" y="36" font-size="9" fill="#64748b" text-anchor="middle">(Stateful Persistence)</text>
  </g>


  <!-- ================= RIGHT COLUMN: EXTERNAL DATA STORES ================= -->
  <text x="965" y="150" font-size="13" font-weight="700" fill="#1e293b" text-anchor="middle">External</text>
  <text x="965" y="166" font-size="13" font-weight="700" fill="#1e293b" text-anchor="middle">data stores</text>

  <!-- Azure Storage / Azure Files Node -->
  <g transform="translate(965, 235)">
    <image href="{icon_storage}" x="-25" y="-25" width="50" height="50"/>
    <text x="0" y="42" font-size="12.5" font-weight="700" fill="#1e293b" text-anchor="middle">Azure Files</text>
    <text x="0" y="58" font-size="11" font-weight="600" fill="#059669" text-anchor="middle">blogdata (SMB 3.0)</text>
    <text x="0" y="74" font-size="10" fill="#64748b" text-anchor="middle">Storage: sttechblog</text>
    <text x="0" y="88" font-size="10" fill="#64748b" text-anchor="middle">Persiste: blog-db.json</text>
  </g>


  <!-- ================= LEFT COLUMN: CLIENT APPS ================= -->
  <g transform="translate(130, 215)">
    <!-- Browser window icon -->
    <rect x="-26" y="-22" width="52" height="42" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2"/>
    <rect x="-26" y="-22" width="52" height="10" rx="4" fill="#0284c7"/>
    <circle cx="-18" cy="-17" r="2" fill="#ffffff"/>
    <circle cx="-12" cy="-17" r="2" fill="#ffffff"/>
    <circle cx="-6" cy="-17" r="2" fill="#ffffff"/>
    <rect x="-20" y="-8" width="40" height="24" fill="#ffffff"/>

    <text x="0" y="38" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">Client apps</text>
    <text x="0" y="53" font-size="10" fill="#64748b" text-anchor="middle">humbertojezus-techblog.com</text>
    <text x="0" y="67" font-size="9.5" fill="#64748b" text-anchor="middle">Apex + WWW (Custom DNS)</text>
  </g>


  <!-- ================= BOTTOM-LEFT: CI/CD & DEVOPS ================= -->
  <!-- CI/CD Box -->
  <rect x="55" y="360" width="145" height="135" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="127" y="380" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">CI / CD</text>

  <!-- GitHub Actions Icon & Label inside Box -->
  <g transform="translate(127, 420)">
    <circle cx="0" cy="0" r="18" fill="#24292f"/>
    <path d="M0 -11 C-6.1 -11 -11 -6.1 -11 0 C-11 4.9 -7.8 9 -3.5 10.4 C-3 10.5 -2.7 10.2 -2.7 9.9 L-2.7 7.9 C-5.5 8.5 -6.2 7.1 -6.4 6.5 C-6.5 6.2 -7.1 5.2 -7.6 4.9 C-8 4.7 -8.6 4.2 -7.6 4.2 C-6.7 4.2 -6.1 5.1 -5.9 5.4 C-4.9 7.1 -3.3 6.6 -2.6 6.3 C-2.5 5.6 -2.2 5.1 -1.8 4.8 C-4.3 4.5 -6.9 3.6 -6.9 -0.6 C-6.9 -1.8 -6.4 -2.8 -5.7 -3.5 C-5.8 -3.8 -6.2 -4.9 -5.6 -6.5 C-5.6 -6.5 -4.7 -6.8 -2.5 -5.4 C-1.6 -5.6 -0.7 -5.7 0.3 -5.7 C1.3 -5.7 2.2 -5.6 3.1 -5.4 C5.3 -6.8 6.2 -6.5 6.2 -6.5 C6.8 -4.9 6.4 -3.8 6.3 -3.5 C7 -2.8 7.5 -1.8 7.5 -0.6 C7.5 3.6 4.9 4.5 2.4 4.8 C2.8 5.2 3.2 5.8 3.2 6.8 L3.2 9.9 C3.2 10.2 3.4 10.5 4 10.4 C8.3 9 11.5 4.9 11.5 0 C11.5 -6.1 6.6 -11 0 -11 Z" fill="#ffffff"/>
    <text x="0" y="32" font-size="11.5" font-weight="600" fill="#1e293b" text-anchor="middle">GitHub Actions</text>
    <text x="0" y="46" font-size="9.5" fill="#64748b" text-anchor="middle">humberto-jezus/blog</text>
  </g>

  <!-- Dev/Ops Person Icon -->
  <g transform="translate(127, 560)">
    <circle cx="0" cy="-6" r="12" fill="#0078d4"/>
    <path d="M-15 15 C-15 4, 15 4, 15 15 Z" fill="#0078d4"/>
    <text x="0" y="32" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">Dev / Ops</text>
    <text x="0" y="46" font-size="9.5" fill="#64748b" text-anchor="middle">Humberto Jezus</text>
  </g>


  <!-- ================= BOTTOM ROW: IDENTITY & SECURITY ================= -->
  <!-- Microsoft Entra ID (Service Principal) -->
  <g transform="translate(560, 560)">
    <image href="{icon_identity}" x="-22" y="-22" width="44" height="44"/>
    <text x="0" y="36" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">Microsoft Entra ID</text>
    <text x="0" y="50" font-size="10" fill="#64748b" text-anchor="middle">Service Principal (Deployer)</text>
  </g>

  <!-- Azure Monitor -->
  <g transform="translate(730, 560)">
    <circle cx="0" cy="-2" r="18" fill="#ffffff" stroke="#0078d4" stroke-width="1.4"/>
    <path d="M-10 6 A13 13 0 1 1 10 6" stroke="#0078d4" stroke-width="2" fill="none"/>
    <line x1="0" y1="-2" x2="6" y2="-8" stroke="#ef4444" stroke-width="2"/>
    <text x="0" y="36" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">Azure Monitor</text>
    <text x="0" y="50" font-size="10" fill="#64748b" text-anchor="middle">Log Analytics Workspace</text>
  </g>


  <!-- ================= CONNECTING ARROWS (EXACT STYLE) ================= -->

  <!-- 1. Client apps -> Ingress (Solid black arrow) -->
  <line x1="180" y1="215" x2="445" y2="215" stroke="#1e293b" stroke-width="1.6" marker-end="url(#ms-arrow)"/>
  <rect x="255" y="202" width="130" height="18" fill="#ffffff"/>
  <text x="320" y="215" font-size="10.5" font-weight="600" fill="#1e293b" text-anchor="middle">HTTPS :443 (TLS)</text>

  <!-- 2. Ingress -> blog (Solid black arrow) -->
  <line x1="520" y1="215" x2="660" y2="215" stroke="#1e293b" stroke-width="1.6" marker-end="url(#ms-arrow)"/>
  <rect x="548" y="202" width="85" height="18" fill="#ffffff"/>
  <text x="590" y="215" font-size="10" font-weight="600" fill="#1e293b" text-anchor="middle">HTTP :3000</text>

  <!-- 3. blog <===> Azure Files (Solid black arrow) -->
  <line x1="735" y1="215" x2="930" y2="215" stroke="#1e293b" stroke-width="1.8" marker-end="url(#ms-arrow)" marker-start="url(#ms-arrow-start)"/>
  <rect x="765" y="202" width="140" height="18" fill="#ffffff"/>
  <text x="835" y="215" font-size="10.5" font-weight="600" fill="#1e293b" text-anchor="middle">SMB 3.0 Mount (/app/data)</text>

  <!-- 4. Dev/Ops -> GitHub Actions (Push) -->
  <line x1="127" y1="535" x2="127" y2="505" stroke="#1e293b" stroke-width="1.4" marker-end="url(#ms-arrow)"/>
  <text x="135" y="524" font-size="9" font-weight="600" fill="#1e293b">git push</text>

  <!-- 5. GitHub Actions -> Entra ID (Auth line) -->
  <path d="M 200 440 L 370 440 L 370 560 L 525 560" fill="none" stroke="#1e293b" stroke-width="1.3" marker-end="url(#ms-arrow)"/>
  <rect x="230" y="430" width="125" height="16" fill="#ffffff"/>
  <text x="292" y="442" font-size="9.5" fill="#475569" text-anchor="middle">AZURE_CREDENTIALS</text>

  <!-- 6. Entra ID -> Resource Group (Role Assignment) -->
  <path d="M 560 525 L 560 480 L 590 480 L 590 455" fill="none" stroke="#1e293b" stroke-width="1.3" marker-end="url(#ms-arrow)"/>
  <rect x="470" y="490" width="150" height="16" fill="#ffffff"/>
  <text x="545" y="502" font-size="9.5" font-weight="600" fill="#1e293b" text-anchor="middle">Role-based access control</text>

  <!-- 7. GitHub Actions -> Container App (Deploy Revision dashed line) -->
  <path d="M 200 410 L 330 410 L 330 270 L 660 270" fill="none" stroke="#1e293b" stroke-width="1.3" stroke-dasharray="5,4" marker-end="url(#ms-arrow)"/>
  <rect x="235" y="300" width="115" height="16" fill="#ffffff"/>
  <text x="292" y="312" font-size="9.5" font-weight="600" fill="#1e293b" text-anchor="middle">Deploy Container Rev</text>


  <!-- ================= BOTTOM-LEFT: OFFICIAL MICROSOFT AZURE LOGO ================= -->
  <g transform="translate(45, 630)">
    <!-- Microsoft 4-square logo -->
    <rect x="0" y="0" width="11" height="11" fill="#f25022"/>
    <rect x="13" y="0" width="11" height="11" fill="#7fba00"/>
    <rect x="0" y="13" width="11" height="11" fill="#00a4ef"/>
    <rect x="13" y="13" width="11" height="11" fill="#ffb900"/>
    
    <!-- Text -->
    <text x="32" y="12" font-size="14" font-weight="700" fill="#1e293b">Microsoft</text>
    <text x="32" y="25" font-size="14" font-weight="400" fill="#475569">Azure</text>
  </g>

</svg>
"""

# Save SVG
svg_file = os.path.join(out_dir, "azure-blog-architecture.svg")
with open(svg_file, "w", encoding="utf-8") as f:
    f.write(svg_content)

# Render to PNG
html_wrapper = f"""<!DOCTYPE html>
<html>
<body style="margin:0; padding:20px; background:#ffffff; display:flex; justify-content:center;">
{svg_content}
</body>
</html>
"""

temp_html = os.path.join(out_dir, "temp_azure_arch.html")
with open(temp_html, "w", encoding="utf-8") as f:
    f.write(html_wrapper)

png_file = os.path.join(out_dir, "azure-blog-architecture.png")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1140, "height": 720}, device_scale_factor=2)
    page.goto("file:///" + temp_html.replace(os.sep, "/"))
    page.screenshot(path=png_file, full_page=True)
    browser.close()

# Copy to conversation artifact dir
art_dir = r"C:\Users\Humberto\.gemini\antigravity\brain\4de0e761-de9f-480a-a0cf-c5c824d9c155"
shutil.copy2(png_file, os.path.join(art_dir, "azure-blog-architecture.png"))

if os.path.exists(temp_html):
    os.remove(temp_html)

print("Exact Microsoft Azure Architecture Center diagram generated successfully!")
print("PNG File size:", os.path.getsize(png_file), "bytes")
