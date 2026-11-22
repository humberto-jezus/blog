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
icon_storage = get_b64("StorageAccounts.svg")
icon_rg = get_b64("ResourceGroup.svg")
icon_sub = get_b64("Subscription.svg")
icon_identity = get_b64("ManagedIdentityUserAssignedIdentities.svg")

# Clean Draw.io / Visio style SVG diagram
svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="1200" height="700" style="background:#ffffff; font-family: Segoe UI, Arial, sans-serif;">
  <defs>
    <!-- Arrowhead markers -->
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000"/>
    </marker>
    <marker id="arrow-both" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000"/>
    </marker>
    <marker id="arrow-both-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 10 1 L 0 5 L 10 9 z" fill="#000000"/>
    </marker>
  </defs>

  <!-- ================= 1. BOUNDING BOXES (DRAW.IO STYLE) ================= -->

  <!-- Outer Box: Azure AD Tenant (Microsoft Entra ID) -->
  <rect x="30" y="25" width="1140" height="650" fill="none" stroke="#000000" stroke-width="1.5"/>
  <text x="45" y="48" font-size="14" font-weight="600" fill="#000000">Azure AD Tenant (Microsoft Entra ID)</text>

  <!-- Subscription Box -->
  <rect x="420" y="70" width="730" height="585" fill="none" stroke="#000000" stroke-width="1.5"/>
  <text x="435" y="93" font-size="13.5" font-weight="600" fill="#000000">Subscription: MSDN Platforms (East US 2)</text>

  <!-- Resource Group Box -->
  <rect x="450" y="125" width="670" height="505" fill="none" stroke="#000000" stroke-width="1.5"/>
  <text x="465" y="148" font-size="13" font-weight="600" fill="#000000">Resource Group: rg-blog-humberto-prod-eus2</text>

  <!-- CAE Box -->
  <rect x="480" y="185" width="300" height="420" rx="6" fill="none" stroke="#000000" stroke-width="1.2"/>
  <text x="495" y="210" font-size="12.5" font-weight="600" fill="#000000">cae-blog-prod-eus2 (Consumption)</text>

  <!-- Storage Account Box -->
  <rect x="850" y="185" width="240" height="420" rx="6" fill="none" stroke="#000000" stroke-width="1.2"/>
  <text x="865" y="210" font-size="12.5" font-weight="600" fill="#000000">Storage Account: sttechblog</text>


  <!-- ================= 2. ICONS & LABELS ================= -->

  <!-- Service Principal (in Entra ID) -->
  <g transform="translate(180, 100)">
    <image href="{icon_identity}" x="-24" y="-24" width="48" height="48"/>
    <text x="0" y="40" font-size="12.5" font-weight="600" fill="#000000" text-anchor="middle">Service Principal</text>
    <text x="0" y="56" font-size="11" fill="#444444" text-anchor="middle">(GitHub Actions Deployer)</text>
  </g>

  <!-- Web Users (Outside Azure) -->
  <g transform="translate(180, 290)">
    <circle cx="0" cy="0" r="22" fill="#f1f5f9" stroke="#000000" stroke-width="1.2"/>
    <path d="M-8 8 C-8 0, 8 0, 8 8 M0 -3 A5 5 0 1 0 0 -13 A5 5 0 1 0 0 -3" stroke="#000000" stroke-width="1.5" fill="none"/>
    <text x="0" y="38" font-size="12.5" font-weight="600" fill="#000000" text-anchor="middle">Web Clients</text>
    <text x="0" y="54" font-size="10.5" fill="#555555" text-anchor="middle">humbertojezus-techblog.com</text>
  </g>

  <!-- GitHub Actions (Outside Azure) -->
  <g transform="translate(180, 480)">
    <!-- GitHub Octocat logo path -->
    <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#000000" stroke-width="1.2"/>
    <path d="M0 -15 C-8.3 -15 -15 -8.3 -15 0 C-15 6.6 -10.7 12.2 -4.8 14.2 C-4 14.3 -3.7 13.9 -3.7 13.5 L-3.7 10.8 C-7.5 11.5 -8.5 9.7 -8.8 8.9 C-9 8.5 -9.7 7.2 -10.3 6.8 C-10.8 6.5 -11.6 5.8 -10.3 5.8 C-9.1 5.8 -8.3 6.9 -8 7.4 C-6.6 9.7 -4.4 9.1 -3.5 8.7 C-3.4 7.7 -3 7 -2.5 6.6 C-5.8 6.2 -9.3 5 -9.3 -0.8 C-9.3 -2.4 -8.7 -3.8 -7.8 -4.8 C-8 -5.2 -8.5 -6.7 -7.6 -8.8 C-7.6 -8.8 -6.3 -9.2 -3.4 -7.3 C-2.2 -7.6 -0.9 -7.8 0.4 -7.8 C1.7 -7.8 3 -7.6 4.2 -7.3 C7.1 -9.2 8.4 -8.8 8.4 -8.8 C9.3 -6.7 8.8 -5.2 8.6 -4.8 C9.5 -3.8 10.1 -2.4 10.1 -0.8 C10.1 5 -6.6 6.2 3.3 6.6 C3.8 7 4.3 7.9 4.3 9.3 L4.3 13.5 C4.3 13.9 4.6 14.3 5.4 14.2 C11.3 12.2 15.6 6.6 15.6 0 C15.6 -8.3 8.9 -15 0 -15 Z" fill="#000000"/>
    <text x="0" y="38" font-size="12.5" font-weight="600" fill="#000000" text-anchor="middle">GitHub Actions</text>
    <text x="0" y="54" font-size="10.5" fill="#555555" text-anchor="middle">Repo: humberto-jezus/blog</text>
  </g>

  <!-- Container App 'blog' (Inside CAE) -->
  <g transform="translate(630, 360)">
    <image href="{icon_aca}" x="-30" y="-30" width="60" height="60"/>
    <text x="0" y="48" font-size="13.5" font-weight="700" fill="#000000" text-anchor="middle">blog</text>
    <text x="0" y="66" font-size="11.5" font-weight="600" fill="#333333" text-anchor="middle">Container App (Node.js 22)</text>
    <text x="0" y="82" font-size="10.5" fill="#666666" text-anchor="middle">Non-Root User (node:node)</text>
    <text x="0" y="98" font-size="10.5" fill="#666666" text-anchor="middle">Port 3000 | Managed TLS 443</text>
  </g>

  <!-- Azure File Share 'blogdata' (Inside Storage Account) -->
  <g transform="translate(970, 360)">
    <image href="{icon_storage}" x="-30" y="-30" width="60" height="60"/>
    <text x="0" y="48" font-size="13.5" font-weight="700" fill="#000000" text-anchor="middle">blogdata</text>
    <text x="0" y="66" font-size="11.5" font-weight="600" fill="#333333" text-anchor="middle">Azure File Share</text>
    <text x="0" y="82" font-size="10.5" fill="#666666" text-anchor="middle">Protocol: SMB 3.0</text>
    <text x="0" y="98" font-size="10.5" fill="#666666" text-anchor="middle">Persiste: blog-db.json</text>
  </g>


  <!-- ================= 3. CONNECTING LINES & ARROWS (DRAW.IO STYLE) ================= -->

  <!-- Line 1: Web Clients -> Container App (HTTPS) -->
  <path d="M 230 290 L 590 290 L 590 330" fill="none" stroke="#000000" stroke-width="1.4" marker-end="url(#arrow)"/>
  <rect x="270" y="278" width="165" height="18" fill="#ffffff"/>
  <text x="352" y="291" font-size="11" font-weight="600" fill="#000000" text-anchor="middle">HTTPS :443 (Managed TLS)</text>

  <!-- Line 2: Container App <===> Azure File Share (SMB Mount) -->
  <line x1="680" y1="360" x2="925" y2="360" stroke="#000000" stroke-width="1.6" marker-end="url(#arrow-both)" marker-start="url(#arrow-both-start)"/>
  <rect x="725" y="348" width="160" height="20" fill="#ffffff"/>
  <text x="805" y="362" font-size="11" font-weight="600" fill="#000000" text-anchor="middle">SMB 3.0 Mount (/app/data)</text>

  <!-- Line 3: GitHub Actions -> Container App (CI/CD Deploy Revision) -->
  <path d="M 230 480 L 590 480 L 590 390" fill="none" stroke="#000000" stroke-width="1.4" marker-end="url(#arrow)"/>
  <rect x="290" y="470" width="165" height="18" fill="#ffffff"/>
  <text x="372" y="483" font-size="11" font-weight="600" fill="#000000" text-anchor="middle">Deploy Container Revision</text>

  <!-- Line 4: GitHub Actions -> Service Principal (Auth) -->
  <path d="M 180 440 L 180 180" fill="none" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <rect x="110" y="225" width="140" height="18" fill="#ffffff"/>
  <text x="180" y="238" font-size="10.5" fill="#444444" text-anchor="middle">AZURE_CREDENTIALS</text>

  <!-- Line 5: Service Principal -> Resource Group (RBAC Assignment) -->
  <path d="M 240 120 L 440 120 L 440 145" fill="none" stroke="#000000" stroke-width="1.4" marker-end="url(#arrow)"/>
  <rect x="260" y="110" width="155" height="18" fill="#ffffff"/>
  <text x="337" y="123" font-size="10.5" font-weight="600" fill="#000000" text-anchor="middle">Role Assignment "Contributor"</text>

</svg>
"""

# Save clean SVG
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

temp_html = os.path.join(out_dir, "temp_drawio.html")
with open(temp_html, "w", encoding="utf-8") as f:
    f.write(html_wrapper)

png_file = os.path.join(out_dir, "azure-blog-architecture.png")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1240, "height": 740}, device_scale_factor=2)
    page.goto("file:///" + temp_html.replace(os.sep, "/"))
    page.screenshot(path=png_file, full_page=True)
    browser.close()

# Copy to conversation artifact dir
art_dir = r"C:\Users\Humberto\.gemini\antigravity\brain\4de0e761-de9f-480a-a0cf-c5c824d9c155"
shutil.copy2(png_file, os.path.join(art_dir, "azure-blog-architecture.png"))

if os.path.exists(temp_html):
    os.remove(temp_html)

print("Exact Draw.io style diagram generated successfully!")
print("PNG File size:", os.path.getsize(png_file), "bytes")
