import { notFound } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCartButton } from "@/components/add-to-cart-button";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: any = null;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true, reviews: { include: { user: { select: { name: true } } } } },
    });
  } catch (error) {
    console.warn("Failed to fetch product from database:", error);
  }

  if (!product || !product.active) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/marketplace"
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 lg:h-96">
          <Store className="h-24 w-24 text-emerald-200" />
        </div>

        <div>
          <span className="text-sm font-medium text-emerald-600">{product.category}</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-2 text-slate-600">Sold by {product.vendor.businessName}</p>
          <p className="mt-6 text-3xl font-bold text-emerald-700">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{product.stock} units available</p>
          <p className="mt-6 text-slate-700">{product.description}</p>
          <div className="mt-8">
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold">Reviews</h2>
          <div className="mt-4 space-y-4">
            {product.reviews.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.user.name}</span>
                    <span className="text-amber-500">{"★".repeat(review.rating)}</span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
