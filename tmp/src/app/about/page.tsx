import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          About <span className="text-[#FFD166]">Lost & Found</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Reconnecting people with their lost belongings through a
          community-driven platform.
        </p>
      </div>

      {/* Mission section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <p className="mb-4">
            Lost & Found is a dedicated platform designed to help people recover
            their lost items and connect those who have found items with their
            rightful owners. We believe in the power of community and technology
            to simplify the often stressful experience of losing personal
            belongings.
          </p>
          <p>
            Our goal is to create a centralized, user-friendly system that makes
            reporting, searching, and claiming lost items as straightforward as
            possible, reducing the time and anxiety associated with misplaced
            belongings.
          </p>
        </CardContent>
      </Card>

      {/* How it works section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">
          How It <span className="text-[#FFD166]">Works</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Report Lost Item */}
          <Card className="bg-[#1A1A1A] border-[#333333]">
            <div className="p-6">
              <div className="mb-4">
                <Badge className="bg-[#FFD166] text-[#121212]">Step 1</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Report Lost Item
              </h3>
              <p className="text-gray-400">
                Submit details about your lost item, including a description,
                location where it was last seen, date, and optionally an image.
                Our system will create a listing that others can search for.
              </p>
            </div>
          </Card>

          {/* Browse & Search */}
          <Card className="bg-[#1A1A1A] border-[#333333]">
            <div className="p-6">
              <div className="mb-4">
                <Badge className="bg-[#FFD166] text-[#121212]">Step 2</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Browse & Search
              </h3>
              <p className="text-gray-400">
                Use our powerful search tools to look through found items that
                match your description. Filter by category, date, and location
                to narrow down results and find potential matches.
              </p>
            </div>
          </Card>

          {/* Get Connected */}
          <Card className="bg-[#1A1A1A] border-[#333333]">
            <div className="p-6">
              <div className="mb-4">
                <Badge className="bg-[#FFD166] text-[#121212]">Step 3</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Get Connected
              </h3>
              <p className="text-gray-400">
                When you find a match for your lost item, contact the finder
                through our secure messaging system. Arrange for verification
                and pickup to reclaim your belongings safely.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">
          Frequently Asked <span className="text-[#FFD166]">Questions</span>
        </h2>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-3xl mx-auto"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it free to use Lost & Found?</AccordionTrigger>
            <AccordionContent>
              Yes, our platform is completely free for all users. We believe in
              helping people reconnect with their lost items without any
              financial barriers.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              How do I verify that someone claiming my found item is the real
              owner?
            </AccordionTrigger>
            <AccordionContent>
              We recommend asking for specific details about the item that only
              the owner would know. This could include unique marks, contents
              inside a bag, or other identifying characteristics not mentioned
              in the public listing.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              How long are listings kept on the platform?
            </AccordionTrigger>
            <AccordionContent>
              Lost and found listings remain active for 90 days by default.
              However, users can manually mark items as "claimed" or "resolved"
              at any time, or extend the listing period if needed.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              Is my personal information safe?
            </AccordionTrigger>
            <AccordionContent>
              We take privacy seriously. Your contact information is only shared
              with another user when you explicitly agree to connect regarding a
              specific item. All communication is initially handled through our
              secure platform.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>
              Can I report found items as well?
            </AccordionTrigger>
            <AccordionContent>
              Absolutely! Our platform encourages good Samaritans to report
              items they've found. Simply use the "Report Found Item" feature
              and provide details so the rightful owner can locate their
              belongings.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Stats section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">
          Our <span className="text-[#FFD166]">Impact</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
            <div className="text-[#FFD166] text-4xl font-bold mb-2">5,000+</div>
            <div className="text-gray-400">Items Recovered</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
            <div className="text-[#FFD166] text-4xl font-bold mb-2">10k+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
            <div className="text-[#FFD166] text-4xl font-bold mb-2">98%</div>
            <div className="text-gray-400">Positive Reviews</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
            <div className="text-[#FFD166] text-4xl font-bold mb-2">24/7</div>
            <div className="text-gray-400">Support</div>
          </div>
        </div>
      </div>

      {/* Developer Info Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">
          <span className="text-[#FFD166]">Developer</span> Information
        </h2>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              About the Developer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p className="mb-4">
              This Lost & Found Portal was designed and developed entirely by
              Surya, a 2nd year student at Thapar University. Passionate about
              creating practical solutions to everyday problems, this project
              represents his commitment to helping the community through
              technology.
            </p>
            <p>
              The portal combines a user-friendly interface with powerful
              features like intelligent matching algorithms and secure
              verification processes to reunite lost items with their rightful
              owners.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA section */}
      <div className="text-center bg-[#1A1A1A] border border-[#333333] rounded-xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
          Ready to find what you've lost?
        </h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Join our community today and increase your chances of recovering your
          lost items or help others find theirs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/report-lost"
            className="inline-flex items-center justify-center rounded-md bg-[#FFD166] px-6 py-3 text-[#121212] font-medium hover:bg-[#FFD166]/90 transition-colors"
          >
            Report a Lost Item
          </Link>
          <Link
            href="/found-items"
            className="inline-flex items-center justify-center rounded-md border border-[#333] bg-transparent px-6 py-3 text-white font-medium hover:bg-[#333] hover:text-white transition-colors"
          >
            Browse Found Items
          </Link>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center mt-16 text-gray-400 text-sm">
        <Link href="/about" className="hover:text-[#FFD166] transition-colors">
          Lost&Found © 2025 Lost & Found Portal. All rights reserved
        </Link>
      </div>
    </div>
  );
}
