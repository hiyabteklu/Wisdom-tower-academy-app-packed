import PackagesCatalog from "@/components/PackagesCatalog";

export const metadata = {
  title: "Packages · Wisdom Tower Academy",
  description:
    "Grade 9-12 and branch packages; special tracks with Telebirr, CBE, and local banks",
};

export default function PackagesPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Academy packages
          </h1>
        </div>

        <PackagesCatalog />
      </div>
    </div>
  );
}
