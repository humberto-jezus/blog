export interface CertificationItem {
  id: string;
  code: string;
  name: {
    pt: string;
    en: string;
  };
  category: 'role-based' | 'trainer-skills' | 'finops-architecture' | 'block64' | 'fundamentals';
  badgeLevel: 'expert' | 'associate' | 'trainer' | 'applied-skills' | 'architecture' | 'practitioner' | 'specialist' | 'fundamentals';
  issuer: 'Microsoft' | 'FinOps Foundation' | 'AWS' | 'ITXPRO' | 'Block 64';
  credentialId?: string;
  verifyUrl?: string;
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/E023A2555C547121',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/D7ADCF4B9E39EB25',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/922278D1BD0CB2CF',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/B4A548D6EE358418',
    featured: true,
  },
  {
    id: 'az-140',
    code: 'AZ-140',
    name: {
      pt: 'Microsoft Certified: Azure Virtual Desktop Specialty',
      en: 'Microsoft Certified: Azure Virtual Desktop Specialty',
    },
    category: 'role-based',
    badgeLevel: 'specialist',
    issuer: 'Microsoft',
    featured: true,
  },

  // 2. MCT & Applied Skills
  {
    id: 'mct',
    code: 'MCT',
    name: {
      pt: 'Microsoft Certified Trainer (MCT) 2026 (e 2023–2024)',
      en: 'Microsoft Certified Trainer (MCT) 2026 (and 2023–2024)',
    },
    category: 'trainer-skills',
    badgeLevel: 'trainer',
    issuer: 'Microsoft',
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/C78B1DA5E8C01967',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/E0BB78A7C0C1C7FD',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/779EF79872A3F8D4',
  },

  // 3. Arquitetura Corporativa, FinOps & AWS
  {
    id: 'togaf-ea',
    code: 'TOGAF',
    name: {
      pt: 'Enterprise Architect – TOGAF (ITXPRO)',
      en: 'Enterprise Architect – TOGAF (ITXPRO)',
    },
    category: 'finops-architecture',
    badgeLevel: 'architecture',
    issuer: 'ITXPRO',
    featured: true,
  },
  {
    id: 'finops-focp',
    code: 'FinOps FOCP',
    name: {
      pt: 'FinOps Certified Practitioner (FinOps Foundation)',
      en: 'FinOps Certified Practitioner (FinOps Foundation)',
    },
    category: 'finops-architecture',
    badgeLevel: 'practitioner',
    issuer: 'FinOps Foundation',
    credentialId: 'tpeqopm3xhpy',
    featured: true,
  },
  {
    id: 'finops-intro',
    code: 'FinOps Intro',
    name: {
      pt: 'Introduction to FinOps (FinOps Foundation)',
      en: 'Introduction to FinOps (FinOps Foundation)',
    },
    category: 'finops-architecture',
    badgeLevel: 'practitioner',
    issuer: 'FinOps Foundation',
    credentialId: 'buj7ww2bakq8',
  },
  {
    id: 'aws-ccp',
    code: 'AWS CCP',
    name: {
      pt: 'AWS Certified Cloud Practitioner (Amazon Web Services)',
      en: 'AWS Certified Cloud Practitioner (Amazon Web Services)',
    },
    category: 'finops-architecture',
    badgeLevel: 'fundamentals',
    issuer: 'AWS',
    featured: true,
  },

  // 4. Cloud Assessments & Migração (Block 64)
  {
    id: 'block64-ts',
    code: 'Block 64 TS',
    name: {
      pt: 'Block 64 Certified Technical Specialist',
      en: 'Block 64 Certified Technical Specialist',
    },
    category: 'block64',
    badgeLevel: 'specialist',
    issuer: 'Block 64',
    credentialId: '63f8c4edaad3be759190bc88',
  },
  {
    id: 'block64-ta',
    code: 'Block 64 TA',
    name: {
      pt: 'Block 64 Certified Technical Architect',
      en: 'Block 64 Certified Technical Architect',
    },
    category: 'block64',
    badgeLevel: 'architecture',
    issuer: 'Block 64',
    credentialId: '63f8c4d3c57cce0f68c0db1e',
    featured: true,
  },
  {
    id: 'block64-da',
    code: 'Block 64 DA',
    name: {
      pt: 'Block 64 Certified Delivery Architect',
      en: 'Block 64 Certified Delivery Architect',
    },
    category: 'block64',
    badgeLevel: 'architecture',
    issuer: 'Block 64',
    credentialId: '63f8c49bc57cce0f68c0db16',
  },

  // 5. Fundamentos Microsoft (Base Oficial)
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/B312BE11A0BFE8B1',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/3D126D7D123FFDE0',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/credentials/6A4E981F8E071896',
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
    verifyUrl: 'https://learn.microsoft.com/users/flaviodejesus-6819/',
  },
];
