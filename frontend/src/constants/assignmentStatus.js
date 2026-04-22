export const ASSIGNMENT_STATUS_META = {
  assigned: {
    badgeClass: "bg-muted text-muted-foreground border-border",
    badgeLabel: "Assigned",
    filterLabel: "Assigned",
    deadlineSummaryLabel: null,
    deadlineText: "Assigned",
    deadlineTone: "outline",
  },
  in_progress: {
    badgeClass:
      "border-blue-500/35 bg-blue-500/18 text-blue-700 dark:text-blue-400",
    badgeLabel: "In Progress",
    filterLabel: "In Progress",
    deadlineSummaryLabel: null,
    deadlineText: null,
    deadlineTone: "outline",
  },
  completed: {
    badgeClass:
      "border-green-500/35 bg-green-500/18 text-green-700 dark:text-green-400",
    badgeLabel: "Completed",
    filterLabel: "Completed",
    deadlineSummaryLabel: null,
    deadlineText: "Completed",
    deadlineTone: "outline",
  },
  completed_on_time: {
    badgeClass:
      "border-green-500/35 bg-green-500/18 text-green-700 dark:text-green-400",
    badgeLabel: "On Time",
    filterLabel: "Completed On Time",
    deadlineSummaryLabel: "On time",
    deadlineText: "Completed on time",
    deadlineTone: "outline",
  },
  completed_late: {
    badgeClass:
      "border-amber-500/35 bg-amber-500/18 text-amber-700 dark:text-amber-400",
    badgeLabel: "Late",
    filterLabel: "Completed Late",
    deadlineSummaryLabel: "Late",
    deadlineText: "Completed late",
    deadlineTone: "secondary",
  },
  overdue: {
    badgeClass:
      "border-red-500/35 bg-red-500/18 text-red-700 dark:text-red-400",
    badgeLabel: "Overdue",
    filterLabel: "Overdue",
    deadlineSummaryLabel: "Overdue",
    deadlineText: "Overdue",
    deadlineTone: "destructive",
  },
};

export const ASSIGNMENT_FILTER_STATUSES = Object.keys(ASSIGNMENT_STATUS_META);

export function getAssignmentStatus(source) {
  if (!source) return "assigned";
  if (typeof source === "string") return source;
  return source.deadline_status || source.status || "assigned";
}

export function getAssignmentStatusMeta(source) {
  const status = getAssignmentStatus(source);
  return ASSIGNMENT_STATUS_META[status] || ASSIGNMENT_STATUS_META.assigned;
}

export function getDeadlineSummaryLabel(source) {
  return getAssignmentStatusMeta(source).deadlineSummaryLabel;
}

export function getDeadlineText(source) {
  return getAssignmentStatusMeta(source).deadlineText;
}

export function getDeadlineTone(source) {
  return getAssignmentStatusMeta(source).deadlineTone;
}

export function isLateOrOverdue(source) {
  const status = getAssignmentStatus(source);
  return status === "completed_late" || status === "overdue";
}
