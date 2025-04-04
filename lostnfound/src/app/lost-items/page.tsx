import SearchLostItems from '@/components/SearchLostItems';

export default function SearchPage() {
  return (
    <div className="min-h-screen py-8 md:py-12" style={{ backgroundColor: "#121212", color: "#FFFFFF" }}>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: "#FFD166" }}>
          Find Lost Items
        </h1>
        <SearchLostItems />
      </div>
    </div>
  );
}
