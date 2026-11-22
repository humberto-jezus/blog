# Humberto Jezus — Technical Blog

Blog técnico e profissional sobre Engenharia de Software, Arquitetura em Nuvem, Microsoft Azure e Inteligência Artificial.

🌐 **Acesse online:** [https://www.humbertojezus-techblog.com](https://www.humbertojezus-techblog.com)

---

## 🚀 Tecnologias

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend / API:** Node.js 22 LTS, Express
- **Cloud & Infraestrutura:** Microsoft Azure Container Apps (ACA — Serverless), Azure DNS, Azure Key Vault
- **CI/CD:** GitHub Actions com autenticação federada OIDC (Zero-Trust sem senhas)

---

## 💻 Desenvolvimento Local

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:3000`

---

## 🔒 Segurança & Arquitetura

- **Deploy Zero-Trust:** Sem credenciais fixas no repositório via Microsoft Entra ID OIDC.
- **SSL Gerenciado:** Certificado TLS/HTTPS automático emitido e renovado pela Microsoft.
- **Hardening:** Container executado com usuário não-root (`USER node`).
