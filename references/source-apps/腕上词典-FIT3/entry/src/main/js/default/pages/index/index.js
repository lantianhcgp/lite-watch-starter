import router from '../../common/router.js';
import app from '@system.app';
import file from '@system.file';
import '../../common/get_bundle_name.js';
import storage from '@system.storage';
import common from '../../common/common.js';
import '../../common/replace_pages.js';

export default {
    data: {
        isUpgrading: false
    },
    onInit() {
        common.clean();
        storage.get({
            key: 'ScreenOffAlive',
            default: '1',
            success: function (data) {
                if (data == '1' && !app.setSwipeToDismiss) {
                    app.screenOnVisible({
                        visible: true
                    })
                }
            }
        });
        this.checkDir("internal://app/history/a");
        this.checkDir("internal://app/history/b");
        this.checkDir("internal://app/wordbook/a");
        this.checkDir("internal://app/wordbook/b");
    },
    checkDir(uri) {
        file.get({
            uri: uri,
            fail: (data, code) => {
                if (code == 301) {
                    file.mkdir({
                        uri: uri,
                        recursive: true
                    });
                }
            }
        });
    },
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150 && !this.isUpgrading) {
            app.terminate();
        }
    },
    isNeedUpgrade(callback) {
        file.get({
            uri: "internal://app/history.json",
            success: () => {
                callback(true);
            },
            fail: () => {
                callback(false);
            }
        });
    },
    readNormalText(uri, callback) {
        file.get({
            uri: uri,
            success: (data) => {
                let length = data.length;
                let read_count = Math.ceil(length / 4096);
                let temp = "";
                for (let i = 0;i < read_count; i++) {
                    file.readText({
                        uri: uri,
                        position: i * 4096,
                        length: 4096,
                        success: (data) => {
                            temp += data.text
                            if (i + 1 === read_count) {
                                callback(temp);
                                temp = null;
                            }
                        }
                    })
                }
            },
            fail: () => {
                callback(null);
            }
        })
    },
    upgradeHistory(callback1, callback2) {
        this.readNormalText("internal://app/history.json", (data) => {
            if (data == null) {
                callback1(callback2);
                return;
            }
            let history = JSON.parse(data).data;
            let write_list = [];
            for (let i = 0, len = history.length;i < len; i++) {
                if (history[i].search_word != undefined) {
                    write_list.push([history[i].search_word, (history[i].type + "C")]);
                    this.checkDir(`internal://app/history/${history[i].type}/${history[i].search_word}`);
                    let list_obj = {
                        words: history[i].search_word,
                        preview: history[i].preview_word,
                        type: history[i].type,
                        data: []
                    };
                    for (let a = 0, obj = history[i].raw_result, len = obj.length;a < len; a++) {
                        list_obj.data.push(obj[a].words);
                        this.writeFile(`internal://app/history/${history[i].type}/${history[i].search_word}/${obj[a].words}`, JSON.stringify(obj[a]));
                    }
                    this.writeFile(`internal://app/history/${history[i].type}/${history[i].search_word}/list.json`, JSON.stringify(list_obj));
                } else {
                    write_list.push([history[i].words, history[i].type]);
                    this.writeFile(`internal://app/history/${history[i].type}/${history[i].words}`, JSON.stringify(history[i]));
                }
            }
            this.writeFile("internal://app/history/list.json", JSON.stringify(write_list));
            file.delete({
                uri: "internal://app/history.json"
            });
            callback1(callback2);
        });
    },
    upgradeWordBook(callback) {
        this.readNormalText("internal://app/wordbook.json", (data) => {
            if (data == null) {
                callback();
                return;
            }
            let wordbook = JSON.parse(data).data;
            let write_list = [];
            for (let i = 0, len = wordbook.length;i < len; i++) {
                if (wordbook[i].words == undefined) break;
                write_list.push([wordbook[i].words, wordbook[i].type]);
                this.writeFile(`internal://app/wordbook/${wordbook[i].type}/${wordbook[i].words}`, JSON.stringify(wordbook[i]));
            }
            this.writeFile("internal://app/wordbook/list.json", JSON.stringify(write_list));
            file.delete({
                uri: "internal://app/wordbook.json"
            });
            callback();
        });
    },
    writeFile(uri, text, callback=undefined) {
        file.writeText({
            uri: uri,
            text: text,
            success: () => {
                if (callback != undefined) callback();
            }
        })
    },
    onShow() {
        this.isNeedUpgrade(isNeedUpgrade => {
            if (isNeedUpgrade) {
                setTimeout(() => {
                    this.isUpgrading = true;
                    this.upgradeHistory(this.upgradeWordBook, this.replace);
                }, 600);
            } else {
                this.replace();
            }
        });
    },
    replace() {
        setTimeout(() => {
            router.replace({
                uri: 'pages/home/home'
            });
        }, 350);
    }
}
