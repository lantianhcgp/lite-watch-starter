/* 手表侧持久化 IO —— 只有三个方法，全部回调式（Lite 无 Promise）
 *
 * 关键实测约束（来自 memo-todo / 腕上词典真机踩坑）：
 * 1. 大于 4096 字节的文本必须分块读，且**必须串行**——并发发起时各块回调顺序
 *    不定，JSON 会被拼乱；中途失败会重复回调，最后一块失败则永不回调
 * 2. file.get 返回的是**文件元信息**（data.length = 字节数），不是内容
 * 3. 文件不存在时 fail 带 code 301
 */
import systemFile from '@system.file';

var CHUNK = 4096;

function readFile(uri, cb) {
    systemFile.get({
        uri: uri,
        success: function (meta) {
            var len = Number(meta && meta.length) || 0;
            var count = Math.ceil(len / CHUNK);
            if (count <= 0) { cb(undefined, ''); return; }
            var temp = '';
            var idx = 0;
            var done = false;
            var step = function () {
                if (done) { return; }
                if (idx >= count) { done = true; cb(undefined, temp); temp = null; return; }
                systemFile.readText({
                    uri: uri,
                    position: idx * CHUNK,
                    length: CHUNK,
                    success: function (d) {
                        temp += (d && d.text) ? d.text : '';
                        if (d) { d.text = null; }
                        idx++;
                        step();
                    },
                    fail: function (d, code) {
                        if (idx === 0) {          // 首块就失败 = 文件不可读
                            done = true;
                            cb(code, d);
                        } else {                  // 中途失败：按已读到的内容返回
                            idx++;
                            step();
                        }
                    }
                });
            };
            step();
        },
        fail: function (meta, code) {
            cb(code, meta);
        }
    });
}

function writeFile(uri, text, cb) {
    systemFile.writeText({
        uri: uri,
        text: text,
        success: function () { cb(undefined, true); },
        fail: function (d, code) { cb(code, d); }
    });
}

function backup(uri, text, cb) {
    writeFile(uri, text, function () { if (cb) { cb(); } });
}

export default {
    readFile: readFile,
    writeFile: writeFile,
    backup: backup,
    rawApi: systemFile
};
