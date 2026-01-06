export function calculateStreaks(days) {
  let current = 0;
  let longest = 0;
  let temp = 0;

  for (let day of days) {
    if (day.count > 0) {
      temp++;
      if (temp > longest) longest = temp;
    } else {
      temp = 0;
    }
  }

  // Calculate current streak (from today backwards)
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else break;
  }

  return { current, longest };
}
