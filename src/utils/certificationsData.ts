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
  credentialId?: string;
  badgeImage?: string;
  featured?: boolean;
}

export const CERTIFICATIONS_LIST: CertificationItem[] = [
  // 1. Role-Based & Especialista
  {
    id: 'az-305',
    code: 'AZ-305',
    name: {
      pt: 'Microsoft Certified: Azure Solutions Architect Expert',
      en: 'Microsoft Certified: Azure Solutions Architect Expert',
    },
    category: 'role-based',
    badgeLevel: 'expert',
    issuer: 'Microsoft',
    credentialId: 'E023A2555C547121',
    badgeImage: '/badges/microsoft-certified-expert-badge.svg',
    featured: true,
  },
  {
    id: 'az-104',
    code: 'AZ-104',
    name: {
      pt: 'Microsoft Certified: Azure Administrator Associate',
      en: 'Microsoft Certified: Azure Administrator Associate',
    },
    category: 'role-based',
    badgeLevel: 'associate',
    issuer: 'Microsoft',
    credentialId: 'D7ADCF4B9E39EB25',
    badgeImage: '/badges/microsoft-certified-associate-badge.svg',
    featured: true,
  },
  {
    id: 'az-700',
    code: 'AZ-700',
    name: {
      pt: 'Microsoft Certified: Azure Network Engineer Associate',
      en: 'Microsoft Certified: Azure Network Engineer Associate',
    },
    category: 'role-based',
    badgeLevel: 'associate',
    issuer: 'Microsoft',
    credentialId: '922278D1BD0CB2CF',
    badgeImage: '/badges/microsoft-certified-associate-badge.svg',
    featured: true,
  },
  {
    id: 'ai-102',
    code: 'AI-102',
    name: {
      pt: 'Microsoft Certified: Azure AI Engineer Associate',
      en: 'Microsoft Certified: Azure AI Engineer Associate',
    },
    category: 'role-based',
    badgeLevel: 'associate',
    issuer: 'Microsoft',
    credentialId: 'B4A548D6EE358418',
    badgeImage: '/badges/microsoft-certified-associate-badge.svg',
    featured: true,
  },

  // 2. MCT & Applied Skills
  {
    id: 'mct',
    code: 'MCT',
    name: {
      pt: 'Microsoft Certified Trainer (MCT) 2021–2026',
      en: 'Microsoft Certified Trainer (MCT) 2021–2026',
    },
    category: 'trainer-skills',
    badgeLevel: 'trainer',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-trainer.png',
    featured: true,
  },
  {
    id: 'applied-entra',
    code: 'Applied Skills',
    name: {
      pt: 'Microsoft Applied Skills: Get started with identities and access using Microsoft Entra',
      en: 'Microsoft Applied Skills: Get started with identities and access using Microsoft Entra',
    },
    category: 'trainer-skills',
    badgeLevel: 'applied-skills',
    issuer: 'Microsoft',
    credentialId: 'C78B1DA5E8C01967',
  },
  {
    id: 'applied-azure-mgmt',
    code: 'Applied Skills',
    name: {
      pt: 'Microsoft Applied Skills: Get started with Azure management tasks',
      en: 'Microsoft Applied Skills: Get started with Azure management tasks',
    },
    category: 'trainer-skills',
    badgeLevel: 'applied-skills',
    issuer: 'Microsoft',
    credentialId: 'E0BB78A7C0C1C7FD',
  },
  {
    id: 'applied-ai-agents',
    code: 'Applied Skills',
    name: {
      pt: 'Microsoft Applied Skills: Generate reports with AI research agents',
      en: 'Microsoft Applied Skills: Generate reports with AI research agents',
    },
    category: 'trainer-skills',
    badgeLevel: 'applied-skills',
    issuer: 'Microsoft',
    credentialId: '779EF79872A3F8D4',
  },

  // 3. FinOps
  {
    id: 'finops-focp',
    code: 'FinOps FOCP',
    name: {
      pt: 'FinOps Certified Practitioner (FinOps Foundation)',
      en: 'FinOps Certified Practitioner (FinOps Foundation)',
    },
    category: 'finops',
    badgeLevel: 'practitioner',
    issuer: 'FinOps Foundation',
    credentialId: 'tpeqopm3xhpy',
    badgeImage: '/badges/finops-certified-practitioner.png',
    featured: true,
  },

  // 4. Fundamentos Microsoft (Base Oficial)
  {
    id: 'az-900',
    code: 'AZ-900',
    name: {
      pt: 'Microsoft Certified: Azure Fundamentals',
      en: 'Microsoft Certified: Azure Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    credentialId: 'B312BE11A0BFE8B1',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
    featured: true,
  },
  {
    id: 'ms-900',
    code: 'MS-900',
    name: {
      pt: 'Microsoft 365 Certified: Fundamentals',
      en: 'Microsoft 365 Certified: Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    credentialId: '3D126D7D123FFDE0',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
  },
  {
    id: 'sc-900',
    code: 'SC-900',
    name: {
      pt: 'Microsoft Certified: Security, Compliance, and Identity Fundamentals',
      en: 'Microsoft Certified: Security, Compliance, and Identity Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    credentialId: '6A4E981F8E071896',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
    featured: true,
  },
  {
    id: 'ai-900',
    code: 'AI-900',
    name: {
      pt: 'Microsoft Certified: Azure AI Fundamentals',
      en: 'Microsoft Certified: Azure AI Fundamentals',
    },
    category: 'fundamentals',
    badgeLevel: 'fundamentals',
    issuer: 'Microsoft',
    badgeImage: '/badges/microsoft-certified-fundamentals-badge.svg',
  },
];
