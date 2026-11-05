"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Calendar, Car, LayoutDashboard, Settings } from "lucide-react";
import logo from "@/public/logo.png";
import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const mainRoutes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Cars", icon: Car, href: "/admin/cars" },
  { label: "Test Drives", icon: Calendar, href: "/admin/test-drives" },
];

const settingsRoute = { label: "Settings", icon: Settings, href: "/admin/settings" };

const CRUMB_LABELS = {
  admin: "Dashboard",
  cars: "Cars",
  create: "New car",
  "test-drives": "Test Drives",
  settings: "Settings",
};

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function crumbsFor(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "admin") {
    return [{ label: "Dashboard", href: "/admin" }];
  }
  return parts.map((part, index) => ({
    label: CRUMB_LABELS[part] || part,
    href: `/${parts.slice(0, index + 1).join("/")}`,
  }));
}

function HairlineDivider({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-2 shrink-0 ${className}`}
    />
  );
}

function NavItem({ route, pathname }) {
  const active = isActive(pathname, route.href);
  const Icon = route.icon;

  return (
    <SidebarMenuItem className="relative flex items-center justify-center">
      {/* Small vertical orange indicator bar pinned on left inner edge */}
      {active && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#FF6A1F] shadow-[0_0_8px_rgba(255,106,31,0.85)] z-20 transition-all duration-200 -left-2 group-data-[collapsible=icon]:left-1"
        />
      )}

      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={route.label}
        className={`group/btn relative h-11 w-full rounded-full transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#FF6A1F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#100C0B] ${
          active
            ? "border border-white/15 bg-[linear-gradient(90deg,rgba(255,106,31,0.35)_0%,rgba(255,106,31,0.12)_35%,transparent_85%)] text-white font-medium shadow-[0_0_24px_rgba(255,106,31,0.35)] group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:border-white/20 group-data-[collapsible=icon]:bg-[radial-gradient(circle,rgba(255,106,31,0.28)_0%,transparent_70%)] group-data-[collapsible=icon]:shadow-[0_0_20px_rgba(255,106,31,0.3)]"
            : "text-[#A39A94] hover:bg-white/[0.05] hover:text-[#F5F1EE] group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:rounded-2xl"
        } group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto`}
      >
        <Link
          href={route.href}
          className="flex h-full w-full items-center gap-3 px-3.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
        >
          <Icon
            className={`size-6 shrink-0 transition-colors ${
              active ? "text-white" : "text-[#A39A94] group-hover/btn:text-[#F5F1EE]"
            }`}
            strokeWidth={1.5}
          />
          <span className="text-sm font-medium tracking-tight truncate group-data-[collapsible=icon]:hidden">
            {route.label}
          </span>
          {route.badge ? (
            <span className="ml-auto rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-[#A39A94] tabular-nums group-data-[collapsible=icon]:hidden">
              {route.badge}
            </span>
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AdminShell({ user, defaultOpen = true, children }) {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={{
        "--sidebar-width": "16.5rem",
        "--sidebar-width-icon": "4.5rem",
      }}
      className="bg-transparent text-[#F5F1EE]"
    >
      {/* Background Ambience: Base + Three Visible Radial Glows + Subtle Tactile Noise */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Warm Orange Ambient Light Top-Right (~15%) */}
        <div
          className="absolute -top-[12%] right-[-5%] h-[700px] w-[700px] rounded-full blur-[105px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 106, 31, 0.16) 0%, rgba(255, 106, 31, 0.05) 45%, transparent 70%)",
          }}
        />

        {/* Deep Warm Brown / Amber Light Bottom-Left (~17%) */}
        <div
          className="absolute -bottom-[12%] left-[-5%] h-[680px] w-[680px] rounded-full blur-[115px]"
          style={{
            background:
              "radial-gradient(circle, rgba(180, 75, 20, 0.18) 0%, rgba(120, 50, 15, 0.06) 50%, transparent 70%)",
          }}
        />

        {/* Third Faint Warm Glow Behind Upper Main Area / Hero Chart Card */}
        <div
          className="absolute top-[200px] left-[30%] h-[420px] w-[650px] rounded-full blur-[95px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 106, 31, 0.11) 0%, rgba(190, 80, 20, 0.035) 55%, transparent 70%)",
          }}
        />

        {/* Micro Noise Grain Overlay (2-3% opacity) */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating Glass Sidebar (Iconsax Rabbits Aesthetic) */}
      <Sidebar
        variant="floating"
        collapsible="icon"
        className="border-r-0 bg-transparent text-[#F5F1EE]"
      >
        {/* Sidebar Header: Centered Logo Mark in Rail / Logo + Wordmark + Admin Tag in Panel */}
        <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pt-3.5 group-data-[collapsible=icon]:items-center">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-2 py-1.5 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-11"
          >
            <Image
              src={logo}
              alt={BRAND_NAME}
              width={28}
              height={28}
              priority
              className="size-7 object-contain shrink-0"
            />
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-base tracking-tight text-[#F5F1EE]">
                {BRAND_NAME}
              </span>
              <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[#A39A94]">
                Admin
              </span>
            </div>
          </Link>
          <HairlineDivider className="group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto" />
        </SidebarHeader>

        {/* Nav Content */}
        <SidebarContent className="px-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroup className="py-0 px-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-2 group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:items-center">
                {mainRoutes.map((route) => (
                  <NavItem key={route.href} route={route} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer Area with Pinned Settings */}
        <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pb-3.5 mt-auto">
          <HairlineDivider className="group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto" />
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <NavItem route={settingsRoute} pathname={pathname} />
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Main App Content Area */}
      <SidebarInset className="bg-transparent text-[#F5F1EE]">
        {/* Glass Top Bar (64px) */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.07] bg-[#0B0807]/70 px-4 backdrop-blur-xl md:px-8">
          <SidebarTrigger className="text-[#A39A94] hover:bg-white/[0.05] hover:text-[#F5F1EE]" />

          {/* Breadcrumb Navigation */}
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap text-xs text-[#A39A94]">
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <Fragment key={crumb.href}>
                    {index > 0 ? (
                      <BreadcrumbSeparator className="text-white/20" />
                    ) : null}
                    <BreadcrumbItem className="min-w-0">
                      {last ? (
                        <BreadcrumbPage className="truncate font-medium text-[#F5F1EE]">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          asChild
                          className="truncate text-[#A39A94] hover:text-[#F5F1EE] transition-colors"
                        >
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right Action: Text-only "Back to app" ghost button + Avatar */}
          <div className="ml-auto flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="h-8 rounded-lg px-3 text-xs font-medium text-[#A39A94] hover:bg-white/[0.04] hover:text-[#F5F1EE] transition-colors"
            >
              <Link href="/">Back to app</Link>
            </Button>

            <div className="h-4 w-[1px] bg-white/[0.08]" />

            <div className="flex items-center gap-2.5">
              <span className="hidden max-w-[12rem] truncate text-xs font-medium text-[#A39A94] md:inline">
                {user?.name || user?.email}
              </span>
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="min-h-[calc(100svh-4rem)] p-6 sm:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
