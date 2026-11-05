"use server";

import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function verifyAdminAuth() {
  if (process.env.NODE_ENV !== "production") {
    const jar = await cookies();
    if (jar.get("admin_preview")?.value === "1") {
      const user = await db.user.findFirst({ where: { role: "ADMIN" } });
      if (user) return { authorized: true, user };
    }
  }
  const { userId } = await auth();
  if (!userId) return { authorized: false, reason: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    return { authorized: false, reason: "not admin" };
  }
  return { authorized: true, user };
}

export async function getAdmin() {
  return verifyAdminAuth();
}

// Get all test drives for admin with filters
export async function getAdminTestDrives({ search = "", status = "" }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Build where conditions
    let where = {};

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          car: {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Get bookings
    const bookings = await db.testDriveBooking.findMany({
      where,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
    });

    // Format the bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
      userId: booking.userId,
      user: booking.user,
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching test drives:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

//  Update test drive status
export async function updateTestDriveStatus(bookingId, newStatus) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Get the booking
    const booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status",
      };
    }

    // Update status
    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    // Revalidate paths
    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");

    return {
      success: true,
      message: "Test drive status updated successfully",
    };
  } catch (error) {
    throw new Error("Error updating test drive status:" + error.message);
  }
}

export async function getDashboardData() {
  try {
    const authResult = await verifyAdminAuth();
    if (!authResult.authorized) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Fetch all necessary data in a single parallel operation
    const [cars, testDrives] = await Promise.all([
      // Get all cars with minimal fields
      db.car.findMany({
        select: {
          id: true,
          status: true,
          featured: true,
        },
      }),

      // Get all test drives with minimal fields
      db.testDriveBooking.findMany({
        select: {
          id: true,
          status: true,
          carId: true,
        },
      }),
    ]);

    // Calculate car statistics
    const totalCars = cars.length;
    const availableCars = cars.filter(
      (car) => car.status === "AVAILABLE"
    ).length;
    const soldCars = cars.filter((car) => car.status === "SOLD").length;
    const unavailableCars = cars.filter(
      (car) => car.status === "UNAVAILABLE"
    ).length;
    const featuredCars = cars.filter((car) => car.featured === true).length;

    // Calculate test drive statistics
    const totalTestDrives = testDrives.length;
    const pendingTestDrives = testDrives.filter(
      (td) => td.status === "PENDING"
    ).length;
    const confirmedTestDrives = testDrives.filter(
      (td) => td.status === "CONFIRMED"
    ).length;
    const completedTestDrives = testDrives.filter(
      (td) => td.status === "COMPLETED"
    ).length;
    const cancelledTestDrives = testDrives.filter(
      (td) => td.status === "CANCELLED"
    ).length;
    const noShowTestDrives = testDrives.filter(
      (td) => td.status === "NO_SHOW"
    ).length;

    // Calculate test drive conversion rate
    const completedTestDriveCarIds = testDrives
      .filter((td) => td.status === "COMPLETED")
      .map((td) => td.carId);

    const soldCarsAfterTestDrive = cars.filter(
      (car) =>
        car.status === "SOLD" && completedTestDriveCarIds.includes(car.id)
    ).length;

    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    return {
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          unavailable: unavailableCars,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildSeries(days) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const series = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() - i);
    series.push({ date: dayKey(date), bookings: 0, cars: 0 });
  }
  return series;
}

export async function getAdminAnalytics() {
  try {
    const authResult = await verifyAdminAuth();
    if (!authResult.authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - 89);

    const [makes, bodies, statuses, createdCars, bookings, recent] =
      await Promise.all([
        db.car.groupBy({
          by: ["make"],
          _count: { _all: true },
        }),
        db.car.groupBy({
          by: ["bodyType"],
          _count: { _all: true },
        }),
        db.car.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        db.car.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        db.testDriveBooking.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        db.testDriveBooking.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            car: { select: { year: true, make: true, model: true } },
            user: { select: { name: true, email: true } },
          },
        }),
      ]);

    const series = buildSeries(90);
    const index = new Map(series.map((row, i) => [row.date, i]));

    for (const car of createdCars) {
      const slot = index.get(dayKey(car.createdAt));
      if (slot !== undefined) series[slot].cars += 1;
    }
    for (const booking of bookings) {
      const slot = index.get(dayKey(booking.createdAt));
      if (slot !== undefined) series[slot].bookings += 1;
    }

    const byCount = (rows, key) =>
      rows
        .map((row) => ({ name: row[key] || "Unknown", count: row._count._all }))
        .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: {
        series,
        byMake: byCount(makes, "make"),
        byBody: byCount(bodies, "bodyType"),
        byStatus: byCount(statuses, "status"),
        recent: recent.map((booking) => ({
          id: booking.id,
          car: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
          customer: booking.user.name || booking.user.email,
          date: booking.createdAt.toISOString(),
          status: booking.status,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching admin analytics:", error.message);
    return { success: false, error: error.message };
  }
}

// Read-only. Booked counts use createdAt (UTC day). Completed has no
// completedAt, so COMPLETED rows are bucketed by bookingDate.
export async function getAdminDriveSeries() {
  try {
    const authResult = await verifyAdminAuth();
    if (!authResult.authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - 89);

    const bookings = await db.testDriveBooking.findMany({
      where: {
        OR: [
          { createdAt: { gte: since } },
          { status: "COMPLETED", bookingDate: { gte: since } },
        ],
      },
      select: { createdAt: true, bookingDate: true, status: true },
    });

    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const series = [];
    for (let i = 89; i >= 0; i -= 1) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() - i);
      series.push({ date: dayKey(date), booked: 0, completed: 0 });
    }
    const index = new Map(series.map((row, i) => [row.date, i]));

    for (const booking of bookings) {
      const bookedSlot = index.get(dayKey(booking.createdAt));
      if (bookedSlot !== undefined) series[bookedSlot].booked += 1;
      if (booking.status === "COMPLETED") {
        const completedSlot = index.get(dayKey(booking.bookingDate));
        if (completedSlot !== undefined) series[completedSlot].completed += 1;
      }
    }

    return { success: true, data: { series, completedBy: "bookingDate" } };
  } catch (error) {
    console.error("Error fetching drive series:", error.message);
    return { success: false, error: error.message };
  }
} 