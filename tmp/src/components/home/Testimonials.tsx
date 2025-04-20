import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "I lost my laptop at the train station and thought I'd never see it again. Thanks to this platform, someone found it and I was able to get it back within 24 hours!",
      author: "Sarah Johnson",
      role: "Student",
      avatar: "/images/testimonials/avatar-1.jpg",
    },
    {
      quote:
        "As someone who found a wallet, this platform made it really easy to connect with the owner and return it. The verification process ensured I was returning it to the right person.",
      author: "Michael Chen",
      role: "Software Engineer",
      avatar: "/images/testimonials/avatar-2.jpg",
    },
    {
      quote:
        "I left my custom-made jewelry at a coffee shop. The detailed item descriptions on this platform helped me find it quickly. Forever grateful!",
      author: "Aisha Rodriguez",
      role: "Jewelry Designer",
      avatar: "/images/testimonials/avatar-3.jpg",
    },
  ];

  return (
    <section className="bg-[#1A1A1A] py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            Success <span className="text-[#FFD166]">Stories</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Hear from people who have successfully reunited with their lost
            items or helped return found items to their owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-[#252525] border-[#333] text-white shadow-lg"
            >
              <CardContent className="pt-6">
                <div className="mb-4">
                  {/* Quote marks */}
                  <svg
                    width="45"
                    height="36"
                    viewBox="0 0 45 36"
                    fill="none"
                    className="text-[#FFD166] opacity-40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.4 36C8.8 36 5.5 34.6 3.5 31.8C1.5 28.9 0.5 25.3 0.5 21C0.5 16.4 1.5 12.1 3.5 8.1C5.5 4.1 9 1.2 14 -0.6L17.9 5.5C13.6 6.9 10.6 8.8 9 11.2C7.4 13.6 6.6 15.9 6.6 18.2C6.6 18.9 6.7 19.4 6.9 19.7C7.1 20 7.4 20.2 7.8 20.3C8.2 20.4 9 20.5 10.2 20.5C12.4 20.5 14.2 21.1 15.6 22.3C17.1 23.5 17.8 25.5 17.8 28.3C17.8 30.7 17 32.7 15.4 34.3C13.8 35.5 11.8 36.1 9.4 36.1L13.4 36ZM40.6 36C36 36 32.7 34.6 30.7 31.8C28.7 28.9 27.7 25.3 27.7 21C27.7 16.4 28.7 12.1 30.7 8.1C32.7 4.1 36.2 1.2 41.2 -0.6L45.1 5.5C40.8 6.9 37.8 8.8 36.2 11.2C34.6 13.6 33.8 15.9 33.8 18.2C33.8 18.9 33.9 19.4 34.1 19.7C34.3 20 34.6 20.2 35 20.3C35.4 20.4 36.2 20.5 37.4 20.5C39.6 20.5 41.4 21.1 42.8 22.3C44.3 23.5 45 25.5 45 28.3C45 30.7 44.2 32.7 42.6 34.3C41 35.5 39 36.1 36.6 36.1L40.6 36Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-gray-300">"{testimonial.quote}"</p>
              </CardContent>
              <CardFooter className="border-t border-[#333] pt-4 pb-6 flex items-center">
                <div className="mr-4 relative w-12 h-12 overflow-hidden rounded-full">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-12 h-12" />
                </div>
                <div>
                  <p className="font-medium text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-300">
            Join thousands of users who have successfully used our platform
          </p>
          <p className="text-lg font-semibold text-[#FFD166] mt-1">
            Start your search today!
          </p>
        </div>
      </div>
    </section>
  );
}
