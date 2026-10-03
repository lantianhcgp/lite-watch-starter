import router from '../../common/router.js'
import file from '@system.file';
import storage from '@system.storage';
import textlayout from '../../common/textlayout.js';
import common from '../../common/common.js';

let wordBookUri = 'internal://app/wordbook'
let wordBook = [];
let wordBookIndex = 0
let dictChineseIndex = 0
let render_temp = [];

let toastTimeout = null;

export default {
    data: {
        isShow: {
            Loading: true,
            Main: false,
            Empty: false,
            Multi: false
        },
        dict: {
            words: "加载中...",
            part: "",
            mean: "加载中...",
            ex: "加载中...",
            tran: "加载中..."
        },
        inner: {
            longTextHeight: 400,
            overFlowHeight: 200,
            chineseCount: 50,
            chineseTotalCount: 0,
            isMulti: false,
            isSaved: false,
            multiContent: [],
            index: 0,
            isLoading: false
        },
        toast: {
            show: false,
            width: 0,
            left: 0,
            text: ""
        },
        result: null,
        searchType: "",
        chineseWord: "",
        moveY: -1,
        RounderBackground: true,
        RounderBackgroundValue: {
            background: "transparent",
            radius: 0
        },
        colorList: [{name:"纸色",value:"#ffe2cbad",checked:true,textColor:"#000000"},{name:"黑色",value:"#000000",checked:false,textColor:"#F1F3F5"},{name:"白色",value:"#F1F3F5",checked:false,textColor:"#000000"}],
        themeIndex: 0
    },
    onInit() {
        this.getBackgroundSettings();
        this.getThemeType();
        common.getParams(this, () => {
            if (this.result == null) return;
            if (this.result.preview != undefined) {
                this.getMultiData();
                this.getWordBookData(false);
                this.inner.isMulti = true;
                this.cleanKeyboard();
            } else if (this.result.preview == undefined) {
                this.cleanKeyboard();
            }
        });
    },
    onShow() {
        if (this.result == null) {
            this.showEmptyUI();
        } else if (this.result.preview != undefined) {
            this.showMultiUI();
        } else if (this.result.preview == undefined) {
            this.getDictData();
            this.getWordBookData();
            this.showMainUI();
        }
    },
    getThemeType() {
        storage.get({
            key: "themeIndex",
            default: "0",
            success: (data) => {
                this.themeIndex = Number(data);
            }
        });
    },
    cleanKeyboard() {
        storage.get({
            key: "CleanKeyboardAfterSearch",
            default: '0',
            success: (data) => {
                if (data == "1") storage.delete({
                    key: this.inner.isMulti ? 'chinese' : 'english',
                    value: ""
                });
            }
        });
    },
    getBackgroundSettings() {
        storage.get({
            key: 'RounderBackground',
            default: '0',
            success: (data) => {
                if (data == '1') {
                    this.RounderBackgroundValue.background = "rgb(36,36,36)";
                    this.RounderBackgroundValue.radius = 75;
                }
            }
        });
    },
    onHide() {
        this.rotation("main", false, false);
        this.rotation("multi", false, false);
    },
    onDestroy() {
        clearTimeout(toastTimeout);
        this.toast.show = false;
        wordBook = null;
    },
    getDictData() {
        if (this.searchType == "a") {
            this.dict.words = this.result.words
            this.dict.part = this.result.part
            this.dict.mean = this.result.mean
            this.dict.ex = this.result.ex
            this.dict.tran = this.result.tran
            setTimeout(() => {
                this.inner.longTextHeight = this.getTextHeight(this.dict.part + this.dict.mean + this.dict.ex + this.dict.tran, 350, "topBox", "bottomBox");
            }, 50)
        } else if (this.searchType == "b") {
            this.dict.words = this.result.words
            this.dict.mean = this.result.mean
            setTimeout(() => {
                this.inner.longTextHeight = this.getTextHeight(this.dict.mean, 350, "topBox", "bottomBox");
            }, 50)
        }
        this.inner.overFlowHeight = 220
    },
    getMultiData() {
        this.inner.chineseTotalCount = this.result.data.length;
        storage.get({
            key: 'chineseCount',
            default: '50',
            success: (data) => {
                this.inner.chineseCount = Number(data);
            }
        });
        for (let i = 0, obj = this.result.data;i < this.result.data.length; i++) {
            file.readText({
                uri: `internal://app/history/${this.searchType}/${this.chineseWord}/${obj[this.inner.index]}`,
                success: (data) => {
                    let obj = JSON.parse(data.text);
                    data.text = null;
                    obj.showMean = obj.part + obj.mean;
                    render_temp.push(obj);
                }
            });
            this.inner.index++;
        }
        this.inner.multiContent.push.apply(this.inner.multiContent, render_temp);
    },
    getWordBookData(isCheck = true) {
        file.readText({
            uri: wordBookUri + "/list.json",
            length: 4096,
            success: (data) => {
                wordBook = JSON.parse(data.text);
                if (isCheck) this.checkWordBook();
            }
        });
    },
    checkWordBook() {
        for (let i = 0, obj = wordBook, len = obj.length;i < len; i++) {
            if (obj[i][0] == this.dict.words && obj[i][1] == this.searchType) {
                this.inner.isSaved = true
                wordBookIndex = i
                break;
            }
        }
    },
    deleteWordBookWord(index) {
        file.delete({
            uri: wordBookUri + "/" + wordBook[index][1] + "/" + wordBook[index][0]
        });
    },
    writeWordBookWord(obj) {
        file.writeText({
            uri: wordBookUri + "/" + this.searchType + "/" + obj.words,
            text: JSON.stringify(obj)
        });
    },
    saveToWordBook() {
        if (this.inner.isSaved) {
            this.deleteWordBookWord(wordBookIndex);
            wordBook.splice(wordBookIndex, 1);
            this.showToast("单词删除成功", "auto", 1500);
        } else if (!this.inner.isSaved) {
            let result = this.result;
            if (this.inner.isMulti) {
                result = this.inner.multiContent[dictChineseIndex];
                result.type = this.searchType;
            }
            this.writeWordBookWord(result);
            wordBook.unshift([result.words, this.searchType]);
            wordBookIndex = 0;
            this.showToast("单词保存成功", "auto", 1500);
        }
        file.writeText({
            uri: wordBookUri + "/list.json",
            text: JSON.stringify(wordBook)
        });
        this.inner.isSaved = !this.inner.isSaved
    },
    multiReplace(index) {
        dictChineseIndex = index
        this.rotation("main", false);
        this.writeMultiData(index);
        this.showMainUI();
        this.checkWordBook();
    },
    writeMultiData(index) {
        if (this.searchType == "a") {
            this.dict.words = this.inner.multiContent[index].words
            this.dict.part = this.inner.multiContent[index].part
            this.dict.mean = this.inner.multiContent[index].mean
            this.dict.ex = this.inner.multiContent[index].ex
            this.dict.tran = this.inner.multiContent[index].tran
            setTimeout(() => {
                this.inner.longTextHeight = this.getTextHeight(this.dict.part + this.dict.mean + this.dict.ex + this.dict.tran, 350, "topBox", "bottomBox");
            }, 50)
        } else if (this.searchType == "b") {
            this.dict.words = this.inner.multiContent[index].words
            this.dict.mean = this.inner.multiContent[index].mean
            setTimeout(() => {
                this.inner.longTextHeight = this.getTextHeight(this.dict.mean, 350, "topBox", "bottomBox");
            }, 50)
        }
        this.inner.overFlowHeight = 330
    },
    searchAgain() {
        this.rotation("main", false, false);
        common.writeMultiParams({
            searchWord: this.dict.words,
            searchType: this.searchType === "a" ? "b" : "a",
            wantType: 'english',
            moveY: this.moveY,
            isSearchAgain: true
        }, () => {
            router.replace({
                uri: "pages/search_word/search_word"
            });
        });
    },
    chineseSearchAgain() {
        this.rotation("multi", false, false);
        common.writeMultiParams({
            searchWord: this.chineseWord,
            searchType: this.searchType === "a" ? "b" : "a",
            wantType: 'chinese',
            moveY: this.moveY,
            isSearchAgain: true
        }, () => {
            router.replace({
                uri: "pages/search_word/search_word"
            });
        });
    },
    showMainUI() {
        this.isShow.Multi = false;
        this.isShow.Main = true;
        this.isShow.Loading = false;
        this.rotation("main", true);
    },
    showEmptyUI() {
        this.isShow.Loading = false
        this.isShow.Empty = true
    },
    showMultiUI() {
        this.rotation("main", false);
        this.isShow.Main = false;
        this.isShow.Multi = true;
        this.rotation("multi", true);
    },
    replaceMulti() {
        this.inner.isSaved = false;
        this.$refs.main.scrollTo({
            index: 0
        });
        this.showMultiUI();
    },
    mainSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            if (this.inner.isMulti) {
                this.replaceMulti();
            } else {
                this.rotation("main", false, false);
                common.clean();
                router.back({
                    params: {
                        moveY: this.moveY
                    }
                });
            }
        }
    },
    emptySwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            common.clean();
            router.back({
                params: {
                    moveY: this.moveY
                }
            });
        }
    },
    multiSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.rotation("multi", false, false);
            common.clean();
            router.back({
                params: {
                    moveY: this.moveY
                }
            });
        }
    },
    getTextHeight(text, width, topRef, bottomRef) {
        if (!this.$refs[topRef].getPosition) {
            return textlayout.getTextHeight(text, width);
        }
        let topPosition = this.$refs[topRef].getPosition();
        let bottomPosition = this.$refs[bottomRef].getPosition();
        let textHeight = bottomPosition.y - topPosition.y;
        return textHeight;
    },
    rotation(ref, bol_type=true, isTimer=true) {
        let rotation_func = () => {
            if (this.$refs[ref].rotation) {
                this.$refs[ref].rotation({
                    focus: bol_type
                })
            }
        }
        if (isTimer) setTimeout(rotation_func, 50);
        else rotation_func();
    },
    showToast(text, width, time) {
        clearTimeout(toastTimeout);
        this.toast.text = text;
        this.toast.width = width === "auto" ? this.getTextWidth(text) + 70 : width;
        this.toast.left = (466 - this.toast.width) / 2;
        this.toast.show = true;
        toastTimeout = setTimeout(() => {
            this.toast.show = false;
            clearTimeout(toastTimeout);
        }, time);
    },
    getTextWidth(str) {
        let strWidth = 0
        for (let i = 0, len = str.length;i < len; i++) {
            strWidth += textlayout.getCharPx(str.charCodeAt(i));
        }
        return strWidth;
    }
}
