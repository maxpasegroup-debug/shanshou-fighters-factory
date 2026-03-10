import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { handleApiError, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return unauthorized();
    }

    await connectToDatabase();
    const [users, courses] = await Promise.all([User.countDocuments(), Course.countDocuments()]);
    const enrollmentRevenueAgg = await Enrollment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      { $group: { _id: null, total: { $sum: "$course.price" } } },
    ]);
    const bookingRevenueAgg = await Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const totalRevenue =
      Number(enrollmentRevenueAgg[0]?.total || 0) + Number(bookingRevenueAgg[0]?.total || 0);

    return NextResponse.json({
      totalUsers: users,
      totalCourses: courses,
      totalRevenue,
    });
  } catch (error) {
    return handleApiError("admin/analytics", error);
  }
}
