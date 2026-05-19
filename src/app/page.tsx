import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PageFooter from "@/components/PageFooter";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <Navbar isHome />
      <Hero />
      <PageFooter />
    </main>
  );
}
