/* 课表数据层 —— 对外 API 与改造前完全一致（全部回调式），内部换成文件持久化
 *
 * 为什么必须落盘：Lite 每个页面是独立 webpack bundle，各页的模块实例互不相通，
 * 只存在内存里的课程改了别的页看不见；且 app 重启即丢（改造前的两个真机表现）。
 * 现在 internal://app/schedule.json 是唯一权威数据源，详见 docs/schedule-format.md。
 */
import store from './store.js';

var coursesCache = null;
var settingsCache = null;
var docCache = null;
var loading = false;
var loadWaiters = [];

/* 首次访问才读文件；并发调用共享同一次读，读完统一放行 */
function ensureLoaded(cb) {
    if (docCache) { cb(); return; }
    loadWaiters.push(cb);
    if (loading) { return; }
    loading = true;
    store.load(function (err, doc) {
        docCache = doc;
        coursesCache = doc.courses;
        settingsCache = doc.settings;
        loading = false;
        var q = loadWaiters;
        loadWaiters = [];
        for (var i = 0; i < q.length; i++) { q[i](); }
    });
}

/* 写盘统一走这里：改内存 → persist（rev+1、updatedAt 刷新）→ 回调成败 */
function commit(nextCourses, nextSettings, callback) {
    ensureLoaded(function () {
        if (nextCourses) {
            coursesCache = nextCourses;
            docCache.courses = nextCourses;
        }
        if (nextSettings) {
            settingsCache = nextSettings;
            docCache.settings = nextSettings;
        }
        store.persist(docCache, function (code) {
            if (callback) { callback(code === undefined || code === null); }
        });
    });
}

function loadCourses(callback) {
    ensureLoaded(function () { callback(coursesCache); });
}

function saveCourses(courses, callback) {
    commit(courses, null, callback);
}

function addCourse(course, callback) {
    loadCourses(function (c) {
        var l = c.slice();
        l.push(course);
        saveCourses(l, callback);
    });
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
        var r = [];
        for (var i = 0; i < c.length; i++) { if (c[i].id !== id) { r.push(c[i]); } }
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
            if (x.dayOfWeek !== dayOfWeek) { continue; }
            if (x.weekType === 'all') { r.push(x); }
            else if (x.weekType === 'odd' && currentWeek % 2 === 1) { r.push(x); }
            else if (x.weekType === 'even' && currentWeek % 2 === 0) { r.push(x); }
        }
        r.sort(function (a, b) {
            var diff = a.startPeriod - b.startPeriod;
            if (diff !== 0) { return diff; }
            if (a.startTime < b.startTime) { return -1; }
            if (a.startTime > b.startTime) { return 1; }
            return 0;
        });
        callback(r);
    });
}

function loadSettings(callback) {
    ensureLoaded(function () { callback(settingsCache); });
}

function saveSettings(settings, callback) {
    commit(null, settings, callback);
}

/* 丢内存缓存 → 下次访问重新读文件。
 * 每个页面是独立 bundle（各自一份缓存），所以退出页面时丢缓存 = 保证回来读到
 * 别的页面写进去的最新数据；同步功能改完文件也靠它生效。 */
function clearCache() {
    coursesCache = null;
    settingsCache = null;
    docCache = null;
    loading = false;
    loadWaiters = [];
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
    clearCache: clearCache,
    /* 给同步功能用：拿到/换掉整份文档（见 docs/schedule-format.md 同步一节） */
    getDoc: function (callback) {
        ensureLoaded(function () { callback(docCache); });
    },
    replaceDoc: function (doc, callback) {
        docCache = doc;
        coursesCache = doc.courses;
        settingsCache = doc.settings;
        store.persist(docCache, function (code) {
            if (callback) { callback(code === undefined || code === null); }
        });
    }
};
