import { BlogPost, PageContent } from '../types';

export const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Modernizando Infraestrutura com Azure Bicep',
    excerpt: 'Saiba como usar o Azure Bicep para definir e implantar sua infraestrutura de nuvem como código com facilidade e precisão.',
    content: '<p>O Azure Bicep é uma linguagem específica de domínio (DSL) para implantar recursos do Azure de forma declarativa. Ele visa simplificar a experiência de criação, fornecendo uma sintaxe mais limpa, melhor modularidade e gerenciamento automático de dependências.</p>',
    category: 'DevOps',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
    date: '2024-03-15',
    readTime: '8 min read',
    author: 'Humberto Jezus',
    authorUid: 'mock-user',
    language: 'pt',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '2',
    title: 'Azure AI Services: Um Mergulho Profundo',
    excerpt: 'Explore os últimos avanços nos Serviços de IA do Azure e como eles podem transformar seus aplicativos com recursos inteligentes.',
    content: '<p>O Microsoft Azure oferece um conjunto abrangente de serviços de IA que permitem aos desenvolvedores criar aplicativos inteligentes sem a necessidade de profundo conhecimento em ciência de dados.</p>',
    category: 'AI & Machine Learning',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
    date: '2024-03-10',
    readTime: '12 min read',
    author: 'Humberto Jezus',
    authorUid: 'mock-user',
    language: 'pt',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: '3',
    title: 'Modernizing Infrastructure with Azure Bicep',
    excerpt: 'Learn how to use Azure Bicep to define and deploy your cloud infrastructure as code with ease and precision.',
    content: '<p>Azure Bicep is a Domain Specific Language (DSL) for deploying Azure resources declaratively. It aims to simplify the authoring experience by providing a cleaner syntax, better modularity, and automatic dependency management.</p>',
    category: 'DevOps',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
    date: '2024-03-15',
    readTime: '8 min read',
    author: 'Humberto Jezus',
    authorUid: 'mock-user',
    language: 'en',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '4',
    title: 'Azure AI Services: A Deep Dive',
    excerpt: 'Explore the latest advancements in Azure AI Services and how they can transform your applications with intelligent features.',
    content: '<p>Microsoft Azure offers a comprehensive suite of AI services that allow developers to build intelligent applications without needing deep data science expertise.</p>',
    category: 'AI & Machine Learning',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
    date: '2024-03-10',
    readTime: '12 min read',
    author: 'Humberto Jezus',
    authorUid: 'mock-user',
    language: 'en',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  }
];

export const MOCK_PAGES: Record<string, PageContent> = {
  home: {
    id: 'home',
    title: 'Humberto Jezus',
    content: '<p>Explorando o futuro da nuvem com Microsoft Azure. Artigos técnicos, tutoriais e as últimas novidades do ecossistema Microsoft.</p>',
    updatedAt: new Date()
  },
  about: {
    id: 'about',
    title: 'Sobre Mim',
    content: '<p>Este blog é dedicado a compartilhar conhecimento sobre Microsoft Azure, ajudando profissionais a navegarem no complexo mundo da computação em nuvem.</p>',
    updatedAt: new Date()
  }
};
