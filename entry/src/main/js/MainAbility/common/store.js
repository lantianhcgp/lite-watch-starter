/* 课表文档持久化 —— 单一权威文件 internal://app/schedule.json
 *
 * 格式规范：docs/schedule-format.md（schema/version/rev/updatedAt 为同步而设）
 * 要点：
 * - 整文档读写，课表体量 <10KB，不做增量
 * - 每次落盘 rev+1、updatedAt=Date.now()，同步侧用「rev 大者胜」解决冲突
 * - 序列化按固定字段顺序 + 确定性排序 → 同样内容必得同样字节，方便 diff/哈希
 * - 首次安装：从 rawfile/seed-schedule.json（随包种子，与本文档同格式）灌入
 * - 文件损坏时不丢数据：原文先备份到 schedule.bad.json，再重新灌种子
 *
 * 注意：种子放在 rawfile 资产里而不是 JS 常量里 —— 每页是独立 bundle，
 * 23 门课的字面量进 JS 会把页面体积顶到 48KB 红线（实测估算 97%，已规避）
 */
import fs from './fs.js';

var URI = 'internal://app/schedule.json';
var BAD_URI = 'internal://app/schedule.bad.json';
var SEED_URI = 'internal://app/rawfile/seed-schedule.json';
var SCHEMA = 'elcton.schedule';
var VERSION = 1;

/* ── 归一化：读进来的任何对象都过一遍，字段缺省补齐、类型纠正 ── */
function num(v, d) { var n = Number(v); return isNaN(n) ? d : n; }
function str(v) { return (v === undefined || v === null) ? '' : String(v); }
function stripBom(s) { s = String(s); return s.charCodeAt(0) === 0xFEFF ? s.substring(1) : s; }
function isArray(v) { return Object.prototype.toString.call(v) === '[object Array]'; }

function normSettings(s) {
    s = s || {};
    return {
        semesterStart: str(s.semesterStart) || '2026-09-01',
        currentWeek: num(s.currentWeek, 1),
        vibrationEnabled: s.vibrationEnabled === undefined ? true : !!s.vibrationEnabled,
        reminderMinutes: num(s.reminderMinutes, 5)
    };
}

function normCourse(c) {
    if (!c || typeof c !== 'object' || !c.id) { return null; }
    var weeks = [];
    if (isArray(c.weeks)) {
        for (var i = 0; i < c.weeks.length; i++) { weeks.push(num(c.weeks[i], 0)); }
    }
    return {
        id: str(c.id),
        name: str(c.name),
        location: str(c.location),
        teacher: str(c.teacher),
        dayOfWeek: num(c.dayOfWeek, 1),
        startPeriod: num(c.startPeriod, 1),
        endPeriod: num(c.endPeriod, 1),
        startTime: str(c.startTime),
        endTime: str(c.endTime),
        weekType: str(c.weekType) || 'all',
        weeks: weeks,
        colorIndex: num(c.colorIndex, 0)
    };
}

function normCourses(list) {
    var out = [];
    if (!isArray(list)) { return out; }
    for (var i = 0; i < list.length; i++) {
        var c = normCourse(list[i]);
        if (c) { out.push(c); }
    }
    return out;
}

/* 解析任意 JSON 文本 → 合法文档；不认识/损坏返回 null */
function parseDoc(text) {
    var p = null;
    try { p = JSON.parse(stripBom(text)); } catch (e) { return null; }
    if (!p || typeof p !== 'object' || p.schema !== SCHEMA) { return null; }
    return {
        schema: SCHEMA,
        version: num(p.version, VERSION),
        rev: num(p.rev, 1),
        updatedAt: num(p.updatedAt, 0),
        settings: normSettings(p.settings),
        courses: normCourses(p.courses)
    };
}

/* 兜底文档：连种子资产都读不到时用（空课表，设置仍可用） */
function newDoc() {
    return {
        schema: SCHEMA, version: VERSION, rev: 0, updatedAt: 0,
        settings: normSettings(null), courses: []
    };
}

/* ── 序列化：字段顺序固定、课程确定性排序 → 同内容同字节 ── */
function courseCmp(a, b) {
    if (a.dayOfWeek !== b.dayOfWeek) { return a.dayOfWeek - b.dayOfWeek; }
    if (a.startPeriod !== b.startPeriod) { return a.startPeriod - b.startPeriod; }
    if (a.startTime !== b.startTime) { return a.startTime < b.startTime ? -1 : (a.startTime > b.startTime ? 1 : 0); }
    return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
}

function courseJSON(c) {
    return {
        id: c.id, name: c.name, location: c.location, teacher: c.teacher,
        dayOfWeek: c.dayOfWeek, startPeriod: c.startPeriod, endPeriod: c.endPeriod,
        startTime: c.startTime, endTime: c.endTime, weekType: c.weekType,
        weeks: c.weeks, colorIndex: c.colorIndex
    };
}

function serialize(doc) {
    var courses = doc.courses.slice().sort(courseCmp);
    var out = {
        schema: SCHEMA,
        version: VERSION,
        rev: doc.rev,
        updatedAt: doc.updatedAt,
        settings: {
            semesterStart: doc.settings.semesterStart,
            currentWeek: doc.settings.currentWeek,
            vibrationEnabled: doc.settings.vibrationEnabled,
            reminderMinutes: doc.settings.reminderMinutes
        },
        courses: []
    };
    for (var i = 0; i < courses.length; i++) { out.courses.push(courseJSON(courses[i])); }
    return JSON.stringify(out);
}

/* ── 首次安装：读随包种子 → 落盘成正式文档 ── */
function seed(cb) {
    fs.readFile(SEED_URI, function (code, text) {
        var doc = null;
        if (code === undefined || code === null) { doc = parseDoc(text); }
        if (!doc) { doc = newDoc(); }        // 种子缺失/损坏 → 空课表兜底
        doc.rev = 0;
        doc.updatedAt = 0;
        persist(doc, function () { cb(undefined, doc); });
    });
}

/* ── 读：不存在 → 灌种子；损坏 → 备份原文后重建 ── */
function load(cb) {
    fs.readFile(URI, function (code, text) {
        if (code !== undefined && code !== null) {          // 301 = 首次安装
            seed(cb);
            return;
        }
        var doc = parseDoc(text);
        if (!doc) {
            fs.backup(BAD_URI, String(text), function () {
                console.error('schedule.json 损坏，原文已备份到 schedule.bad.json');
                seed(cb);
            });
            return;
        }
        cb(undefined, doc);
    });
}

/* ── 写：串行队列，防止两次落盘交错把文件写花 ── */
var wQueue = [];
var wBusy = false;

function pump() {
    if (wBusy) { return; }
    var item = wQueue.shift();
    if (!item) { return; }
    wBusy = true;
    fs.writeFile(URI, item.text, function (code) {
        wBusy = false;
        if (item.cb) { item.cb(code); }
        pump();
    });
}

function persist(doc, cb) {
    doc.rev = num(doc.rev, 0) + 1;
    doc.updatedAt = new Date().getTime();
    var text = serialize(doc);
    wQueue.push({ text: text, cb: cb });
    pump();
}

export default {
    URI: URI,
    BAD_URI: BAD_URI,
    SEED_URI: SEED_URI,
    SCHEMA: SCHEMA,
    VERSION: VERSION,
    newDoc: newDoc,
    parseDoc: parseDoc,
    serialize: serialize,
    load: load,
    persist: persist
};
