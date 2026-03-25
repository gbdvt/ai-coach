import { AppNav } from "@/components/layout/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:max-w-3xl lg:max-w-5xl">
        {children}
      </main>
    </>
  );
}
