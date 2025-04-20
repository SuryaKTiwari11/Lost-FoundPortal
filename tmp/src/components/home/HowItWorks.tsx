import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  FileSearch,
  FileCheck,
  MessageCircle,
  AlertCircle,
  Search,
  CheckCircle,
} from "lucide-react";

interface HowItWorksProps {
  isAuthenticated: boolean;
}

export default function HowItWorks({ isAuthenticated }: HowItWorksProps) {
  // Process steps for reporting lost items
  const lostItemsSteps = [
    {
      icon: <AlertCircle className="h-8 w-8 text-red-400" />,
      title: "Report your lost item",
      description:
        "Provide details about your lost item including when and where you lost it.",
    },
    {
      icon: <Search className="h-8 w-8 text-blue-400" />,
      title: "Our system searches for matches",
      description:
        "We'll automatically search our database for similar found items.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-purple-400" />,
      title: "Get notified on potential matches",
      description:
        "We'll notify you when someone reports an item that matches yours.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-400" />,
      title: "Connect and recover",
      description: "Connect with the finder and arrange to get your item back.",
    },
  ];

  // Process steps for reporting found items
  const foundItemsSteps = [
    {
      icon: <FileSearch className="h-8 w-8 text-amber-400" />,
      title: "Report the found item",
      description: "Submit details and photos of the item you found.",
    },
    {
      icon: <FileCheck className="h-8 w-8 text-blue-400" />,
      title: "We'll search for the owner",
      description: "Our system checks for matching lost item reports.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-purple-400" />,
      title: "Owner verification",
      description: "We'll verify ownership before connecting you.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-400" />,
      title: "Return the item",
      description: "Arrange with the verified owner to return their item.",
    },
  ];

  return (
    <section className="bg-[#121212] py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">
            How It <span className="text-[#FFD166]">Works</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Our platform makes it easy to report lost items and return found
            items to their rightful owners.
          </p>
        </div>

        {/* Lost items section */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Lost an item?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lostItemsSteps.map((step, index) => (
              <div
                key={index}
                className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333] relative"
              >
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2 text-center">
                  {step.title}
                </h4>
                <p className="text-gray-400 text-sm text-center">
                  {step.description}
                </p>
                {index < lostItemsSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center">
                      <span className="text-[#FFD166]">→</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="bg-[#FFD166] text-[#121212] hover:bg-amber-400"
              asChild
            >
              <Link href={isAuthenticated ? "/report-lost" : "/sign"}>
                Report a Lost Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Found items section */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Found an item?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {foundItemsSteps.map((step, index) => (
              <div
                key={index}
                className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333] relative"
              >
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2 text-center">
                  {step.title}
                </h4>
                <p className="text-gray-400 text-sm text-center">
                  {step.description}
                </p>
                {index < foundItemsSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center">
                      <span className="text-[#FFD166]">→</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-[#FFD166] text-[#FFD166] hover:bg-[#FFD166]/10"
              asChild
            >
              <Link href={isAuthenticated ? "/report-found" : "/sign"}>
                Report a Found Item
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
