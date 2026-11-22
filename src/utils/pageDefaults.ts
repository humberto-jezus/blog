import {
  ShieldCheck,
  CloudUpload,
  LineChart,
  Code2,
  Rocket,
  Users,
  Award,
  LucideIcon,
} from 'lucide-react';
import { AboutPageConfig, HomePageConfig, PageIconKey } from '../types';

export const PAGE_ICON_MAP: Record<PageIconKey, LucideIcon> = {
  shield: ShieldCheck,
  cloud: CloudUpload,
  chart: LineChart,
  code: Code2,
  rocket: Rocket,
  users: Users,
  award: Award,
};

export const PAGE_ICON_OPTIONS: { value: PageIconKey; label: string }[] = [
  { value: 'shield', label: 'Segurança / Escudo' },
  { value: 'cloud', label: 'Nuvem / Migração' },
  { value: 'chart', label: 'Gráfico / FinOps' },
  { value: 'code', label: 'Código / IaC' },
  { value: 'rocket', label: 'Foguete / Treinamento' },
  { value: 'users', label: 'Comunidade / Pessoas' },
  { value: 'award', label: 'Certificação / Prêmio' },
];

export const DEFAULT_HOME_TITLE = 'Humberto Jezus';
export const DEFAULT_HOME_SUBTITLE =
  'Arquiteto de Soluções Cloud. Compartilhando experiências reais, tutoriais práticos e a jornada no Microsoft Azure.';

export const DEFAULT_HOME_CONFIG: HomePageConfig = {
  primaryButtonText: 'Ler Artigos',
  primaryButtonLink: '/articles',
  secondaryButtonText: 'Sobre Mim',
  secondaryButtonLink: '/about',
  extraContent: '',
  showLatestPosts: true,
  postsEyebrow: 'NOVIDADES',
  postsTitle: 'Últimos Artigos',
  postsViewAllText: 'Ver todos',
};

export const DEFAULT_ABOUT_TITLE = 'Sobre Mim';
export const DEFAULT_ABOUT_SUBTITLE =
  'Enterprise Cloud Architect & Microsoft Certified Trainer (MCT). Especialista em migrações, segurança e governança no ecossistema Microsoft.';

export const DEFAULT_ABOUT_CONTENT =
  '<p>Sou um Arquiteto de Nuvem especializado em Microsoft Azure, com forte experiência em migrações de infraestrutura a partir de ambientes AWS, GCP, OCI e On-premises.</p>' +
  '<p>Trabalho extensivamente com o <strong>Cloud Adoption Framework (CAF)</strong> e o <strong>Azure Well-Architected Framework</strong> da Microsoft para projetar e implementar soluções corporativas com foco em segurança, gerenciamento de identidade (IAM) e governança.</p>' +
  '<p>Meu foco é entender as necessidades de negócios e traduzi-las em arquiteturas práticas e escaláveis. Gosto de assumir a responsabilidade por projetos complexos, orientar equipes técnicas e resolver problemas desafiadores, sempre equilibrando segurança, desempenho e otimização de custos (FinOps).</p>';

export const DEFAULT_ABOUT_CONFIG: AboutPageConfig = {
  showSpecialties: true,
  specialtiesTitle: 'Minhas Especialidades',
  specialties: [
    {
      icon: 'shield',
      title: 'Identidade e Segurança (IAM)',
      description:
        'Arquitetura corporativa com Microsoft Entra ID, B2B/B2C, Zero Trust, RBAC e governança de acessos.',
    },
    {
      icon: 'cloud',
      title: 'Migrações Complexas',
      description:
        'Liderança em migrações de IaaS/PaaS de AWS, GCP, OCI e datacenters locais para o Azure com zero perda de dados.',
    },
    {
      icon: 'chart',
      title: 'Governança e FinOps',
      description:
        'Otimização de custos e conformidade utilizando Azure Policy, Cost Management e práticas de FinOps.',
    },
    {
      icon: 'code',
      title: 'Resiliência e IaC',
      description:
        'Desenho de Disaster Recovery (RTO/RPO agressivos) e automação com Terraform, Bicep e Azure DevOps.',
    },
  ],
  showCertifications: true,
  certificationsTitle: 'Certificações',
  certifications: [
    {
      name: 'AZ-305',
      imageUrl:
        'https://learn.microsoft.com/media/learn/certification/badges/microsoft-certified-solutions-architect-expert-badge.svg',
    },
    {
      name: 'AZ-500',
      imageUrl:
        'https://learn.microsoft.com/media/learn/certification/badges/microsoft-certified-azure-security-engineer-associate-badge.svg',
    },
    {
      name: 'AZ-104',
      imageUrl:
        'https://learn.microsoft.com/media/learn/certification/badges/microsoft-certified-azure-administrator-associate-badge.svg',
    },
    {
      name: 'AZ-700',
      imageUrl:
        'https://learn.microsoft.com/media/learn/certification/badges/microsoft-certified-azure-network-engineer-associate-badge.svg',
    },
    {
      name: 'AZ-140',
      imageUrl:
        'https://learn.microsoft.com/media/learn/certification/badges/microsoft-certified-azure-virtual-desktop-specialist-badge.svg',
    },
    {
      name: 'MCT',
      imageUrl:
        'https://learn.microsoft.com/media/learn/certification/badges/microsoft-certified-trainer-badge.svg',
    },
  ],
  showCommunity: true,
  communityTitle: 'Comunidade & Liderança',
  community: [
    {
      icon: 'rocket',
      title: 'Azure Training',
      description:
        'Desde 2021, atuo capacitando indivíduos e equipes a dominar tecnologias de nuvem através de mentoria especializada, treinamentos práticos e melhores práticas para soluções escaláveis.',
      highlights: [
        'Liderança educacional e mentoria personalizada',
        'Workshops práticos e exercícios do mundo real',
        'Consultoria estratégica em adoção de nuvem',
      ],
    },
    {
      icon: 'users',
      title: 'Microsoft Reactor',
      description:
        'Participante ativo na comunidade Microsoft Reactor, conectando-se com desenvolvedores, startups e entusiastas de tecnologia.',
      highlights: [
        'Sessões lideradas por especialistas, networking e aprendizado prático em nuvem, IA e tecnologias emergentes',
      ],
    },
  ],
};

export function mergeHomeConfig(config?: Partial<HomePageConfig>): HomePageConfig {
  return {
    ...DEFAULT_HOME_CONFIG,
    ...(config || {}),
  };
}

export function mergeAboutConfig(config?: Partial<AboutPageConfig>): AboutPageConfig {
  return {
    showSpecialties: config?.showSpecialties ?? DEFAULT_ABOUT_CONFIG.showSpecialties,
    specialtiesTitle: config?.specialtiesTitle ?? DEFAULT_ABOUT_CONFIG.specialtiesTitle,
    specialties: Array.isArray(config?.specialties)
      ? config.specialties
      : DEFAULT_ABOUT_CONFIG.specialties,
    showCertifications: config?.showCertifications ?? DEFAULT_ABOUT_CONFIG.showCertifications,
    certificationsTitle: config?.certificationsTitle ?? DEFAULT_ABOUT_CONFIG.certificationsTitle,
    certifications: Array.isArray(config?.certifications)
      ? config.certifications
      : DEFAULT_ABOUT_CONFIG.certifications,
    showCommunity: config?.showCommunity ?? DEFAULT_ABOUT_CONFIG.showCommunity,
    communityTitle: config?.communityTitle ?? DEFAULT_ABOUT_CONFIG.communityTitle,
    community: Array.isArray(config?.community)
      ? config.community
      : DEFAULT_ABOUT_CONFIG.community,
  };
}
