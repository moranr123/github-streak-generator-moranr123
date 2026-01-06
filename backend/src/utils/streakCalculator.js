export function calculateStreaks(contributions) {
  let current = 0;
  let longest = 0;
  let temp = 0;

  for (let day of contributions) {
    if (day.count > 0) {
      temp++;
      current = temp;
      if (temp > longest) longest = temp;
    } else {
      temp = 0;
    }
  }

  return { current, longest };
}
