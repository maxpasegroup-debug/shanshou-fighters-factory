import Enrollment from "@/models/Enrollment";

export async function hasCourseEntitlement(userId: string, courseId: string) {
  const enrollment = await Enrollment.findOne({ userId, courseId }).lean();
  return Boolean(enrollment);
}
