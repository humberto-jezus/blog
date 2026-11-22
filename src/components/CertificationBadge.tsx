import React from 'react';

interface CertificationBadgeProps {
  code: string;
  badgeLevel: 'expert' | 'associate' | 'trainer' | 'applied-skills' | 'practitioner' | 'fundamentals';
  issuer: 'Microsoft' | 'FinOps Foundation';
  badgeImage?: string;
  className?: string;
}

export const CertificationBadge: React.FC<CertificationBadgeProps> = ({
  code,
  badgeLevel,
  issuer,
  badgeImage,
  className = 'w-24 h-24',
}) => {
  // Fallback image path based on level
  const resolvedBadgeImage =
    badgeImage ||
    (badgeLevel === 'applied-skills'
      ? '/badges/microsoft-applied-skills.svg'
      : badgeLevel === 'expert'
      ? '/badges/microsoft-certified-expert-badge.svg'
      : badgeLevel === 'associate'
      ? '/badges/microsoft-certified-associate-badge.svg'
      : badgeLevel === 'trainer'
      ? '/badges/microsoft-certified-trainer.png'
      : '/badges/microsoft-certified-fundamentals-badge.svg');

  return (
    <div className={`relative flex items-center justify-center p-1 ${className} select-none transition-transform hover:scale-105 duration-200 shrink-0`}>
      <img
        src={resolvedBadgeImage}
        alt={`${issuer} ${code} Certification Badge`}
        className="w-full h-full object-contain drop-shadow-md"
        loading="lazy"
      />
    </div>
  );
};
