export function getToday() {
  var now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function buildMonthGrid(year, month) {
  var firstDay = new Date(year, month, 1).getDay();
  var days = daysInMonth(year, month);
  var prev = (firstDay + 6) % 7;
  var cells = [];
  for (var i = 0; i < prev; i++) { cells.push({ type: "empty", index: i }); }
  for (var d = 1; d <= days; d++) { cells.push({ type: "day", day: d, index: prev + (d - 1) }); }
  while (cells.length % 7 !== 0) { cells.push({ type: "empty", index: cells.length }); }
  return cells;
}

export function normalizeDay(year, month, day) {
  var max = daysInMonth(year, month);
  if (day < 1) { return 1; }
  if (day > max) { return max; }
  return day;
}
