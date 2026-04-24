export const runtime = 'edge';

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center text-bg-base font-black text-sm">GJ</div>
          <span className="font-black text-lg">
            <span className="text-brand-gold">GJ</span>
            <span className="text-white"> Lottery</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
