import NFT from "@/partials/NFT";
import Features from "@/partials/Features";
import Hero from "@/partials/Hero";
import Services from "@/partials/Services";
import Teams from "@/partials/Teams";
import Forum from "@/partials/Forum";
import Tips from "@/partials/Tips";
import { Domain } from "@/partials/Domain";
import Drub from "@/partials/Drub";
import Hashchain from "@/partials/Hashchain";
// Airdrop and Drop are now handled by CarouselCardSection
import Mining from "@/partials/Mining";
import CarouselCardSection from "@/components/CarouselCardSection";
import Airdrop from "@/partials/Airdrop"; // Still needed to pass as component
import Drop from "@/partials/Drop";     // Still needed to pass as component

export default function Home() {
  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <Hero />
      <Features />
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <Forum className="w-full md:w-1/2" />
        <NFT className="w-full md:w-1/2" />
      </div>
      <Mining />
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <Tips className="w-full md:w-1/2" />
        <Domain className="w-full md:w-1/2" />
      </div>
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <Drub className="w-full md:w-1/2" />
        <CarouselCardSection
          className="w-full md:w-1/2"
          items={[
            { key: "airdrop", component: <Airdrop /> },
            { key: "drop", component: <Drop /> },
          ]}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 my-2">
        <Hashchain className="w-full md:w-1/2" />
        {/* This slot is now empty as Drop is in CarouselCardSection. If desired, another component or an empty div can fill this. */}
      </div>

      <Services />
      <Teams />
    </div>
  );
}
