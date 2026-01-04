import { HomeHero } from "@/app/_components/home/home-hero";

export default function Home() {
  return (
    <>
      <HomeHero />
      <section className="min-h-[100svh] w-full px-6 md:px-12">
        <div className="flex min-h-[100svh] items-center justify-center">
          <div className="font-display text-[48px] font-medium tracking-[-1.6px] text-on-surface md:text-[64px] md:tracking-[-2.4px]">
            TEST
          </div>
        </div>
      </section>
    </>
  );
}
