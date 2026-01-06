export function calculateStreaks(days) {
  if (!days || days.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort days by date to ensure chronological order (oldest to newest)
  const sortedDays = [...days].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // Calculate longest streak
  let longest = 0;
  let temp = 0;
  for (let day of sortedDays) {
    if (day.count > 0) {
      temp++;
      if (temp > longest) longest = temp;
    } else {
      temp = 0;
    }
  }

  // Calculate current streak (from today backwards, counting consecutive days with commits)
  let current = 0;
  
  // Get today's date in YYYY-MM-DD format (UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Find today's index or the most recent day in the data
  let todayIndex = -1;
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    const dayDate = new Date(sortedDays[i].date + 'T00:00:00Z');
    const dayStr = dayDate.toISOString().split('T')[0];
    
    if (dayStr <= todayStr) {
      todayIndex = i;
      break;
    }
  }

  // If we found a valid starting point, count backwards
  if (todayIndex >= 0) {
    const todayDay = sortedDays[todayIndex];
    
    // If today (or the most recent day) has no commits, current streak is 0
    if (todayDay.count === 0) {
      current = 0;
    } else {
      // Start from today and count backwards
      current = 1; // Today has commits
      
      // Count backwards through consecutive days with commits
      for (let i = todayIndex - 1; i >= 0; i--) {
        const currentDay = sortedDays[i + 1];
        const prevDay = sortedDays[i];
        
        // Check if previous day has commits
        if (prevDay.count === 0) {
          break; // Streak broken
        }
        
        // Check if days are consecutive (exactly 1 day apart)
        const currentDate = new Date(currentDay.date + 'T00:00:00Z');
        const prevDate = new Date(prevDay.date + 'T00:00:00Z');
        const daysDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 1) {
          current++; // Consecutive day with commits
        } else {
          break; // Gap detected, streak broken
        }
      }
    }
  }

  return { current, longest };
}
