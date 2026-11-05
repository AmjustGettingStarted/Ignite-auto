import { getAdminAnalytics, getAdminDriveSeries, getDashboardData } from "@/actions/admin";
import { BRAND_NAME } from "@/lib/brand";
import { Dashboard } from "./_components/dashboard";

export const metadata = {
  title: `Dashboard | ${BRAND_NAME}`,
  description: "Dealership dashboard for inventory, bookings, and sales.",
};

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  const [dashboardData, analytics, drives] = await Promise.all([
    getDashboardData(),
    getAdminAnalytics(),
    getAdminDriveSeries(),
  ]);

  return (
    <div className="mx-auto max-w-[1440px]">
      <Dashboard initialData={dashboardData} analytics={analytics} drives={drives} />
    </div>
  );
};

export default AdminPage;
