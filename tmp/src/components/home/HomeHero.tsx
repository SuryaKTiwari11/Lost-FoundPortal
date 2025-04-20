import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function HomeHero() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="relative bg-[#121212] text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-grid-white/5"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">Reunite with your</span>{" "}
            <span className="text-[#FFD166]">lost belongings</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            A community-driven platform to help people find their lost items and
            return found items to their owners.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#FFD166] text-[#121212] hover:bg-amber-400"
              asChild
            >
              <Link href={isAuthenticated ? "/report-lost" : "/sign"}>
                Report Lost Item
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-[#FFD166] text-[#FFD166] hover:bg-[#FFD166]/10"
              asChild
            >
              <Link href={isAuthenticated ? "/report-found" : "/sign"}>
                Report Found Item
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 relative w-full max-w-4xl">
          <div className="aspect-video relative rounded-lg overflow-hidden shadow-2xl border border-white/10">
            <Image
              src="/images/hero-image.jpg"
              alt="Lost and Found Portal"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] px-6 py-3 rounded-full shadow-lg border border-[#333] text-gray-300">
            Helping reunite{" "}
            <span className="text-[#FFD166] font-semibold">1000+</span> items
            with their owners
          </div>
        </div>
      </div>
    </section>
  );
}
