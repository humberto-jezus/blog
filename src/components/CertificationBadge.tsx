import React from 'react';

interface CertificationBadgeProps {
  code: string;
  badgeLevel: 'expert' | 'associate' | 'trainer' | 'applied-skills' | 'architecture' | 'practitioner' | 'specialist' | 'fundamentals';
  issuer: 'Microsoft' | 'FinOps Foundation' | 'AWS' | 'ITXPRO' | 'Block 64';
  badgeSvg?: string;
  className?: string;
}

export const CertificationBadge: React.FC<CertificationBadgeProps> = ({
  code,
  badgeLevel,
  issuer,
  badgeSvg,
  className = 'w-24 h-24',
}) => {
  // If official Microsoft Learn SVG is provided, render the official Microsoft badge directly
  if (badgeSvg) {
    return (
      <div className={`relative flex items-center justify-center p-1 ${className} select-none transition-transform hover:scale-105 duration-200`}>
        <img
          src={badgeSvg}
          alt={`${issuer} ${code} Certification Badge`}
          className="w-full h-full object-contain drop-shadow-md"
          loading="lazy"
        />
      </div>
    );
  }

  // High-fidelity vector badge for AWS, FinOps, TOGAF, Block 64, Applied Skills
  const getBadgeStyle = () => {
    switch (badgeLevel) {
      case 'applied-skills':
        return {
          gradient: 'from-[#064e3b] via-[#047857] to-[#0d9488]',
          accent: '#34d399',
          accentText: 'text-[#34d399]',
          border: 'border-[#34d399]/50',
          tierLabel: 'APPLIED SKILLS',
          tierBg: 'bg-gradient-to-r from-[#059669] to-[#0f766e]',
          stars: 2,
        };
      case 'practitioner':
        return {
          gradient: 'from-[#0f172a] via-[#1e293b] to-[#0d9488]',
          accent: '#2dd4bf',
          accentText: 'text-[#2dd4bf]',
          border: 'border-[#2dd4bf]/60',
          tierLabel: 'FINOPS',
          tierBg: 'bg-gradient-to-r from-[#0d9488] to-[#115e59]',
          stars: 2,
        };
      case 'architecture':
        if (issuer === 'Block 64') {
          return {
            gradient: 'from-[#1e1b4b] via-[#312e81] to-[#2563eb]',
            accent: '#93c5fd',
            accentText: 'text-[#93c5fd]',
            border: 'border-[#93c5fd]/50',
            tierLabel: 'BLOCK 64 ARCHITECT',
            tierBg: 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]',
            stars: 2,
          };
        }
        return {
          gradient: 'from-[#1e1b4b] via-[#312e81] to-[#4338ca]',
          accent: '#a5b4fc',
          accentText: 'text-[#a5b4fc]',
          border: 'border-[#a5b4fc]/50',
          tierLabel: 'ENTERPRISE ARCHITECT',
          tierBg: 'bg-gradient-to-r from-[#4f46e5] to-[#3730a3]',
          stars: 2,
        };
      case 'specialist':
        return {
          gradient: 'from-[#172554] via-[#1e40af] to-[#2563eb]',
          accent: '#93c5fd',
          accentText: 'text-[#93c5fd]',
          border: 'border-[#93c5fd]/50',
          tierLabel: 'SPECIALIST',
          tierBg: 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]',
          stars: 2,
        };
      default:
        return {
          gradient: 'from-[#232f3e] via-[#131921] to-[#37475a]',
          accent: '#ff9900',
          accentText: 'text-[#ff9900]',
          border: 'border-[#ff9900]/60',
          tierLabel: 'AWS CLOUD',
          tierBg: 'bg-gradient-to-r from-[#d97706] to-[#b45309]',
          stars: 1,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div
      className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-md border ${style.border} ${className} select-none transition-transform hover:scale-105 duration-200`}
    >
      {/* Top Header / Logo */}
      <div className="w-full flex items-center justify-between px-1">
        {issuer === 'Microsoft' && (
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0 opacity-90">
            <span className="w-1.5 h-1.5 bg-[#f25022] rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-[#7fba00] rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-[#00a4ef] rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-[#ffb900] rounded-[1px]"></span>
          </div>
        )}
        {issuer === 'FinOps Foundation' && (
          <span className="text-[9px] font-black tracking-wider text-[#2dd4bf]">FINOPS</span>
        )}
        {issuer === 'AWS' && (
          <span className="text-[9px] font-black tracking-wider text-[#ff9900]">AWS</span>
        )}
        {issuer === 'ITXPRO' && (
          <span className="text-[9px] font-black tracking-wider text-[#a5b4fc]">TOGAF</span>
        )}
        {issuer === 'Block 64' && (
          <span className="text-[9px] font-black tracking-wider text-[#93c5fd]">BLOCK 64</span>
        )}

        {/* Stars */}
        <div className="flex gap-0.5 items-center">
          {Array.from({ length: style.stars }).map((_, i) => (
            <svg
              key={i}
              className={`w-2.5 h-2.5 ${style.accentText} fill-current`}
              viewBox="0 0 20 20"
            >
              <polygon points="10,1 12.8,7 19.5,7.6 14.4,12.2 15.9,18.8 10,15.2 4.1,18.8 5.6,12.2 0.5,7.6 7.2,7" />
            </svg>
          ))}
        </div>
      </div>

      {/* Middle Code */}
      <div className="my-auto text-center px-1">
        <div className="text-[13px] sm:text-[14px] font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
          {code}
        </div>
        <div className={`text-[8.5px] font-semibold uppercase tracking-wider ${style.accentText}`}>
          {issuer}
        </div>
      </div>

      {/* Bottom Level Ribbon */}
      <div
        className={`w-full py-0.5 rounded-md text-center text-[7.5px] font-black tracking-widest text-white shadow-xs ${style.tierBg}`}
      >
        {style.tierLabel}
      </div>
    </div>
  );
};
