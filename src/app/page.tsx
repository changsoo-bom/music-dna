import { SiteHeader } from "@/components/common/SiteHeader";
import { Fingerprint } from "@/components/landing/Fingerprint";
import { Hero } from "@/components/landing/Hero";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell pb-28 max-sm:pb-16">
        <Hero />
        <Fingerprint />
      </main>
    </>
  );
}
