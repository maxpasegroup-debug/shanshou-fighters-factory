import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="relative h-7 w-7 overflow-hidden rounded-full bg-black/60 ring-2 ring-orange-500/80">
            <Image src="/sanshou-logo.png" alt="Sanshou" fill className="object-cover" />
          </span>
          <span>
            Sanshou{" "}
            <span className="align-middle text-xs font-normal text-orange-300">
              Global Training Hub
            </span>
          </span>
        </Link>
        <div className="hidden gap-4 text-sm text-zinc-300 md:flex">
          <Link href="/home">Home</Link>
          <Link href="/dashboard/training">Training</Link>
          <Link href="/journey">Journey</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
