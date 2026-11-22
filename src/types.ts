export interface BlogPost {
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
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type PageIconKey = 'shield' | 'cloud' | 'chart' | 'code' | 'rocket' | 'users' | 'award';

export interface HomePageConfig {
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  extraContent?: string;
  showLatestPosts: boolean;
  postsEyebrow: string;
  postsTitle: string;
  postsViewAllText: string;
}

export interface AboutSpecialtyItem {
  title: string;
  description: string;
  icon: PageIconKey;
}

export interface AboutCertificationItem {
  name: string;
  imageUrl: string;
}

export interface AboutCommunityItem {
  title: string;
  description: string;
  highlights: string[];
  icon: PageIconKey;
}

export interface AboutPageConfig {
  showSpecialties: boolean;
  specialtiesTitle: string;
  specialties: AboutSpecialtyItem[];
  showCertifications: boolean;
  certificationsTitle: string;
  certifications: AboutCertificationItem[];
  showCommunity: boolean;
  communityTitle: string;
  community: AboutCommunityItem[];
}

export interface CustomSectionCard {
  title: string;
  description: string;
  icon: PageIconKey;
  link?: string;
}

export interface CustomSectionGalleryItem {
  name: string;
  imageUrl: string;
}

export interface CustomPageSection {
  id: string;
  type: 'text' | 'cards' | 'gallery' | 'cta';
  title: string;
  subtitle?: string;
  content?: string;
  cards?: CustomSectionCard[];
  gallery?: CustomSectionGalleryItem[];
  buttonText?: string;
  buttonLink?: string;
}

export interface PageContent {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  showInNav?: boolean;
  isSystem?: boolean;
  homeConfig?: HomePageConfig;
  aboutConfig?: AboutPageConfig;
  sections?: CustomPageSection[];
  updatedAt: Date | string;
}
