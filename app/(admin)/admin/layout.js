import { getAdmin } from "@/actions/admin";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import AdminShell from "./_components/admin-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-admin-mono",
  display: "swap",
});

const AdminLayout = async ({ children }) => {
  const admin = await getAdmin();

  if (!admin.authorized) {
    return notFound();
  }

  const user = admin.user;
  const jar = await cookies();
  const stored = jar.get("sidebar_state")?.value;
  const defaultOpen = stored === undefined ? true : stored === "true";

  return (
    <div
      data-admin-root
      className={`${inter.variable} ${inter.className} ${jetbrainsMono.variable} min-h-screen bg-[#0B0807] text-[#F5F1EE] antialiased selection:bg-[#FF6A1F]/30 selection:text-white`}
    >
      <AdminShell
        defaultOpen={defaultOpen}
        user={{
          name: user?.name || "",
          email: user?.email || "",
          imageUrl: user?.imageUrl || "",
        }}
      >
        {children}
      </AdminShell>
    </div>
  );
};

export default AdminLayout;
