import Mining from "@/partials/Mining";
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
import Airdrop from "@/partials/Airdrop";

export default function Home() {
  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <Hero />
      <Features />
      <Forum />
      <Mining />
      <NFT />

      <div className="flex flex-col md:flex-row gap-4 my-8">
        <Tips className="w-full md:w-1/2" />
        <Domain className="w-full md:w-1/2" />
      </div>
      <div className="flex flex-col md:flex-row gap-4 my-8">
        <Drub className="w-full md:w-1/2" />
        <Airdrop className="w-full md:w-1/2" />
      </div>
      <div className="flex flex-col md:flex-row gap-4 my-8">
        <Hashchain className="w-full md:w-1/2" />
      </div>

      <Services />
      <Teams />
    </div>
  );
}
