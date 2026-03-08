import CourseDetailContent from "@/components/CourseDetailContent";

export const revalidate = 60;

type CoursePageProps = {
  params: { courseId: string };
};

export default function CourseDetailPage({ params }: CoursePageProps) {
  return <CourseDetailContent courseId={params.courseId} />;
}
