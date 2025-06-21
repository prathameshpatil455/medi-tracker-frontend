/**
 * Converts a 24-hour format time string (e.g., "14:30") to a 12-hour format with AM/PM (e.g., "2:30 PM").
 * @param timeStr The time string in "HH:mm" format.
 * @returns The formatted 12-hour time string.
 */
export function formatTime12Hour(timeStr: string): string {
  if (!timeStr || !timeStr.includes(":")) {
    return "N/A"; // Return a default value for invalid input
  }

  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return "N/A"; // Handle parsing errors
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  const minutesFormatted = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${minutesFormatted} ${ampm}`;
}
