export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor(seconds / 60) % 60;
  const secs = seconds % 60;
  return `${hours} : ${mins} : ${secs.toString().padStart(2, '0')}`;
};

export const parseDuration = (duration: string): number => {
  const regex = /(\d+)\s*(hours?|minutes?|seconds?)/i;
  const match = regex.exec(duration);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit.includes('hour')) return value * 3600;
    if (unit.includes('minute')) return value * 60;
    if (unit.includes('second')) return value;
  }
  return 0;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours =
    hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '';
  const formattedMinutes =
    minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '';
  const formattedSeconds =
    remainingSeconds > 0
      ? `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
      : '';

  return [formattedHours, formattedMinutes, formattedSeconds]
    .filter(Boolean)
    .join(', ');
};

export const formatISOToCustomDate = (isoString: string) => {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

export const formatDurationInMins = (str: string): string => {
  const minutes = parseInt(str, 10);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  const remainingMinutes = minutes % 60;
  const remainingHours = hours % 24;
  const remainingDays = days % 30;
  const remainingMonths = months % 12;

  const formattedYears =
    years > 0 ? `${years} year${years !== 1 ? 's' : ''}` : '';
  const formattedMonths =
    remainingMonths > 0
      ? `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
      : '';
  const formattedDays =
    remainingDays > 0
      ? `${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
      : '';
  const formattedHours =
    remainingHours > 0
      ? `${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
      : '';
  const formattedMinutes =
    remainingMinutes > 0
      ? `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
      : '';

  return [
    formattedYears,
    formattedMonths,
    formattedDays,
    formattedHours,
    formattedMinutes,
  ]
    .filter(Boolean)
    .join(', ');
};
