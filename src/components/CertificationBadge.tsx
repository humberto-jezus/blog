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
  // If official badge image (SVG or PNG) is provided, render it directly
  if (badgeImage) {
    return (
      <div className={`relative flex items-center justify-center p-1 ${className} select-none transition-transform hover:scale-105 duration-200 shrink-0`}>
        <img
          src={badgeImage}
          alt={`${issuer} ${code} Certification Badge`}
          className="w-full h-full object-contain drop-shadow-md"
          loading="lazy"
        />
      </div>
    );
  }

  // Microsoft Applied Skills vector badge
  return (
    <div
      className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0d9488] text-white shadow-md border border-[#34d399]/50 ${className} select-none transition-transform hover:scale-105 duration-200 shrink-0`}
    >
      <div className="w-full flex items-center justify-between px-1">
        <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0 opacity-90">
          <span className="w-1.5 h-1.5 bg-[#f25022] rounded-[1px]"></span>
          <span className="w-1.5 h-1.5 bg-[#7fba00] rounded-[1px]"></span>
          <span className="w-1.5 h-1.5 bg-[#00a4ef] rounded-[1px]"></span>
          <span className="w-1.5 h-1.5 bg-[#ffb900] rounded-[1px]"></span>
        </div>
        <span className="text-[8.5px] font-bold text-[#34d399]">APPLIED</span>
      </div>

      <div className="my-auto text-center px-1">
        <div className="text-[12px] font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
          {code}
        </div>
        <div className="text-[8px] font-semibold uppercase tracking-wider text-[#34d399]">
          MICROSOFT
        </div>
      </div>

      <div className="w-full py-0.5 rounded-md text-center text-[7.5px] font-black tracking-widest text-white shadow-xs bg-gradient-to-r from-[#059669] to-[#0f766e]">
        VERIFIED SKILL
      </div>
    </div>
  );
};
