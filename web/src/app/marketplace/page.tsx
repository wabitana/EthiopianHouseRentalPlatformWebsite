import Link from "next/link";
import { Store, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  let products: any[] = [];
  let categories: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        active: true,
        ...(params.q ? { name: { contains: params.q } } : {}),
        ...(params.category ? { category: params.category } : {}),
      },
      include: { vendor: { select: { businessName: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });

    categories = await (prisma.product.groupBy as any)({
      by: ["category"],
      where: { active: true },
    });
  } catch (error) {
    console.warn("Failed to fetch marketplace data from database:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Marketplace</h1>
        <p className="mt-1 text-slate-600">
          Browse products from verified vendors across Ethiopia
        </p>
      </div>

      <form className="mb-8 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            defaultValue={params.q}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <select
          name="category"
          defaultValue={params.category || ""}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Search
        </button>
      </form>

      {products.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <Store className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4">No products found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/marketplace/${product.id}`}>
              <Card className="card-hover h-full overflow-hidden">
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50">
                  <Store className="h-14 w-14 text-emerald-200" />
                </div>
                <CardContent className="p-4">
                  <span className="text-xs font-medium text-emerald-600">{product.category}</span>
                  <h3 className="mt-1 font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-700">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-slate-400">{product.stock} in stock</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{product.vendor.businessName}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
