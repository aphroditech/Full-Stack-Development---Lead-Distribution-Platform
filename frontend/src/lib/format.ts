import dayjs from "dayjs";

export const formatDateTime = (d?: string | null) =>
  d ? dayjs(d).format("MMM D, YYYY h:mm A") : "—";

export const formatDate = (d?: string | null) =>
  d ? dayjs(d).format("MMM D, YYYY") : "—";
