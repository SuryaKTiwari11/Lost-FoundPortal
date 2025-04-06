import SearchLostItems from "@/components/SearchLostItems";

export default function SearchPage() {
  return (
    <div className="min-h-screen py-10 md:py-16 bg-[#121212] text-white">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-2 text-[#FFD166]">
          Find Lost Items
        </h1>
        <div className="mt-10">
          <SearchLostItems />
        </div>
      </div>
    </div>
  );
}
