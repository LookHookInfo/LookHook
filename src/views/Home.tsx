import NFT from '@/partials/NFT';
import Features from '@/partials/Features';
import Hero from '@/partials/Hero';
import Services from '@/partials/Services';
import Teams from '@/partials/Teams';
import Forum from '@/partials/Forum';
import Tips from '@/partials/Tips';
import { Domain } from '@/partials/Domain';
import Mining from '@/partials/Mining';
import CarouselCardSection from '@/components/CarouselCardSection';
import GM from '@/partials/GM';
import Xrole from '@/partials/Xrole';
import HeliDrop from '@/partials/HeliDrop';
import Lambo from '@/partials/Lambo';
import Welcome from '@/partials/Welcome';
import OG from '@/partials/OG';
import OgTeam from '@/partials/OgTeam';
import Sea from '@/partials/Sea';
import Jet from '@/partials/Jet';
import YouTube from '@/partials/YouTube';
import Telegram from '@/partials/Telegram';
import Amba from '@/partials/Amba';

export default function Home() {
  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <Hero />
      <Features />
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <CarouselCardSection
          className="w-full md:w-1/2"
          items={[
            { key: 'Lambo', component: <Lambo /> },
            { key: 'Welcome', component: <Welcome /> },
            { key: 'HeliDrop', component: <HeliDrop /> },
            { key: 'Sea', component: <Sea /> },
            { key: 'Jet', component: <Jet /> },
          ]}
        />
        <GM className="w-full md:w-1/2" />
      </div>
      <Mining />
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <Tips className="w-full md:w-1/2" />
        <Domain className="w-full md:w-1/2" />
      </div>
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <OG className="w-full md:w-1/2" />
        <CarouselCardSection
          className="w-full md:w-1/2"
          items={[
            { key: 'Xrole', component: <Xrole /> },
            { key: 'YouTube', component: <YouTube /> },
            { key: 'Telegram', component: <Telegram /> },
            { key: 'Amba', component: <Amba /> },
          ]}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <NFT className="w-full md:w-1/2" />
        <Forum className="w-full md:w-1/2" />
      </div>
      <Services />
      <Teams />
      <OgTeam />
    </div>
  );
}
