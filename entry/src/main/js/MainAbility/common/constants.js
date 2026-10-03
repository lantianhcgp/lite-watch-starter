// Course color palette (8 colors - vibrant on dark)
export var COURSE_COLORS = [
  '#6C63FF', '#00D9FF', '#FF6B6B', '#51CF66',
  '#FFD43B', '#CC5DE8', '#20C997', '#FF922B'
];

// Period schedule
export var PERIOD_TIMES = [
  { period: 1, start: '08:00', end: '08:45' },
  { period: 2, start: '08:55', end: '09:40' },
  { period: 3, start: '10:00', end: '10:45' },
  { period: 4, start: '10:55', end: '11:40' },
  { period: 5, start: '14:00', end: '14:45' },
  { period: 6, start: '14:55', end: '15:40' },
  { period: 7, start: '16:00', end: '16:45' },
  { period: 8, start: '16:55', end: '17:40' },
  { period: 9, start: '19:00', end: '19:45' },
  { period: 10, start: '19:55', end: '20:40' }
];

// Day names
export var DAY_NAMES = ['', '\u5468\u4e00', '\u5468\u4e8c', '\u5468\u4e09', '\u5468\u56db', '\u5468\u4e94', '\u5468\u516d', '\u5468\u65e5'];
export var DAY_NAMES_SHORT = ['', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u65e5'];

// Week types
export var WEEK_TYPES = [
  { value: 'all', label: '\u5168\u90e8' },
  { value: 'odd', label: '\u5355\u5468' },
  { value: 'even', label: '\u53cc\u5468' }
];

// Picker data
export var PERIOD_RANGE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
export var DAY_RANGE = ['\u5468\u4e00', '\u5468\u4e8c', '\u5468\u4e09', '\u5468\u56db', '\u5468\u4e94', '\u5468\u516d', '\u5468\u65e5'];

// Storage keys
export var KEY_COURSES = 'schedule_courses';
export var KEY_SETTINGS = 'schedule_settings';
export var KEY_VERSION = 'schedule_version';