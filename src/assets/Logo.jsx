export const Logo = ({ size = 32, style = {} }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: size, height: size, ...style }}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
    <path
      d="M12 14C12 12.8954 12.8954 12 14 12H18C19.1046 12 20 12.8954 20 14V26C20 27.1046 19.1046 28 18 28H14C12.8954 28 12 27.1046 12 26V14Z"
      fill="white"
      fillOpacity="0.9"
    />
    <path
      d="M22 18C22 16.8954 22.8954 16 24 16H26C27.1046 16 28 16.8954 28 18V26C28 27.1046 27.1046 28 26 28H24C22.8954 28 22 27.1046 22 26V18Z"
      fill="white"
      fillOpacity="0.7"
    />
    <circle cx="16" cy="16" r="2" fill="#6366F1" />
    <circle cx="25" cy="20" r="1.5" fill="#8B5CF6" />
    <path
      d="M18 20L22 18"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />
  </svg>
);

export const LogoFull = ({ style = {} }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
    <Logo size={32} />
    <span
      style={{
        fontWeight: 700,
        fontSize: 20,
        background: 'linear-gradient(to right, #4f46e5, #7c3aed, #9333ea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      iLeadGen
    </span>
  </div>
);

export default Logo;
