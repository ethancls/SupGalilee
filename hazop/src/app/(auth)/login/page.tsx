import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-end gap-2 font-medium">
            <Image src="/logo.svg" alt="HAZOP Labs" width={40} height={40} className="mb-0.5" />
            <span className="text-xl font-bold leading-none">HAZOP</span>
            <span className="text-lg font-semibold leading-none text-primary">Labs</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<div className="text-center">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block p-4">
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <Image
            src="/auth-bg.jpg"
            alt="Industrial refinery"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h2 className="text-3xl font-bold text-white mb-3">Process Safety Analysis</h2>
            <p className="text-white/80 text-lg max-w-md">
              Streamline your HAZOP studies with AI-powered analysis, 
              real-time collaboration, and comprehensive risk assessment tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
