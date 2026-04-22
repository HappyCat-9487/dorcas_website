import { Homepage } from "@/components/home/homepage";

// Homepage "行程精選" pulls featured tours from Supabase; always fetch fresh.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return <Homepage />;
}
