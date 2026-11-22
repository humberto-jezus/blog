import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanEnv = (val?: string): string => {
  if (!val) return '';
  const stripped = val.trim().replace(/^["']|["']$/g, '').trim();
  if (!stripped || /^MY_[A-Z0-9_]+$/.test(stripped)) return '';
  return stripped;
};

const PORT = Number(process.env.PORT) || 3000;
const envEmail = cleanEnv(process.env.BLOG_ADMIN_EMAIL);
const ADMIN_EMAIL = (envEmail.includes('@') ? envEmail : 'humbertojezus@gmail.com').toLowerCase();
const ADMIN_PASSWORD = cleanEnv(process.env.BLOG_ADMIN_PASSWORD);
const SESSION_SECRET =
  cleanEnv(process.env.BLOG_SESSION_SECRET) ||
  crypto.createHash('sha256').update(`${ADMIN_EMAIL}:${process.env.GEMINI_API_KEY || 'local-dev-salt'}`).digest('hex');

const DATA_DIR =
  cleanEnv(process.env.BLOG_DATA_DIR) ||
  [path.resolve(process.cwd(), 'data'), path.resolve(__dirname, '../data'), path.resolve(__dirname, 'data')].find((p) =>
    fs.existsSync(p)
  ) ||
  path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'blog-db.json');
const AZURE_STORAGE_ACCOUNT_URL = cleanEnv(process.env.AZURE_STORAGE_ACCOUNT_URL);
const AZURE_STORAGE_CONTAINER = cleanEnv(process.env.AZURE_STORAGE_CONTAINER) || 'blog-data';
const AZURE_STORAGE_BLOB_NAME = 'blog-db.json';

interface StoredPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  date: string;
  readTime: string;
  author: string;
  authorUid: string;
  authorPhotoUrl?: string;
  language: 'pt' | 'en';
  createdAt: string;
  updatedAt: string;
}

interface StoredPage {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  showInNav?: boolean;
  isSystem?: boolean;
  homeConfig?: Record<string, unknown>;
  aboutConfig?: Record<string, unknown>;
  sections?: unknown[];
  updatedAt: string;
}

interface BlogDatabase {
  posts: StoredPost[];
  pages: Record<string, StoredPage>;
}

const DEFAULT_DB: BlogDatabase = {
  posts: [
    {
      id: '1',
      title: 'Modernizando Infraestrutura com Azure Bicep',
      excerpt: 'Saiba como usar o Azure Bicep para definir e implantar sua infraestrutura de nuvem como código com facilidade e precisão.',
      content: '<p>O Azure Bicep é uma linguagem específica de domínio (DSL) para implantar recursos do Azure de forma declarativa. Ele visa simplificar a experiência de criação, fornecendo uma sintaxe mais limpa, melhor modularidade e gerenciamento automático de dependências.</p><h2>Por que adotar Bicep?</h2><ul><li><strong>Sintaxe limpa e concisa</strong> em comparação aos templates ARM em JSON.</li><li><strong>Modularidade nativa</strong> para reutilizar padrões corporativos de segurança e rede.</li><li><strong>Validação imediata</strong> com suporte completo no VS Code e pipelines Azure DevOps / GitHub Actions.</li></ul>',
      category: 'DevOps',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
      date: '2024-03-15',
      readTime: '8 min de leitura',
      author: 'Humberto Jezus',
      authorUid: 'admin-humberto',
      language: 'pt',
      createdAt: '2024-03-15T10:00:00.000Z',
      updatedAt: '2024-03-15T10:00:00.000Z',
    },
    {
      id: '2',
      title: 'Azure AI Services: Um Mergulho Profundo',
      excerpt: 'Explore os últimos avanços nos Serviços de IA do Azure e como eles podem transformar seus aplicativos com recursos inteligentes.',
      content: '<p>O Microsoft Azure oferece um conjunto abrangente de serviços de IA que permitem aos desenvolvedores criar aplicativos inteligentes com segurança corporativa, governança de dados e alta escalabilidade.</p><h2>Principais cenários corporativos</h2><ul><li><strong>Visão e Document Intelligence</strong> para automação de documentos e faturas.</li><li><strong>Azure OpenAI e AI Foundry</strong> integrados com Private Endpoints e Entra ID.</li><li><strong>Observabilidade e FinOps</strong> para controlar consumo e latência em produção.</li></ul>',
      category: 'AI & Machine Learning',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
      date: '2024-03-10',
      readTime: '12 min de leitura',
      author: 'Humberto Jezus',
      authorUid: 'admin-humberto',
      language: 'pt',
      createdAt: '2024-03-10T10:00:00.000Z',
      updatedAt: '2024-03-10T10:00:00.000Z',
    },
  ],
  pages: {
    home: {
      id: 'home',
      title: 'Humberto Jezus',
      content: '<p>Arquiteto de Soluções Cloud. Compartilhando experiências reais, tutoriais práticos e a jornada no Microsoft Azure.</p>',
      isSystem: true,
      updatedAt: '2024-03-15T10:00:00.000Z',
    },
    about: {
      id: 'about',
      title: 'Sobre Mim',
      content: '<p>Este blog é dedicado a compartilhar conhecimento sobre Microsoft Azure, ajudando profissionais a navegarem no complexo mundo da computação em nuvem.</p>',
      isSystem: true,
      updatedAt: '2024-03-15T10:00:00.000Z',
    },
  },
};

let azureBlobClient: BlockBlobClient | null = null;
let storageMode: 'azure-blob-mi' | 'local-disk' = 'local-disk';
let dbReady = false;
let saveQueue: Promise<void> = Promise.resolve();

function getAzureBlobClient(): BlockBlobClient | null {
  if (!AZURE_STORAGE_ACCOUNT_URL) return null;
  if (!azureBlobClient) {
    // Zero-Trust: uses User-Assigned or System-Assigned Managed Identity (AZURE_CLIENT_ID) — no Storage Account Keys
    const credential = new DefaultAzureCredential();
    const serviceClient = new BlobServiceClient(AZURE_STORAGE_ACCOUNT_URL, credential);
    const containerClient = serviceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    azureBlobClient = containerClient.getBlockBlobClient(AZURE_STORAGE_BLOB_NAME);
  }
  return azureBlobClient;
}

function ensureLocalDb(): BlogDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
      return structuredClone(DEFAULT_DB);
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<BlogDatabase>;
    return {
      posts: Array.isArray(parsed.posts) ? parsed.posts : structuredClone(DEFAULT_DB.posts),
      pages: parsed.pages && typeof parsed.pages === 'object' ? parsed.pages : structuredClone(DEFAULT_DB.pages),
    };
  } catch (err) {
    console.error('Error loading local blog database, falling back to defaults:', err);
    return structuredClone(DEFAULT_DB);
  }
}

async function initDb(): Promise<BlogDatabase> {
  const blobClient = getAzureBlobClient();
  if (blobClient) {
    storageMode = 'azure-blob-mi';
    try {
      const exists = await blobClient.exists();
      if (!exists) {
        const seedJson = JSON.stringify(DEFAULT_DB, null, 2);
        await blobClient.upload(seedJson, Buffer.byteLength(seedJson, 'utf8'), {
          blobHTTPHeaders: { blobContentType: 'application/json; charset=utf-8' },
        });
        console.log(`Initialized Azure Blob Storage (${AZURE_STORAGE_CONTAINER}/${AZURE_STORAGE_BLOB_NAME}) via Managed Identity.`);
        dbReady = true;
        return structuredClone(DEFAULT_DB);
      }
      const download = await blobClient.downloadToBuffer();
      const parsed = JSON.parse(download.toString('utf8')) as Partial<BlogDatabase>;
      console.log(`Loaded blog database from Azure Blob Storage (${AZURE_STORAGE_CONTAINER}/${AZURE_STORAGE_BLOB_NAME}) via Managed Identity.`);
      dbReady = true;
      return {
        posts: Array.isArray(parsed.posts) ? parsed.posts : structuredClone(DEFAULT_DB.posts),
        pages: parsed.pages && typeof parsed.pages === 'object' ? parsed.pages : structuredClone(DEFAULT_DB.pages),
      };
    } catch (err) {
      console.error('Failed to initialize Azure Blob Storage via Managed Identity:', err);
      throw err;
    }
  }

  storageMode = 'local-disk';
  const loaded = ensureLocalDb();
  dbReady = true;
  return loaded;
}

function saveDb(db: BlogDatabase): void {
  const payload = JSON.stringify(db, null, 2);
  const blobClient = getAzureBlobClient();
  if (blobClient) {
    saveQueue = saveQueue
      .then(async () => {
        await blobClient.upload(payload, Buffer.byteLength(payload, 'utf8'), {
          blobHTTPHeaders: { blobContentType: 'application/json; charset=utf-8' },
        });
      })
      .catch((err) => {
        console.error('Error saving blog database to Azure Blob Storage:', err);
      });
    return;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, payload, 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

let blogDb: BlogDatabase = structuredClone(DEFAULT_DB);

interface SessionPayload {
  uid: string;
  email: string;
  displayName: string;
  exp: number;
}

function signSession(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySession(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

interface AuthenticatedRequest extends Request {
  adminUser?: SessionPayload;
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  const payload = verifySession(token);
  if (!payload) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }
  req.adminUser = payload;
  return next();
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 15) {
    return false;
  }
  entry.count += 1;
  return true;
}

async function startServer() {
  blogDb = await initDb();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Hardened HTTP Security Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  app.use(express.json({ limit: '25mb' }));

  // ==================== HEALTH PROBES (ACA Liveness / Readiness) ====================
  app.get('/healthz', (_req, res) => {
    return res.status(200).json({ status: 'ok' });
  });

  app.get('/readyz', (_req, res) => {
    if (!dbReady) {
      return res.status(503).json({ status: 'initializing' });
    }
    return res.status(200).json({ status: 'ready', storage: storageMode });
  });

  // ==================== AUTH ROUTES ====================
  app.post('/api/auth/login', (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkLoginRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
      });
    }

    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail.length > 200 || password.length > 200) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    if (normalizedEmail !== ADMIN_EMAIL) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    if (ADMIN_PASSWORD && !timingSafeStringEqual(password, ADMIN_PASSWORD)) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    loginAttempts.delete(clientIp);

    const payload: SessionPayload = {
      uid: 'admin-humberto',
      email: ADMIN_EMAIL,
      displayName: 'Humberto Jezus',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    const token = signSession(payload);
    return res.json({
      token,
      user: {
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName,
        emailVerified: true,
      },
    });
  });

  app.get('/api/auth/session', requireAdmin, (req: AuthenticatedRequest, res) => {
    const payload = req.adminUser!;
    return res.json({
      user: {
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName,
        emailVerified: true,
      },
    });
  });

  // ==================== POSTS API ====================
  app.get('/api/posts', (req, res) => {
    const lang = req.query.language;
    let list = [...blogDb.posts];
    if (lang === 'pt' || lang === 'en') {
      list = list.filter((p) => p.language === lang);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(list);
  });

  app.get('/api/posts/:id', (req, res) => {
    const post = blogDb.posts.find((p) => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }
    return res.json(post);
  });

  app.post('/api/posts', requireAdmin, (req: AuthenticatedRequest, res) => {
    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const readTime = typeof body.readTime === 'string' ? body.readTime.trim() : '';
    const author = typeof body.author === 'string' ? body.author.trim() : '';
    const authorPhotoUrl = typeof body.authorPhotoUrl === 'string' ? body.authorPhotoUrl.trim() : '';
    const language = body.language === 'en' ? 'en' : 'pt';

    if (!title || !excerpt || !content || !category || !imageUrl || !date || !readTime || !author) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do artigo.' });
    }

    if (!/^https?:\/\//i.test(imageUrl) && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(imageUrl)) {
      return res.status(400).json({ error: 'Envie uma imagem válida ou informe uma URL http(s)://.' });
    }

    if (
      authorPhotoUrl &&
      !/^https?:\/\//i.test(authorPhotoUrl) &&
      !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(authorPhotoUrl)
    ) {
      return res.status(400).json({ error: 'A foto do autor deve ser uma imagem válida ou URL http(s)://.' });
    }

    const now = new Date().toISOString();
    const newPost: StoredPost = {
      id: crypto.randomUUID(),
      title: title.slice(0, 200),
      excerpt: excerpt.slice(0, 500),
      content: content.slice(0, 10000000),
      category: category.slice(0, 60),
      imageUrl: imageUrl.slice(0, 3000000),
      date: date.slice(0, 50),
      readTime: readTime.slice(0, 50),
      author: author.slice(0, 100),
      authorUid: req.adminUser!.uid,
      authorPhotoUrl: authorPhotoUrl ? authorPhotoUrl.slice(0, 1500000) : '',
      language,
      createdAt: now,
      updatedAt: now,
    };

    blogDb.posts.unshift(newPost);
    saveDb(blogDb);
    return res.status(201).json(newPost);
  });

  app.put('/api/posts/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const idx = blogDb.posts.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }

    const body = req.body ?? {};
    const existing = blogDb.posts[idx];

    const title = typeof body.title === 'string' ? body.title.trim() : existing.title;
    const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : existing.excerpt;
    const content = typeof body.content === 'string' ? body.content.trim() : existing.content;
    const category = typeof body.category === 'string' ? body.category.trim() : existing.category;
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : existing.imageUrl;
    const date = typeof body.date === 'string' ? body.date.trim() : existing.date;
    const readTime = typeof body.readTime === 'string' ? body.readTime.trim() : existing.readTime;
    const author = typeof body.author === 'string' ? body.author.trim() : existing.author;
    const authorPhotoUrl =
      typeof body.authorPhotoUrl === 'string' ? body.authorPhotoUrl.trim() : existing.authorPhotoUrl || '';
    const language = body.language === 'en' || body.language === 'pt' ? body.language : existing.language;

    if (!title || !excerpt || !content || !category || !imageUrl || !date || !readTime || !author) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do artigo.' });
    }

    if (!/^https?:\/\//i.test(imageUrl) && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(imageUrl)) {
      return res.status(400).json({ error: 'Envie uma imagem válida ou informe uma URL http(s)://.' });
    }

    const updated: StoredPost = {
      ...existing,
      title: title.slice(0, 200),
      excerpt: excerpt.slice(0, 500),
      content: content.slice(0, 10000000),
      category: category.slice(0, 60),
      imageUrl: imageUrl.slice(0, 3000000),
      date: date.slice(0, 50),
      readTime: readTime.slice(0, 50),
      author: author.slice(0, 100),
      authorPhotoUrl: authorPhotoUrl.slice(0, 1500000),
      language,
      updatedAt: new Date().toISOString(),
    };

    blogDb.posts[idx] = updated;
    saveDb(blogDb);
    return res.json(updated);
  });

  app.delete('/api/posts/:id', requireAdmin, (req, res) => {
    const idx = blogDb.posts.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }
    blogDb.posts.splice(idx, 1);
    saveDb(blogDb);
    return res.json({ deleted: true });
  });

  // ==================== PAGES API ====================
  app.get('/api/pages', (_req, res) => {
    const pages = Object.values(blogDb.pages).map((p) => ({
      ...p,
      isSystem: p.id === 'home' || p.id === 'about',
    }));
    return res.json(pages);
  });

  app.get('/api/pages/:id', (req, res) => {
    const page = blogDb.pages[req.params.id];
    if (!page) {
      return res.status(404).json({ error: 'Página não encontrada.' });
    }
    return res.json({
      ...page,
      isSystem: page.id === 'home' || page.id === 'about',
    });
  });

  app.post('/api/pages', requireAdmin, (req, res) => {
    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const rawId = typeof body.id === 'string' ? body.id.trim().toLowerCase() : '';
    const slug = rawId
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);

    if (!title) {
      return res.status(400).json({ error: 'O título da página é obrigatório.' });
    }
    if (!slug) {
      return res.status(400).json({ error: 'Informe um endereço (slug) válido para a página.' });
    }
    if (blogDb.pages[slug]) {
      return res.status(409).json({ error: 'Já existe uma página com este endereço (slug).' });
    }

    const subtitle = typeof body.subtitle === 'string' ? body.subtitle.trim().slice(0, 400) : '';
    const content = typeof body.content === 'string' ? body.content : '';
    const showInNav = Boolean(body.showInNav);
    const sections = Array.isArray(body.sections) ? body.sections.slice(0, 30) : [];

    const created: StoredPage = {
      id: slug,
      title: title.slice(0, 200),
      subtitle,
      content: content.slice(0, 10000000),
      showInNav,
      isSystem: false,
      sections,
      updatedAt: new Date().toISOString(),
    };

    blogDb.pages[slug] = created;
    saveDb(blogDb);
    return res.status(201).json(created);
  });

  app.put('/api/pages/:id', requireAdmin, (req, res) => {
    const pageId = req.params.id;
    if (!/^[a-z0-9_-]{1,50}$/i.test(pageId)) {
      return res.status(400).json({ error: 'ID de página inválido.' });
    }

    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const subtitle =
      typeof body.subtitle === 'string' ? body.subtitle.trim().slice(0, 400) : undefined;
    const content = typeof body.content === 'string' ? body.content : '';

    if (!title) {
      return res.status(400).json({ error: 'O título da página é obrigatório.' });
    }

    const existing = blogDb.pages[pageId];
    const isSystem = pageId === 'home' || pageId === 'about';
    const showInNav = typeof body.showInNav === 'boolean' ? body.showInNav : existing?.showInNav ?? false;

    const homeConfig =
      pageId === 'home' && body.homeConfig && typeof body.homeConfig === 'object'
        ? body.homeConfig
        : existing?.homeConfig;

    const aboutConfig =
      pageId === 'about' && body.aboutConfig && typeof body.aboutConfig === 'object'
        ? body.aboutConfig
        : existing?.aboutConfig;

    const sections = Array.isArray(body.sections)
      ? body.sections.slice(0, 30)
      : existing?.sections;

    const updated: StoredPage = {
      id: pageId,
      title: title.slice(0, 200),
      subtitle: subtitle !== undefined ? subtitle : existing?.subtitle ?? '',
      content: content.slice(0, 10000000),
      showInNav: isSystem ? false : showInNav,
      isSystem,
      ...(homeConfig ? { homeConfig } : {}),
      ...(aboutConfig ? { aboutConfig } : {}),
      ...(sections ? { sections } : {}),
      updatedAt: new Date().toISOString(),
    };

    blogDb.pages[pageId] = updated;
    saveDb(blogDb);
    return res.json(updated);
  });

  app.delete('/api/pages/:id', requireAdmin, (req, res) => {
    const pageId = req.params.id;
    if (pageId === 'home' || pageId === 'about') {
      return res.status(400).json({ error: 'As páginas padrão (Início e Sobre Mim) não podem ser excluídas.' });
    }
    if (!blogDb.pages[pageId]) {
      return res.status(404).json({ error: 'Página não encontrada.' });
    }
    delete blogDb.pages[pageId];
    saveDb(blogDb);
    return res.json({ deleted: true });
  });

  // ==================== TRANSLATE API ====================
  async function translatePlainTextFree(text: string, targetLang: 'pt' | 'en'): Promise<string> {
    if (!text.trim()) return text;
    const tl = targetLang === 'pt' ? 'pt' : 'en';
    const sl = targetLang === 'pt' ? 'en' : 'pt';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Free translator responded with ${response.status}`);
    }
    const data = (await response.json()) as any[];
    if (!Array.isArray(data?.[0])) return text;
    return data[0].map((segment: any) => (Array.isArray(segment) ? segment[0] : '')).join('');
  }

  async function translateHtmlPreservingStructure(html: string, targetLang: 'pt' | 'en'): Promise<string> {
    // Protect <pre>...</pre>, <code>...</code>, and all HTML tags while translating visible text nodes
    const tokens: { isTag: boolean; value: string }[] = [];
    const regex = /(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<[^>]+>)/gi;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      if (match.index > lastIdx) {
        tokens.push({ isTag: false, value: html.slice(lastIdx, match.index) });
      }
      tokens.push({ isTag: true, value: match[0] });
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < html.length) {
      tokens.push({ isTag: false, value: html.slice(lastIdx) });
    }

    const translatedParts = await Promise.all(
      tokens.map(async (tok) => {
        if (tok.isTag || !tok.value.trim()) return tok.value;
        const leadingSpace = tok.value.match(/^\s*/)?.[0] || '';
        const trailingSpace = tok.value.match(/\s*$/)?.[0] || '';
        const core = tok.value.trim();
        try {
          const translated = await translatePlainTextFree(core, targetLang);
          return `${leadingSpace}${translated}${trailingSpace}`;
        } catch {
          return tok.value;
        }
      })
    );

    return translatedParts.join('');
  }

  async function translateWithAzure(
    fields: { title: string; excerpt: string; content: string; category: string; readTime: string; date: string },
    targetLang: 'pt' | 'en',
    key: string,
    region: string
  ) {
    const to = targetLang === 'pt' ? 'pt-br' : 'en';
    const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${to}&textType=html`;
    const headers: Record<string, string> = {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/json',
    };
    if (region) {
      headers['Ocp-Apim-Subscription-Region'] = region;
    }

    // Wrap <pre> blocks in notranslate so scripts stay untouched
    const safeContent = fields.content.replace(/<pre(\s|>)/gi, '<pre class="notranslate"$1');
    const body = [
      { Text: fields.title },
      { Text: fields.excerpt },
      { Text: safeContent },
      { Text: fields.category },
      { Text: fields.readTime },
      { Text: fields.date },
    ];

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Azure Translator HTTP ${res.status}`);
    }
    const data = (await res.json()) as any[];
    const get = (i: number, fallback: string) => data?.[i]?.translations?.[0]?.text ?? fallback;
    return {
      title: get(0, fields.title),
      excerpt: get(1, fields.excerpt),
      content: get(2, fields.content).replace(/<pre class="notranslate"/gi, '<pre'),
      category: get(3, fields.category),
      readTime: get(4, fields.readTime),
      date: get(5, fields.date),
    };
  }

  app.post('/api/translate', async (req, res) => {
    try {
      const {
        title,
        excerpt,
        content,
        category,
        readTime,
        date,
        targetLanguage,
      } = req.body ?? {};

      if (targetLanguage !== 'pt' && targetLanguage !== 'en') {
        return res.status(400).json({ error: 'Invalid targetLanguage. Expected "pt" or "en".' });
      }

      if (typeof title !== 'string' || typeof content !== 'string' || !title.trim() || !content.trim()) {
        return res.status(400).json({ error: 'Article title and content are required.' });
      }

      if (title.length > 500 || content.length > 10000000) {
        return res.status(400).json({ error: 'Article payload exceeds maximum allowed size.' });
      }

      // Replace inline <img> tags (especially base64 uploads) with lightweight placeholders before translating
      const savedImages: string[] = [];
      const contentWithoutImgs = content.replace(/<img\b[^>]*>/gi, (tag) => {
        const idx = savedImages.length;
        savedImages.push(tag);
        return `[[IMG_PLACEHOLDER_${idx}]]`;
      });

      const restoreImages = (html: string) =>
        html.replace(/\[\[IMG_PLACEHOLDER_(\d+)\]\]/g, (_m, i) => savedImages[Number(i)] || '');

      const fields = {
        title,
        excerpt: typeof excerpt === 'string' ? excerpt : '',
        content: contentWithoutImgs,
        category: typeof category === 'string' ? category : '',
        readTime: typeof readTime === 'string' ? readTime : '',
        date: typeof date === 'string' ? date : '',
      };

      const azureTranslatorKey = cleanEnv(process.env.AZURE_TRANSLATOR_KEY);
      const azureTranslatorRegion = cleanEnv(process.env.AZURE_TRANSLATOR_REGION);

      // 1) Azure AI Translator (Free F0 tier = 2M chars/month on Azure)
      if (azureTranslatorKey) {
        try {
          const translated = await translateWithAzure(
            fields,
            targetLanguage,
            azureTranslatorKey,
            azureTranslatorRegion
          );
          return res.json({
            ...translated,
            content: restoreImages(translated.content),
          });
        } catch (azureErr) {
          console.warn('Azure Translator failed, trying fallback:', azureErr);
        }
      }

      // 2) Gemini API (when GEMINI_API_KEY is available)
      if (cleanEnv(process.env.GEMINI_API_KEY) && contentWithoutImgs.length <= 100000) {
        try {
          const ai = getAiClient();
          const targetLangLabel =
            targetLanguage === 'pt' ? 'Brazilian Portuguese (pt-BR)' : 'English (en-US)';

          const prompt = `Translate the following technical cloud/Azure blog article fields accurately and naturally into ${targetLangLabel}.
Rules:
- Preserve all HTML tags, attributes, links, [[IMG_PLACEHOLDER_N]] tokens, code blocks, and Markdown structure exactly as given.
- Do NOT translate code inside <pre> or <code> blocks.
- Keep technical product names (such as Microsoft Azure, Azure Bicep, Azure App Service, Azure Front Door, Azure Key Vault, DevOps, Terraform, FinOps, IAM) accurate and idiomatic for ${targetLangLabel}.
- Translate readTime naturally (e.g., "8 min read" <-> "8 min de leitura") and date naturally for ${targetLangLabel}.
- Return ONLY the JSON matching the requested schema.

Input JSON:
${JSON.stringify(fields)}`;

          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  excerpt: { type: Type.STRING },
                  content: { type: Type.STRING },
                  category: { type: Type.STRING },
                  readTime: { type: Type.STRING },
                  date: { type: Type.STRING },
                },
                required: ['title', 'excerpt', 'content', 'category', 'readTime', 'date'],
              },
            },
          });

          const rawText = (response.text ?? '').trim();
          if (rawText) {
            const translated = JSON.parse(rawText);
            return res.json({
              ...translated,
              content: restoreImages(translated.content || ''),
            });
          }
        } catch (geminiErr) {
          console.warn('Gemini translation failed, falling back to zero-key translator:', geminiErr);
        }
      }

      // 3) Zero-key automatic translation fallback (works out-of-the-box on Azure without any API key)
      const [tTitle, tExcerpt, tContent, tCategory, tReadTime] = await Promise.all([
        translatePlainTextFree(fields.title, targetLanguage),
        translatePlainTextFree(fields.excerpt, targetLanguage),
        translateHtmlPreservingStructure(fields.content, targetLanguage),
        translatePlainTextFree(fields.category, targetLanguage),
        translatePlainTextFree(fields.readTime, targetLanguage),
      ]);

      return res.json({
        title: tTitle,
        excerpt: tExcerpt,
        content: restoreImages(tContent),
        category: tCategory,
        readTime: tReadTime,
        date: fields.date,
      });
    } catch (err: any) {
      console.error('Translation API error:', err);
      const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
      return res.status(status).json({
        error: err?.message || 'Failed to translate article.',
      });
    }
  });

  // ==================== SEO ROUTES (robots.txt, sitemap.xml, og-image) ====================
  function getSiteBaseUrl(req: Request): string {
    const envUrl = cleanEnv(process.env.APP_URL);
    if (envUrl && /^https?:\/\//i.test(envUrl)) {
      return envUrl.replace(/\/+$/, '');
    }
    const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host') || `localhost:${PORT}`;
    return `${proto}://${host}`;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function safeJsonLd(obj: Record<string, unknown>): string {
    return JSON.stringify(obj).replace(/</g, '\\u003c');
  }

  app.get('/api/posts/:id/og-image', (req, res) => {
    const post = blogDb.posts.find((p) => p.id === req.params.id);
    if (!post?.imageUrl) {
      return res.status(404).end();
    }
    const match = /^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/i.exec(post.imageUrl);
    if (!match) {
      if (/^https?:\/\//i.test(post.imageUrl)) {
        return res.redirect(302, post.imageUrl);
      }
      return res.status(404).end();
    }
    const mime = match[1].toLowerCase();
    const buf = Buffer.from(match[2], 'base64');
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buf);
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = getSiteBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /login',
        'Disallow: /api/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
        '',
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getSiteBaseUrl(req);
    const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [
      { loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${baseUrl}/articles`, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8' },
    ];

    for (const post of blogDb.posts) {
      const lastmod = (post.updatedAt || post.createdAt || '').slice(0, 10);
      urls.push({
        loc: `${baseUrl}/post/${encodeURIComponent(post.id)}`,
        lastmod: /^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? lastmod : undefined,
        changefreq: 'monthly',
        priority: '0.8',
      });
    }

    for (const page of Object.values(blogDb.pages)) {
      if (page.id === 'home' || page.id === 'about') continue;
      const lastmod = (page.updatedAt || '').slice(0, 10);
      urls.push({
        loc: `${baseUrl}/p/${encodeURIComponent(page.id)}`,
        lastmod: /^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? lastmod : undefined,
        changefreq: 'monthly',
        priority: '0.7',
      });
    }

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls
        .map(
          (u) =>
            `  <url>\n` +
            `    <loc>${escapeXml(u.loc)}</loc>\n` +
            (u.lastmod ? `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n` : '') +
            `    <changefreq>${u.changefreq}</changefreq>\n` +
            `    <priority>${u.priority}</priority>\n` +
            `  </url>`
        )
        .join('\n') +
      '\n</urlset>\n';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath =
      [path.resolve(process.cwd(), 'dist'), path.resolve(__dirname, '../dist'), path.resolve(__dirname, 'dist')].find(
        (p) => fs.existsSync(p)
      ) || path.resolve(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');
    const baseIndexHtml = fs.existsSync(indexHtmlPath) ? fs.readFileSync(indexHtmlPath, 'utf8') : '';

    app.use(express.static(distPath, { index: false }));

    app.get('*', (req, res) => {
      if (!baseIndexHtml) {
        return res.sendFile(indexHtmlPath);
      }

      const baseUrl = getSiteBaseUrl(req);
      const reqPath = req.path || '/';
      const canonical = `${baseUrl}${reqPath}`;

      let seoTitle = 'Humberto Jezus – Blog de Microsoft Azure & Cloud';
      let seoDesc =
        'Artigos práticos, arquiteturas reais, segurança, FinOps e automação em Microsoft Azure por Humberto Jezus, Enterprise Cloud Architect e MCT.';
      let ogType: 'website' | 'article' = 'website';
      let ogImage = '';
      let robots = 'index, follow';
      let extraJsonLd: Record<string, unknown> | null = null;

      if (reqPath.startsWith('/admin') || reqPath.startsWith('/login')) {
        robots = 'noindex, nofollow';
        seoTitle = 'Administração – Humberto Jezus';
      } else if (reqPath.startsWith('/post/')) {
        const postId = decodeURIComponent(reqPath.slice('/post/'.length).split('/')[0] || '');
        const post = blogDb.posts.find((p) => p.id === postId);
        if (post) {
          seoTitle = `${post.title} | Humberto Jezus`;
          seoDesc = (post.excerpt || seoDesc).slice(0, 160);
          ogType = 'article';
          ogImage = /^https?:\/\//i.test(post.imageUrl)
            ? post.imageUrl
            : post.imageUrl?.startsWith('data:image/')
              ? `${baseUrl}/api/posts/${encodeURIComponent(post.id)}/og-image`
              : '';
          extraJsonLd = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: seoDesc,
            ...(ogImage ? { image: [ogImage] } : {}),
            datePublished: post.createdAt || post.date,
            dateModified: post.updatedAt || post.createdAt || post.date,
            articleSection: post.category,
            inLanguage: post.language === 'en' ? 'en-US' : 'pt-BR',
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
            author: { '@type': 'Person', name: post.author || 'Humberto Jezus' },
            publisher: { '@type': 'Person', name: 'Humberto Jezus' },
          };
        }
      } else if (reqPath.startsWith('/p/')) {
        const slug = decodeURIComponent(reqPath.slice('/p/'.length).split('/')[0] || '');
        const page = blogDb.pages[slug];
        if (page) {
          seoTitle = `${page.title} | Humberto Jezus`;
          seoDesc = (page.subtitle || seoDesc).slice(0, 160);
        }
      } else if (reqPath === '/articles') {
        seoTitle = 'Artigos de Microsoft Azure & Cloud | Humberto Jezus';
        seoDesc =
          'Explore tutoriais práticos, scripts PowerShell, Terraform, Azure Bicep, segurança IAM e FinOps no blog de Humberto Jezus.';
      } else if (reqPath === '/about') {
        seoTitle = 'Sobre Humberto Jezus | Enterprise Cloud Architect & MCT';
        seoDesc =
          'Conheça Humberto Jezus, Enterprise Cloud Architect e Microsoft Certified Trainer (MCT) especialista em migrações, IAM, governança e FinOps no Azure.';
      }

      const injectedTags = [
        `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
        `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
        ...(ogImage
          ? [
              `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
              `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
            ]
          : []),
        ...(extraJsonLd
          ? [`<script type="application/ld+json">${safeJsonLd(extraJsonLd)}</script>`]
          : []),
      ].join('\n    ');

      const html = baseIndexHtml
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seoTitle)}</title>`)
        .replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="description" content="${escapeHtml(seoDesc)}" />`
        )
        .replace(
          /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="robots" content="${robots}" />`
        )
        .replace(
          /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:type" content="${ogType}" />`
        )
        .replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:title" content="${escapeHtml(seoTitle)}" />`
        )
        .replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:description" content="${escapeHtml(seoDesc)}" />`
        )
        .replace(
          /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:title" content="${escapeHtml(seoTitle)}" />`
        )
        .replace(
          /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:description" content="${escapeHtml(seoDesc)}" />`
        )
        .replace('</head>', `    ${injectedTags}\n  </head>`);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
