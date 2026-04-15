export default function CourseMetaLine({
  lessons = 0,
  quizzes = 0,
  className = "",
}) {
  return (
    <p className={className}>
      {lessons} lesson{lessons !== 1 ? "s" : ""} · {quizzes} quiz
      {quizzes !== 1 ? "zes" : ""}
    </p>
  );
}
