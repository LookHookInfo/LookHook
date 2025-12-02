import Logo from '@/assets/logo.png';
export function AppLogo({ className }: { className?: string }) {
  return <img src={Logo} className={className} />;
}
