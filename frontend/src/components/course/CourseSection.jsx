import { EmployeeCourseCard } from "../EmployeeCourseCard";

export default function CourseSection({ title, courses, navigate }) {
  if (courses.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {courses.map((course) => (
          <EmployeeCourseCard
            key={course.id}
            course={course}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}
