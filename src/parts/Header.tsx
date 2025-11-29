import { AppLogo } from '@/components/Com'
import UserProfile from '../components/UserProfile'; 
export function Header (){
    return (
<div className='max-1200 mx-auto'>
<header className="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full text-sm py-3">
      <nav className="max-w-[85rem] w-full mx-auto px-4 flex items-center justify-between">
    <div className="flex items-center justify-between px-5">
      <a className="flex items-center text-xl font-semibold dark:text-white focus:outline-hidden focus:opacity-80" href="#" aria-label="Brand">
        <AppLogo className="w-12 sm:w-16" />
        <span className='hidden sm:inline text-white text-2xl sm:text-3xl ml-2 sm:ml-3 font-bold'>Look&nbsp;Hook</span>
      </a>
    </div>
    <div className="sm:order-3 flex items-center gap-x-2">
        <UserProfile />
    </div>
  </nav>
</header></div>)
}