import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms for Lost & Found Portal",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-lg  rounded-lg shadow-md">{children}</div>
    </div>
  );
}
