export const coursesApi = {
  list: "/api/courses",
  byId: (courseId: string) => `/api/courses/${courseId}`,
  upload: "/api/courses/upload",
};
