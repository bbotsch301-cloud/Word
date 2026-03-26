import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-6">
      <Skeleton className="h-4 w-48 mb-6" />
      <Skeleton className="h-10 w-64 mb-3" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-3/4 mb-6" />
      <Skeleton className="h-10 w-full mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </main>
  );
}
