export function calculateStreaks(days) {
  let current = 0;
  let longest = 0;
  let temp = 0;

  // Sort days by date to ensure chronological order
  const sortedDays = [...days].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate longest streak
  for (let day of sortedDays) {
    if (day.count > 0) {
      temp++;
      if (temp > longest) longest = temp;
    } else {
      temp = 0;
    }
  }

  // Calculate current streak (from today backwards)
  // Get today's date (UTC midnight)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Find the most recent day that is today or before today
  let startIndex = -1;
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    const dayDate = new Date(sortedDays[i].date);
    dayDate.setUTCHours(0, 0, 0, 0);
    const dayStr = dayDate.toISOString().split('T')[0];
    
    if (dayStr <= todayStr) {
      startIndex = i;
      break;
    }
  }

  // If we found a valid starting point, count consecutive days with commits backwards
  if (startIndex >= 0) {
    for (let i = startIndex; i >= 0; i--) {
      if (sortedDays[i].count > 0) {
        current++;
      } else {
        break;
      }
    }
  }

  return { current, longest };
}
