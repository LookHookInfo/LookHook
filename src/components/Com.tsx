import Logo from '@/assets/logo.png';
export function AppLogo({ className }: { className?: string }) {
  return <img src={Logo} alt="Look Hook Logo" className={className} />;
}
