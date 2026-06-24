import { Button } from '@/components/ui/button';
import { CoinsIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen">
      <CoinsIcon className="text-emerald-700 size-20" />
      <h1 className="mt-2 text-4xl font-bold text-emerald-700">
        Welcome to Fina
      </h1>
      <p>Your personal finance app with AI</p>
      <Link href="/dashboard">
        <Button className="mt-2" size="lg">
          Get Started
        </Button>
      </Link>
    </main>
  );
}
