import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          Sanshou <span className="text-orange-500">Factory</span>
        </Link>
        <div className="hidden gap-4 text-sm text-zinc-300 md:flex">
          <Link href="/home">Home</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/journey">Journey</Link>
          <Link href="/experts">Experts</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
