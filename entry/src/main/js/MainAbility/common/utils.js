function getDayOfWeek() {
  var d = new Date().getDay();
  return d === 0 ? 7 : d;
}

function timeToMinutes(timeStr) {
  var parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function getCurrentMinutes() {
  var now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function isCourseActive(course) {
  var now = getCurrentMinutes();
  var start = timeToMinutes(course.startTime);
  var end = timeToMinutes(course.endTime);
  return getDayOfWeek() === course.dayOfWeek && now >= start && now < end;
}

function isCourseInWeek(course, currentWeek) {
  if (course.weekType === 'all') return true;
  if (course.weekType === 'odd') return currentWeek % 2 === 1;
  if (course.weekType === 'even') return currentWeek % 2 === 0;
  return true;
}

function getNextCourseCountdown(courses, currentWeek) {
  var now = getCurrentMinutes();
  var today = getDayOfWeek();
  var nextCourse = null;
  var minDiff = 9999;
  for (var i = 0; i < courses.length; i++) {
    var c = courses[i];
    if (!isCourseInWeek(c, currentWeek)) continue;
    if (c.dayOfWeek !== today) continue;
    var start = timeToMinutes(c.startTime);
    var diff = start - now;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextCourse = c;
    }
  }
  return { course: nextCourse, minutesLeft: minDiff };
}

function formatCountdown(minutes) {
  if (minutes < 0) return '';
  if (minutes < 60) return minutes + '\u5206\u949f\u540e';
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return h + '\u65f6' + (m > 0 ? m + '\u5206' : '') + '\u540e';
}

function generateId() {
  return 'c_' + Date.now();
}

function calculateCurrentWeek(semesterStart) {
  if (!semesterStart) return 1;
  var start = new Date(semesterStart);
  var now = new Date();
  var diffMs = now.getTime() - start.getTime();
  var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 1;
  return Math.floor(diffDays / 7) + 1;
}

function getDateString() {
  var now = new Date();
  return (now.getMonth() + 1) + '\u6708' + now.getDate() + '\u65e5';
}

export default {
  getDayOfWeek: getDayOfWeek,
  timeToMinutes: timeToMinutes,
  getCurrentMinutes: getCurrentMinutes,
  isCourseActive: isCourseActive,
  isCourseInWeek: isCourseInWeek,
  getNextCourseCountdown: getNextCourseCountdown,
  formatCountdown: formatCountdown,
  generateId: generateId,
  calculateCurrentWeek: calculateCurrentWeek,
  getDateString: getDateString
};