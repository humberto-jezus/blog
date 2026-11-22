export interface CertificationItem {
  id: string;
  code: string;
  name: {
    pt: string;
    en: string;
  };
  category: 'role-based' | 'trainer-skills' | 'finops' | 'fundamentals';
  badgeLevel: 'expert' | 'associate' | 'trainer' | 'applied-skills' | 'practitioner' | 'fundamentals';
  issuer: 'Microsoft' | 'FinOps Foundation';
  badgeImage?: string;
}

export const CERTIFICATIONS_LIST: CertificationItem[] = [
  // 1. Role-Based & Especialista
  {
    id: 'az-305',
    code: 'AZ-305',
    name: {
      pt: 'AZ-305: Microsoft Certified: Azure Solutions Architect Expert',
      en: 'AZ-305: Microsoft Certified: Azure Solutions Architect Expert',
    },
    category: 'role-based',
    badgeLevel: 'expert',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-expert-badge.svg',
  },
  {
    id: 'az-104',
    code: 'AZ-104',
    name: {
      pt: 'AZ-104: Microsoft Certified: Azure Administrator Associate',
      en: 'AZ-104: Microsoft Certified: Azure Administrator Associate',
    },
    category: 'role-based',
    badgeLevel: 'associate',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 'az-700',
    code: 'AZ-700',
    name: {
      pt: 'AZ-700: Microsoft Certified: Azure Network Engineer Associate',
      en: 'AZ-700: Microsoft Certified: Azure Network Engineer Associate',
    },
    category: 'role-based',
    badgeLevel: 'associate',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 'ai-102',
    code: 'AI-102',
    name: {
      pt: 'AI-102: Microsoft Certified: Azure AI Engineer Associate',
      en: 'AI-102: Microsoft Certified: Azure AI Engineer Associate',
    },
    category: 'role-based',
    badgeLevel: 'associate',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-associate-badge.svg',
  },

  // 2. MCT & Applied Skills
  {
    id: 'mct',
    code: 'MCT',
    name: {
      pt: 'MCT: Microsoft Certified Trainer 2021–2026',
      en: 'MCT: Microsoft Certified Trainer 2021–2026',
    },
    category: 'trainer-skills',
    badgeLevel: 'trainer',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-trainer.png',
  },
  {
    id: 'applied-entra',
    code: 'Applied Skills',
    name: {
      pt: 'Applied Skills: Get started with identities and access using Microsoft Entra',
      en: 'Applied Skills: Get started with identities and access using Microsoft Entra',
    },
    category: 'trainer-skills',
    badgeLevel: 'applied-skills',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-applied-skills.png',
  },
  {
    id: 'applied-azure-mgmt',
    code: 'Applied Skills',
    name: {
      pt: 'Applied Skills: Get started with Azure management tasks',
      en: 'Applied Skills: Get started with Azure management tasks',
    },
    category: 'trainer-skills',
    badgeLevel: 'applied-skills',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-applied-skills.png',
  },
  {
    id: 'applied-ai-agents',
    code: 'Applied Skills',
    name: {
      pt: 'Applied Skills: Generate reports with AI research agents',
      en: 'Applied Skills: Generate reports with AI research agents',
    },
    category: 'trainer-skills',
    badgeLevel: 'applied-skills',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-applied-skills.png',
  },

  // 3. FinOps
  {
    id: 'finops-focp',
    code: 'FinOps FOCP',
    name: {
      pt: 'FinOps: FinOps Certified Practitioner (FinOps Foundation)',
      en: 'FinOps: FinOps Certified Practitioner (FinOps Foundation)',
    },
    category: 'finops',
    badgeLevel: 'practitioner',
    issuer: 'FinOps Foundation',
    badgeImage: '/badges/finops-certified-practitioner.png',
  },

  // 4. Fundamentos Microsoft (Base Oficial)
  {
    id: 'az-900',
    code: 'AZ-900',
    name: {
      pt: 'AZ-900: Microsoft Certified: Azure Fundamentals',
      en: 'AZ-900: Microsoft Certified: Azure Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
  },
  {
    id: 'ms-900',
    code: 'MS-900',
    name: {
      pt: 'MS-900: Microsoft 365 Certified: Fundamentals',
      en: 'MS-900: Microsoft 365 Certified: Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
  },
  {
    id: 'sc-900',
    code: 'SC-900',
    name: {
      pt: 'SC-900: Microsoft Certified: Security, Compliance, and Identity Fundamentals',
      en: 'SC-900: Microsoft Certified: Security, Compliance, and Identity Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
  },
  {
    id: 'ai-900',
    code: 'AI-900',
    name: {
      pt: 'AI-900: Microsoft Certified: Azure AI Fundamentals',
      en: 'AI-900: Microsoft Certified: Azure AI Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
  },
];
