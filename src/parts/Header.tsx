import { AppLogo } from '@/components/Com';
import UserProfile from '../components/UserProfile';
import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <div className="max-1200 mx-auto">
      <header className="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full text-sm py-3">
        <nav className="max-w-[85rem] w-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <NavLink
              to="/"
              className="flex items-center text-xl font-semibold dark:text-white focus:outline-hidden focus:opacity-80"
              aria-label="Look Hook"
            >
              <AppLogo className="w-12 sm:w-16" />
              <h1 className="hidden sm:inline text-white text-2xl sm:text-3xl ml-2 sm:ml-3 font-bold">
                Look&nbsp;Hook
              </h1>
            </NavLink>
            
            <div className="hidden sm:flex items-center gap-x-5 ml-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `font-medium transition-colors hover:text-blue-400 ${isActive ? 'text-blue-500' : 'text-gray-400'}`
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/airdrop" 
                className={({ isActive }) => 
                  `font-medium transition-colors hover:text-blue-400 ${isActive ? 'text-blue-500' : 'text-gray-400'}`
                }
              >
                AirDrop
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-x-3 sm:order-3">
            {/* Mobile Navigation (Simple) */}
            <div className="sm:hidden flex items-center gap-x-3 mr-2">
               <NavLink to="/" className={({ isActive }) => isActive ? 'text-blue-500' : 'text-gray-400'}>
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
               </NavLink>
               <NavLink to="/airdrop" className={({ isActive }) => isActive ? 'text-blue-500' : 'text-gray-400'}>
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
               </NavLink>
            </div>
            <UserProfile />
          </div>
        </nav>
      </header>
    </div>
  );
}
