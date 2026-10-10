import router from '../../common/router.js';
import data from '../../common/data.js';
import fs from '../../common/fs.js';

/* 课程表同步页 —— 从手机侧虚拟主机拉取 schedule.json 导入本地
 *
 * 云端：http://listenword.qingyun3.com/elcton/
 *   schedule.json  ← 手机网页编辑保存（save.php 落盘，rev 服务端单调递增）
 *   health.txt     ← 几字节探活，进页面自动打一次，用来分清「网络不通」和「数据有问题」
 *
 * 导入规则（docs/schedule-format.md §四）：
 *   1. schema 必须是 elcton.schedule；version 高于本端 → 拒绝导入（防读不懂的数据）
 *   2. 先比内容签名（id/名称/星期/节次/时间/周型），相同 → 已是最新，不动本地
 *   3. 签名不同：云端 rev > 本地 rev → 直接导入；否则视为「本地有改动」，
 *      第一次点给提示，再点一次才强制覆盖（不会静默吃掉本地改动）
 *   4. 导入走 data.replaceDoc → store.persist，本地 rev 自动 +1（规范要求每次落盘自增）
 *
 * 复用探测页的稳定模式：互斥 running + 代际 gen 丢弃过期回调 + 15s 看门狗
 * + 全部回调包 try（Lite 上任何抛进平台的异常都是闪退，v6 已踩过）。
 */
/* 两套端点：
 *   有取件码 → 多用户站 kebiao.qingyun3.com/api.php?action=get&pickup=xxxxxx（只读）
 *   没取件码 → 个人课表 listenword.../elcton/schedule.json（历史路线，保持可用）
 * 码存在 internal://app/sync.code.txt（6 字节，键盘页写入） */
var SITE = 'http://kebiao.qingyun3.com/';
var LEGACY = 'http://listenword.qingyun3.com/elcton/';
var CODE_URI = 'internal://app/sync.code.txt';
var SCHEDULE_URL = LEGACY + 'schedule.json';    /* 运行时按是否设码切换 */
var HEALTH_URL = SITE + 'health.txt';
var SCHEMA = 'elcton.schedule';
var VERSION = 1;
var WATCHDOG_MS = 15000;   /* 手机侧实测该主机 ~2.5s，留 15s 余量覆盖弱网 */

function brief(v, n) {
    if (v === undefined || v === null) { return ''; }
    var s;
    if (typeof v === 'object') {
        try { s = JSON.stringify(v); } catch (e) { s = null; }
        if (typeof s !== 'string') {
            try { s = String(v); } catch (e2) { s = '[unstringifiable]'; }
        }
    } else {
        s = String(v);
    }
    /* 无正则字面量（JerryScript profile）→ 手工压掉换行/制表 */
    var out = '';
    for (var i = 0; i < s.length; i++) {
        var cc = s.charCodeAt(i);
        out += (cc === 10 || cc === 13 || cc === 9) ? ' ' : s.charAt(i);
    }
    return out.length > n ? (out.substring(0, n) + '…') : out;
}

function str(v) { return (v === undefined || v === null) ? '' : String(v); }
function num(v, d) { var n = Number(v); return isNaN(n) ? d : n; }

/* 内容签名：与 rev/updatedAt 无关，只看课本身 → 判断「内容是否真的变了」
 * 不这么做的后果：replaceDoc 落盘会 rev+1，本地 rev 永远比云端大，
 * 下次拉取就会误判成「本地较新」而永远不再更新。 */
function sig(doc) {
    var list = doc.courses.slice().sort(function (a, b) {
        return str(a.id) < str(b.id) ? -1 : (str(a.id) > str(b.id) ? 1 : 0);
    });
    var s = '';
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        s += str(c.id) + '|' + str(c.name) + '|' + num(c.dayOfWeek, 0) + '|' +
             num(c.startPeriod, 0) + '|' + num(c.endPeriod, 0) + '|' +
             str(c.startTime) + '|' + str(c.endTime) + '|' + str(c.weekType) + ';';
    }
    return s;
}

/* 归一化：replaceDoc 直接把对象挂进缓存，字段缺失会让 serialize 出问题 → 先补齐 */
function normalize(remote) {
    var s = (remote.settings && typeof remote.settings === 'object') ? remote.settings : {};
    var out = {
        schema: SCHEMA,
        version: num(remote.version, VERSION),
        rev: num(remote.rev, 0),
        updatedAt: num(remote.updatedAt, 0),
        settings: {
            semesterStart: str(s.semesterStart) || '2026-09-01',
            currentWeek: num(s.currentWeek, 1),
            vibrationEnabled: s.vibrationEnabled === undefined ? true : !!s.vibrationEnabled,
            reminderMinutes: num(s.reminderMinutes, 5)
        },
        courses: []
    };
    var list = (remote.courses && remote.courses.length) ? remote.courses : [];
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (!c || typeof c !== 'object' || !c.id) { continue; }   /* 无 id 不入内存（规范 §二） */
        var weeks = [];
        if (c.weeks && c.weeks.length) {
            for (var k = 0; k < c.weeks.length; k++) { weeks.push(num(c.weeks[k], 0)); }
        }
        out.courses.push({
            id: str(c.id), name: str(c.name), location: str(c.location), teacher: str(c.teacher),
            dayOfWeek: num(c.dayOfWeek, 1), startPeriod: num(c.startPeriod, 1), endPeriod: num(c.endPeriod, 1),
            startTime: str(c.startTime), endTime: str(c.endTime),
            weekType: str(c.weekType) || 'all', weeks: weeks, colorIndex: num(c.colorIndex, 0)
        });
    }
    return out;
}

function mk(name, status, color) {
    return { name: name, status: status, color: color };
}

export default {
    data: {
        rows: [],
        detail: '',
        endpoint: 'kebiao.qingyun3.com'
    },
    onInit: function () {
        var self = this;
        self.dead = false;
        self.running = false;
        self.gen = 0;
        self.wdTimer = null;
        self.fetchApi = null;
        self.localRev = 0;
        self.localCount = 0;
        self.pendingForce = false;
        try { self.fetchApi = require('@system.fetch'); } catch (e) { self.fetchApi = null; }

        self.rows = [
            mk('本地课表', '读取中…', '#6c6c80'),
            mk('云端课表', '待拉取', '#6c6c80'),
            mk('取件码', '读取中…', '#6c6c80'),
            mk('连通自检', '待测', '#6c6c80')
        ];
        self.pickupCode = '';
        self.detail = '读取取件码中…';

        self.loadCode(function () {
            self.detail = '云端 ' + self.scheduleUrl();
            self.endpoint = (self.pickupCode.length === 6)
                ? 'kebiao.qingyun3.com（取件码）'
                : 'listenword.qingyun3.com/elcton（个人）';
            self.refreshLocal(function () {
                self.health();
            });
        });
    },
    onDestroy: function () {
        this.dead = true;
        this.gen++;
        try { clearTimeout(this.wdTimer); } catch (e) {}
        this.wdTimer = null;
    },
    onBack: function () {
        router.back();
    },
    /* 点行 = 上下文动作：自检行重跑自检、课表行刷新本地、其余只看详情 */
    onRowClick: function (idx) {
        var r = this.rows[idx];
        if (!r) { return; }
        if (idx === 2) { router.push({ uri: 'pages/code/code' }); return; }
        if (idx === 3) { this.detail = '重跑自检…'; this.health(); return; }
        if (idx === 0) { this.detail = '刷新本地…'; this.refreshLocal(function () {}); return; }
        this.detail = r.name + '：' + r.status;
    },
    setRow: function (i, status, color) {
        var list = this.rows.slice();
        if (!list[i]) { return; }
        list[i] = { name: list[i].name, status: status, color: color };
        this.rows = list;      /* 顶层赋值才触发刷新 */
    },
    /* 读取件码（键盘页写在 internal://app/sync.code.txt，6 字节） */
    loadCode: function (cb) {
        var self = this;
        var done = function (v) {
            self.pickupCode = v;
            if (v.length === 6) {
                self.setRow(2, '已设置 ' + v, '#4caf50');
            } else {
                self.setRow(2, '未设置 · 点这里填', '#ffc107');
            }
            if (cb) { cb(); }
        };
        try {
            fs.readFile(CODE_URI, function (err, text) {
                if (self.dead) { return; }
                var v = '';
                if (err === undefined || err === null) {
                    var t = String(text === undefined || text === null ? '' : text);
                    for (var i = 0; i < t.length; i++) {
                        var cc = t.charCodeAt(i);
                        if (cc >= 48 && cc <= 57 && v.length < 6) { v += t.charAt(i); }
                    }
                }
                done(v);
            });
        } catch (e) { done(''); }
    },
    scheduleUrl: function () {
        if (this.pickupCode && this.pickupCode.length === 6) {
            return SITE + 'api.php?action=get&pickup=' + this.pickupCode;
        }
        return LEGACY + 'schedule.json';
    },

    refreshLocal: function (cb) {
        var self = this;
        try {
            data.getDoc(function (doc) {
                if (!self.dead && doc) {
                    self.localRev = num(doc.rev, 0);
                    self.localCount = (doc.courses && doc.courses.length) ? doc.courses.length : 0;
                    self.setRow(0, 'rev ' + self.localRev + ' · ' + self.localCount + ' 门', '#7c86e0');
                }
                if (cb) { cb(); }
            });
        } catch (e) {
            self.setRow(0, '读取异常', '#f44336');
            if (cb) { cb(); }
        }
    },

    /* ── 通用 GET：看门狗 + 代际守卫 + 回调全包 try ── */
    httpGet: function (url, gen, cb) {
        var self = this;
        if (!self.fetchApi || !self.fetchApi.fetch) {
            cb(false, '@system.fetch 不可用', -100);
            return;
        }
        var done = false;
        var finish = function (ok, payload, code) {
            if (done || self.dead || gen !== self.gen) { return; }
            done = true;
            try { clearTimeout(self.wdTimer); } catch (e) {}
            cb(ok, payload, code);
        };
        try {
            self.wdTimer = setTimeout(function () {
                finish(false, '看门狗 ' + (WATCHDOG_MS / 1000) + 's 到点，无回调', -99);
            }, WATCHDOG_MS);
        } catch (e) {}
        try {
            self.fetchApi.fetch({
                url: url,
                method: 'GET',
                header: { 'Accept': 'application/json, text/plain' },
                success: function (res) {
                    try {
                        var body = (res && res.data !== undefined && res.data !== null) ? String(res.data) : '';
                        finish(true, body, res ? res.code : 0);
                    } catch (e) { finish(false, 'success 抛出 ' + brief(e, 40), -98); }
                },
                fail: function (res, code) {
                    try {
                        finish(false, brief(res, 70), (code === undefined || code === null) ? -97 : code);
                    } catch (e) { finish(false, 'fail 抛出 ' + brief(e, 40), -96); }
                }
            });
        } catch (e) {
            finish(false, '发起异常 ' + brief(e, 50), -95);
        }
    },

    /* ── 进页面自动打一次探活（几字节，最快，用来分清网络问题和数据问题） ── */
    health: function () {
        var self = this;
        if (self.running) { return; }
        if (!self.fetchApi) {
            self.setRow(3, 'fetch 模块不可用', '#f44336');
            self.detail = '@system.fetch 加载失败';
            return;
        }
        self.running = true;
        self.gen++;
        var gen = self.gen;
        self.setRow(3, '测试中…', '#ffc107');
        self.httpGet(HEALTH_URL, gen, function (ok, payload, code) {
            self.running = false;
            if (ok && String(payload).indexOf('ok') >= 0) {
                self.setRow(3, '✓ 通 ' + code, '#4caf50');
                self.detail = '自检 ' + brief(payload, 40);
            } else if (ok) {
                self.setRow(3, '✓ 通但内容异常', '#ffc107');
                self.detail = 'HTTP ' + code + ' body=' + brief(payload, 50);
            } else {
                self.setRow(3, '✗ ' + code, '#f44336');
                self.detail = '自检失败 code=' + brief(code, 8) + ' data=' + brief(payload, 60);
            }
        });
    },

    /* ── 拉取课表 ── */
    onPull: function () {
        var self = this;
        if (self.running) {
            self.detail = '上一个请求还在跑，等它回来';
            return;
        }
        if (!self.fetchApi) {
            self.setRow(1, 'fetch 模块不可用', '#f44336');
            self.detail = '@system.fetch 加载失败';
            return;
        }
        self.running = true;
        self.gen++;
        var gen = self.gen;
        var url = self.scheduleUrl();
        self.setRow(1, '拉取中…', '#ffc107');
        self.detail = 'GET ' + url;

        self.httpGet(url, gen, function (ok, payload, code) {
            if (!ok) {
                self.running = false;
                self.setRow(1, '✗ ' + code, '#f44336');
                self.detail = '拉取失败 code=' + brief(code, 8) + ' data=' + brief(payload, 60);
                return;
            }
            if (code >= 400) {
                self.running = false;
                self.setRow(1, '✗ HTTP ' + code, '#f44336');
                self.detail = '服务端返回 HTTP ' + code + ' body=' + brief(payload, 50);
                return;
            }
            var remote = null;
            try { remote = JSON.parse(payload); } catch (e) { remote = null; }
            if (!remote || typeof remote !== 'object') {
                self.running = false;
                self.setRow(1, '✗ 不是合法 JSON', '#f44336');
                self.detail = '解析失败 body=' + brief(payload, 60);
                return;
            }
            /* 兼容包装：服务端可能把课表放在 {code,doc:{...}} 里（v1 接口就是
             * 这样，真机实测报过「schema 不匹配」且 schema= 为空）→ 拆包再校验 */
            if (!remote.schema && remote.doc && typeof remote.doc === 'object') {
                remote = remote.doc;
            }
            if (remote.schema !== SCHEMA) {
                self.running = false;
                self.setRow(1, '✗ schema 不匹配', '#f44336');
                self.detail = 'schema=' + brief(remote.schema, 30) + '，不是课表文档，拒绝导入';
                return;
            }
            if (num(remote.version, 0) > VERSION) {
                self.running = false;
                self.setRow(1, '✗ 云端格式更新', '#f44336');
                self.detail = '云端 version=' + remote.version + ' > 本端 v' + VERSION +
                              '，按规范禁止导入，请升级手表端';
                return;
            }
            var normalized = normalize(remote);
            self.decide(normalized, gen);
        });
    },

    decide: function (remote, gen) {
        var self = this;
        try {
            data.getDoc(function (local) {
                if (self.dead || gen !== self.gen) { return; }
                if (!local) {
                    self.running = false;
                    self.setRow(1, '✗ 本地读取失败', '#f44336');
                    self.detail = 'getDoc 返回空，先看本地课表是否损坏';
                    return;
                }
                var same = false;
                try { same = (sig(local) === sig(remote)); } catch (e) { same = false; }

                if (same) {
                    self.running = false;
                    self.pendingForce = false;
                    self.setRow(1, '✓ 已是最新 rev ' + remote.rev, '#4caf50');
                    self.detail = '内容与本地完全一致（' + remote.courses.length + ' 门），无需导入';
                    return;
                }
                var localRev = num(local.rev, 0);
                if (remote.rev <= localRev && !self.pendingForce) {
                    self.running = false;
                    self.pendingForce = true;
                    self.setRow(1, '本地有改动', '#ffc107');
                    self.detail = '本地 rev ' + localRev + ' ≥ 云端 rev ' + remote.rev +
                                  ' 且内容不同。再点一次「拉取」= 强制用云端覆盖本地';
                    return;
                }
                self.apply(remote, gen);
            });
        } catch (e) {
            self.running = false;
            self.setRow(1, '✗ 异常', '#f44336');
            self.detail = '比对阶段抛出 ' + brief(e, 60);
        }
    },

    apply: function (remote, gen) {
        var self = this;
        try {
            data.replaceDoc(remote, function (ok) {
                if (self.dead || gen !== self.gen) { return; }
                self.running = false;
                if (ok) {
                    self.pendingForce = false;
                    self.setRow(1, '✓ 已导入 rev ' + remote.rev, '#4caf50');
                    self.detail = '导入 ' + remote.courses.length + ' 门课；落盘后本地 rev 自增（规范 §四.3）';
                    self.refreshLocal(function () { self.setRow(1, '✓ 已导入 · 本地 rev ' + self.localRev, '#4caf50'); });
                } else {
                    self.setRow(1, '✗ 落盘失败', '#f44336');
                    self.detail = 'replaceDoc 回调 false：文件写入失败（空间不足或文件被占用）';
                }
            });
        } catch (e) {
            self.running = false;
            self.setRow(1, '✗ 异常', '#f44336');
            self.detail = '导入阶段抛出 ' + brief(e, 60);
        }
    },

    onRetry: function () {
        var self = this;
        self.pendingForce = false;
        self.gen++;                 /* 丢弃在途回调，重新开始 */
        try { clearTimeout(self.wdTimer); } catch (e) {}
        self.running = false;
        self.setRow(1, '待拉取', '#6c6c80');
        self.setRow(3, '待测', '#6c6c80');
        self.refreshLocal(function () { self.health(); });
    }
};
