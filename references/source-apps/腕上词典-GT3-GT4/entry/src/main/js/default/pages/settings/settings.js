import router from '../../common/router.js'
import storage from '@system.storage';
import file from '@system.file';
import app from '@system.app';
import { KeepLight } from '../../common/Light.js';

let toastTimeout = null;
let _ref = {
    list: "list",
    settings: "settings",
    chineseCount: "chineseCount",
    historyCount: "historyCount",
    theme: "theme",
    mode: "mode"
}

var range;

function toBoolean(value) {
    return value === "1";
}

function toString(value) {
    return value === true ? "1" : "0";
}

export default {
    data: {
        isShow: {
            Main: true,
            SearchSettings: false,
            Theme: false,
            chineseCount: false,
            historyCount: false
        },
        AutoSearch: true,
        AlwaysOn: true,
        ScreenOffAlive: true,
        SaveKeyboardWord: true,
        CleanKeyboardAfterSearch: false,
        RounderBackground: false,
        isNeedSaveData: true,
        RounderBackgroundValue: {
            background: "transparent",
            radius: 0
        },
        ShowFeedback: true,
        dictType: 0,
        historyCount: 30,
        chineseCount: 50,
        toast: {
            show: false,
            width: 0,
            left: 0,
            text: ""
        },
        historyRange: [10,20,30,40,50,60,70,80],
        chineseRange: [20,40,60,80,100,120,140,160,180,200,220,240,260,280,300],
        defaultIndex: 0,
        selectProcessName: "",
        colorList: [{name:"纸色",value:"#ffe2cbad",checked:true,textColor:"#000000"},{name:"黑色",value:"#000000",checked:false,textColor:"#F1F3F5"},{name:"白色",value:"#F1F3F5",checked:false,textColor:"#000000"}],
        themeIndex: 0,
        isGt4: false
    },
    onInit() {
        this.isGt4 = app.setSwipeToDismiss != undefined;
        this.getBoolean("RounderBackground", "0");
        this.getBoolean("AutoSearch", "1");
        this.getBoolean("AlwaysOn", "1");
        this.getBoolean("ScreenOffAlive", "1");
        this.getBoolean("SaveKeyboardWord", "1");
        this.getBoolean("CleanKeyboardAfterSearch", "0");
        this.getBoolean("ShowFeedback", "1");
        this.getBoolean("isNeedSaveData", "1");
        this.getNumber("themeIndex", "0");
        this.getDictType();
        this.getNumber("historyCount", "30");
        this.getNumber("chineseCount", "50");
        this.getThemeType();
        this.getRounderBackgroundValue();
    },
    getRounderBackgroundValue() {
        if (this.RounderBackground) {
            this.RounderBackgroundValue.background = "rgb(36,36,36)";
            this.RounderBackgroundValue.radius = 75;
        }
    },
    getBoolean(key, defaultValue) {
        storage.get({
            key: key,
            default: defaultValue,
            success: (data) => {
                this[key] = toBoolean(data);
            }
        });
    },
    writeStorage(key, value) {
        storage.set({
            key: key,
            value: value
        });
    },
    getNumber(key, defaultValue) {
        storage.get({
            key: key,
            default: defaultValue,
            success: (data) => {
                this[key] = Number(data);
            }
        });
    },
    getDictType() {
        storage.get({
            key: "default_dict",
            default: "a",
            success: (data) => {
                this.dictType = data === "a" ? 0 : 1;
            }
        });
    },
    writeDictType(type) {
        storage.set({
            key: "default_dict",
            value: type
        });
    },
    getThemeType() {
        for (let i = 0, len = this.colorList.length;i < len; i++) {
            if (i === this.themeIndex) {
                this.colorList[i].checked = true;
                continue;
            }
            this.colorList[i].checked = false;
        }
    },
    onShow() {
        if (router.getLastUri() == "pages/search_keyboard/chinese/chinese" || router.getLastUri() == "pages/search_keyboard/english/english") {
            this.isShow.Main = false;
            this.isShow.SearchSettings = true;
            setTimeout(() => {
                this.rotation(_ref.settings, true);
            }, 50);
        } else {
            this.rotation(_ref.list, true);
        }
    },
    handleSwitchTheme(index) {
        if (index === this.themeIndex) return;
        this.colorList[index].checked = true;
        this.colorList[this.themeIndex].checked = false;
        this.themeIndex = index;
        storage.set({
            key: "themeIndex",
            value: String(this.themeIndex)
        });
    },
    handleBooleanChange(name) {
        this[name] = !this[name];
        this.writeStorage(name, toString(this[name]));
        if (name === "RounderBackground") {
            router.replace({
                uri: "pages/settings/settings"
            });
        } else if (name === "AlwaysOn") {
            KeepLight(this[name]);
        } else if (name === "SaveKeyboardWord" && !this[name]) {
            this.writeStorage("chinese", "");
            this.writeStorage("english", "");
            this.listScroll(_ref.settings, 2);
        }
    },
    handleChangeDictType(type) {
        this.dictType = type === "a" ? 0 : 1;
        this.writeDictType(type);
    },
    handleCleanHistory() {
        let that = this;
        file.rmdir({
            uri: 'internal://app/history',
            recursive: true,
            success: function () {
                file.mkdir({
                    uri: 'internal://app/history/a',
                    recursive: true
                });
                file.mkdir({
                    uri: 'internal://app/history/b',
                    recursive: true
                });
                that.showToast('历史记录清除完成', 320, 2000);
            },
            fail: function (data, code) {
                if (code == 301) {
                    that.showToast('历史记录清除完成', 320, 2000);
                } else {
                    that.showToast('历史记录清除失败', 320, 2000);
                }
            }
        })
    },
    handleReplaceSearchSettings() {
        this.rotation(_ref.list, false);
        this.isShow.Main = false;
        setTimeout(() => {
            this.isShow.SearchSettings = true;
            this.rotation(_ref.settings, true);
        }, 50);
    },
    handleReplaceTheme() {
        this.rotation(_ref.list, false);
        this.isShow.Main = false;
        setTimeout(() => {
            this.isShow.Theme = true;
            this.rotation(_ref.theme, true);
        }, 50);
    },
    handleReplaceMode() {
        this.rotation(_ref.list, false);
        this.isShow.Main = false;
        setTimeout(() => {
            this.isShow.Mode = true;
            this.rotation(_ref.mode, true);
        }, 50);
    },
    switchCount(value) {
        this.rotation(_ref.list, false);
        this.isShow.Main = false;
        if (value === "historyCount") {
            range = this.historyRange;
        } else if (value === "chineseCount") {
            range = this.chineseRange;
        }
        this.defaultIndex = range.indexOf(this[value]);
        this.selectProcessName = value;
        setTimeout(() => {
            this.isShow[value] = true;
            this.rotation(value, true);
        }, 50);
    },
    selectChange(data) {
        this.defaultIndex = data.newSelected;
    },
    confirmSelect() {
        this[this.selectProcessName] = range[this.defaultIndex];
        storage.set({
            key: this.selectProcessName,
            value: String(this[this.selectProcessName])
        });
        this.rotation(this.selectProcessName, false);
        if (this.selectProcessName == "historyCount") {
            file.readText({
                uri: "internal://app/history/list.json",
                length: 4096,
                success: (data) => {
                    let history = JSON.parse(data.text);
                    if (history.length > this.historyCount) {
                        for (let i = this.historyCount, len = history.length; i < len; i++) {
                            if (history[i][1][1] == undefined) this.deleteFile(`internal://app/history/${history[i][1]}/${history[i][0]}`);
                            else this.deleteDir(`internal://app/history/${history[i][1][0]}/${history[i][0]}`);
                            delete history[i];
                        }
                        history = history.filter(item => item !== null);
                        file.writeText({
                            uri: "internal://app/history/list.json",
                            text: JSON.stringify(history)
                        });
                    }
                }
            });
        }
        this.isShow[this.selectProcessName] = false;
        setTimeout(() => {
            this.isShow.Main = true
            this.rotation(_ref.list, true);
        }, 50);
    },
    deleteFile(uri) {
        file.delete({
            uri: uri
        });
    },
    deleteDir(uri) {
        file.rmdir({
            uri: uri,
            recursive: true
        });
    },
    handleSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.rotation(_ref.list, false);
            router.back();
        }
    },
    handleThemeSwipe(e) {
        if (e.direction == 'right' && (e.distance ? (e.distance >= 150) : true)) {
            this.rotation(_ref.theme, false);
            this.isShow.Theme = false;
            setTimeout(() => {
                this.isShow.Main = true;
                this.rotation(_ref.list, true);
            }, 50);
        }
    },
    handleModeSwipe(e) {
        if (e.direction == 'right' && (e.distance ? (e.distance >= 150) : true)) {
            this.rotation(_ref.mode, false);
            this.isShow.Mode = false;
            setTimeout(() => {
                this.isShow.Main = true;
                this.rotation(_ref.list, true);
            }, 50);
        }
    },
    countSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.rotation(this.selectProcessName, false);
            this.isShow[this.selectProcessName] = false;
            setTimeout(() => {
                this.isShow.Main = true;
                this.rotation(_ref.list, true);
            }, 50);
        }
    },
    handleSettingsSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            if (router.getLastUri() == "pages/search_keyboard/chinese/chinese" || router.getLastUri() == "pages/search_keyboard/english/english") {
                this.rotation(_ref.settings, false);
                setTimeout(() => {
                    router.back();
                }, 100);
            } else {
                this.rotation(_ref.settings, false);
                this.isShow.SearchSettings = false;
                setTimeout(() => {
                    this.isShow.Main = true;
                    this.rotation(_ref.list, true);
                }, 50);
            }
        }
    },
    showToast(text, width, time) {
        clearTimeout(toastTimeout);
        this.toast.text = text;
        this.toast.width = width;
        this.toast.left = (466 - this.toast.width) / 2;
        this.toast.show = true;
        toastTimeout = setTimeout(() => {
            this.toast.show = false;
            clearTimeout(toastTimeout);
        }, time);
    },
    rotation(ref, focus) {
        setTimeout(() => {
            if (this.$refs[ref] && this.$refs[ref].rotation) {
                this.$refs[ref].rotation({
                    focus: focus
                });
            }
        }, 50);
    },
    listScroll(ref, index) {
        if (this.$refs[ref] && this.$refs[ref].scrollTo) {
            this.$refs[ref].scrollTo({
                index: index
            });
        }
    }
}
