import { KEY_COURSES, KEY_SETTINGS } from './constants.js';

var coursesCache = null;
var settingsCache = null;

var DEFAULT_SETTINGS = { currentWeek: 1, semesterStart: '2026-09-01', vibrationEnabled: true, reminderMinutes: 5 };

var DEFAULT_COURSES = [
  { id:'c_d1', name:'\u9ad8\u7b49\u6570\u5b66', location:'A301', teacher:'\u738b\u6559\u6388', dayOfWeek:1, startPeriod:1, endPeriod:2, startTime:'08:00', endTime:'09:40', weekType:'all', weeks:[], colorIndex:0 },
  { id:'c_d2', name:'\u5927\u5b66\u82f1\u8bed', location:'B205', teacher:'\u674e\u8001\u5e08', dayOfWeek:1, startPeriod:3, endPeriod:4, startTime:'10:00', endTime:'11:40', weekType:'all', weeks:[], colorIndex:1 },
  { id:'c_d3', name:'\u7a0b\u5e8f\u8bbe\u8ba1', location:'C102', teacher:'\u8d75\u8001\u5e08', dayOfWeek:2, startPeriod:1, endPeriod:2, startTime:'08:00', endTime:'09:40', weekType:'odd', weeks:[], colorIndex:2 },
  { id:'c_d4', name:'\u7ebf\u6027\u4ee3\u6570', location:'A405', teacher:'\u9648\u6559\u6388', dayOfWeek:2, startPeriod:5, endPeriod:6, startTime:'14:00', endTime:'15:40', weekType:'even', weeks:[], colorIndex:3 },
  { id:'c_d5', name:'\u4f53\u80b2', location:'\u4f53\u80b2\u9986', teacher:'\u5b59\u8001\u5e08', dayOfWeek:3, startPeriod:3, endPeriod:4, startTime:'10:00', endTime:'11:40', weekType:'all', weeks:[], colorIndex:4 },
  { id:'c_d6', name:'\u6570\u636e\u7ed3\u6784', location:'C301', teacher:'\u5468\u6559\u6388', dayOfWeek:4, startPeriod:1, endPeriod:2, startTime:'08:00', endTime:'09:40', weekType:'all', weeks:[], colorIndex:5 },
  { id:'c_d7', name:'\u601d\u653f\u8bfe', location:'D101', teacher:'\u5218\u8001\u5e08', dayOfWeek:4, startPeriod:5, endPeriod:6, startTime:'14:00', endTime:'15:40', weekType:'all', weeks:[], colorIndex:6 },
  { id:'c_d8', name:'\u5b9e\u9a8c\u8bfe', location:'Lab201', teacher:'\u5434\u8001\u5e08', dayOfWeek:5, startPeriod:1, endPeriod:4, startTime:'08:00', endTime:'11:40', weekType:'odd', weeks:[], colorIndex:7 },
  { id:'c_s1', name:'\u6668\u8bfb', location:'\u6559\u5ba4A', teacher:'\u5f20\u8001\u5e08', dayOfWeek:6, startPeriod:1, endPeriod:2, startTime:'07:00', endTime:'08:40', weekType:'all', weeks:[], colorIndex:0 },
  { id:'c_s2', name:'\u9009\u4fee\u8bfe', location:'E201', teacher:'\u5f20\u6559\u6388', dayOfWeek:6, startPeriod:3, endPeriod:4, startTime:'09:00', endTime:'10:40', weekType:'all', weeks:[], colorIndex:1 },
  { id:'c_s3', name:'\u6570\u5b66\u5efa\u6a21', location:'B301', teacher:'\u674e\u6559\u6388', dayOfWeek:6, startPeriod:5, endPeriod:6, startTime:'11:00', endTime:'12:40', weekType:'all', weeks:[], colorIndex:2 },
  { id:'c_s4', name:'\u7f16\u7a0b\u5b9e\u8df5', location:'Lab102', teacher:'\u738b\u8001\u5e08', dayOfWeek:6, startPeriod:9, endPeriod:10, startTime:'16:00', endTime:'17:40', weekType:'all', weeks:[], colorIndex:4 },
  { id:'c_s5', name:'\u82f1\u8bed\u89d2', location:'\u5916\u8bed\u697c', teacher:'\u5916\u6559Tom', dayOfWeek:6, startPeriod:7, endPeriod:8, startTime:'19:00', endTime:'20:40', weekType:'all', weeks:[], colorIndex:7 },
  { id:'c_w1', name:'\u9605\u8bfb', location:'\u56fe\u4e66\u9986', teacher:'', dayOfWeek:7, startPeriod:1, endPeriod:2, startTime:'08:00', endTime:'09:40', weekType:'all', weeks:[], colorIndex:0 },
  { id:'c_w2', name:'\u7f16\u7a0b\u7ec3\u4e60', location:'Lab101', teacher:'\u738b\u8001\u5e08', dayOfWeek:7, startPeriod:3, endPeriod:4, startTime:'10:00', endTime:'11:40', weekType:'all', weeks:[], colorIndex:1 },
  { id:'c_w3', name:'\u5409\u4ed6\u8bfe', location:'\u97f3\u4e50\u5ba4', teacher:'\u6797\u8001\u5e08', dayOfWeek:7, startPeriod:5, endPeriod:6, startTime:'14:00', endTime:'15:40', weekType:'all', weeks:[], colorIndex:2 },
  { id:'c_w4', name:'\u8dd1\u6b65', location:'\u64cd\u573a', teacher:'', dayOfWeek:7, startPeriod:7, endPeriod:8, startTime:'16:00', endTime:'17:40', weekType:'all', weeks:[], colorIndex:3 },
  { id:'c_w5', name:'\u7535\u5f71\u9274\u8d4f', location:'A101', teacher:'\u5468\u8001\u5e08', dayOfWeek:7, startPeriod:9, endPeriod:10, startTime:'19:00', endTime:'20:40', weekType:'all', weeks:[], colorIndex:4 },
  { id:'c_w6', name:'\u6444\u5f71', location:'\u6237\u5916', teacher:'\u9648\u8001\u5e08', dayOfWeek:7, startPeriod:3, endPeriod:4, startTime:'09:00', endTime:'10:40', weekType:'all', weeks:[], colorIndex:5 },
  { id:'c_w7', name:'\u70d8\u7119', location:'\u751f\u6d3b\u9986', teacher:'\u5218\u8001\u5e08', dayOfWeek:7, startPeriod:5, endPeriod:6, startTime:'11:00', endTime:'12:40', weekType:'all', weeks:[], colorIndex:6 },
  { id:'c_w8', name:'\u745c\u4f3d', location:'\u5065\u8eab\u623f', teacher:'\u8d75\u8001\u5e08', dayOfWeek:7, startPeriod:7, endPeriod:8, startTime:'14:00', endTime:'15:40', weekType:'all', weeks:[], colorIndex:7 },
  { id:'c_w9', name:'\u5fd7\u613f\u670d\u52a1', location:'\u793e\u533a', teacher:'', dayOfWeek:7, startPeriod:9, endPeriod:10, startTime:'16:00', endTime:'17:40', weekType:'all', weeks:[], colorIndex:0 },
  { id:'c_w10', name:'\u81ea\u4e60', location:'\u56fe\u4e66\u9986', teacher:'', dayOfWeek:7, startPeriod:9, endPeriod:10, startTime:'19:00', endTime:'20:40', weekType:'all', weeks:[], colorIndex:1 }
];

function loadCourses(callback) {
  if (!coursesCache) coursesCache = DEFAULT_COURSES.slice();
  callback(coursesCache);
}

function saveCourses(courses, callback) {
  coursesCache = courses;
  if (callback) callback(true);
}

function addCourse(course, callback) {
  loadCourses(function (c) { var l = c.slice(); l.push(course); saveCourses(l, callback); });
}

function updateCourse(upd, callback) {
  loadCourses(function (c) {
    var l = c.slice();
    for (var i = 0; i < l.length; i++) { if (l[i].id === upd.id) { l[i] = upd; break; } }
    saveCourses(l, callback);
  });
}

function deleteCourse(id, callback) {
  loadCourses(function (c) {
    var r = []; for (var i = 0; i < c.length; i++) { if (c[i].id !== id) r.push(c[i]); }
    saveCourses(r, callback);
  });
}

function findCourse(id, callback) {
  loadCourses(function (c) {
    var f = null;
    for (var i = 0; i < c.length; i++) { if (c[i].id === id) { f = c[i]; break; } }
    callback(f);
  });
}

function getCoursesForDay(dayOfWeek, currentWeek, callback) {
  loadCourses(function (c) {
    var r = [];
    for (var i = 0; i < c.length; i++) {
      var x = c[i];
      if (x.dayOfWeek !== dayOfWeek) continue;
      if (x.weekType === 'all') r.push(x);
      else if (x.weekType === 'odd' && currentWeek % 2 === 1) r.push(x);
      else if (x.weekType === 'even' && currentWeek % 2 === 0) r.push(x);
    }
    r.sort(function (a, b) {
      var diff = a.startPeriod - b.startPeriod;
      if (diff !== 0) return diff;
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
    callback(r);
  });
}

function loadSettings(callback) {
  if (!settingsCache) settingsCache = DEFAULT_SETTINGS;
  callback(settingsCache);
}

function saveSettings(settings, callback) {
  settingsCache = settings;
  if (callback) callback(true);
}

function clearCache() {
  coursesCache = null;
  settingsCache = null;
}

export default {
  loadCourses: loadCourses,
  saveCourses: saveCourses,
  addCourse: addCourse,
  updateCourse: updateCourse,
  deleteCourse: deleteCourse,
  findCourse: findCourse,
  getCoursesForDay: getCoursesForDay,
  loadSettings: loadSettings,
  saveSettings: saveSettings,
  clearCache: clearCache
};