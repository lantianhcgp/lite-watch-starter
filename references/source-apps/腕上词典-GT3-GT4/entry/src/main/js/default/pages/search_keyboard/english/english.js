import utils from '../../../common/utils';
import router from '../../../common/router.js';
import storage from '@system.storage';
import vibrator from '@system.vibrator';
import common from '../../../common/common.js';
import inputMethod from '../../../common/inputMethod';
import textlayout from '../../../common/textlayout'

let toastTimeout = null;

export default {
    data: {
        search_type: '',
        isShowSearchTips: false,
        toast: {
            show: false,
            width: 0,
            left: 0,
            text: ""
        },
        typeData: "",
        /**
       * 输入法实现数据
         */
        inputMethod: {
            /**
             * 中文候选词输入内容
             */
            chineseCandidateWord: "",
            /**
             * 键盘类型
             */
            keyboardType: inputMethod.keyboardTypeData.english,
            /**
             * 键盘大小写类型
             */
            keyboardCase: inputMethod.keyboardCaseData.lower,
            /**
             * 键盘布局数据, 该项为内部实现数据
             */
            keyboardLayoutData: inputMethod.keyboardLayoutData.lowercase,
            /**
             * 键盘布局数据, 该项为内部实现数据
             */
            keyboardLayoutDataArr: inputMethod.keyboardLayoutData.lowercaseArr,
            /**
             * 候选词数组
             */
            candidateArr: ["", "", "", "", ""],
            /**
             * 界面显示控制
             */
            show: {
                keyboard: true,
                candidate: false
            }
        }
    },
    onInit() {
        common.clean();
        let that = this;
        storage.get({
            key: 'default_dict',
            default: 'a',
            success: function (data) {
                that.search_type = data
            }
        });
        $app.getData(data => {
            if (data.searchType) {
                this.inputMethod.keyboardType = data.searchType === 'chinese' ? inputMethod.keyboardTypeData.pinyin : inputMethod.keyboardTypeData.english;
            }
            $app.cleanData();
        });
/*        storage.get({
            key: 'isShowSearchTips',
            default: '1',
            success: (data) => {
                if (data == "1") this.isShowSearchTips = true;
            }
        });*/
        this.getSearchText();
    },
    getSearchText() {
        let that = this;
        storage.get({
            key: that.getUserSearchType(),
            default: '',
            success: function (data) {
                that.typeData = data
            },
            fail: function () {
                that.typeData = ''
            }
        });
    },
    /**
 * dO nOT sWIPE
 */
    doNotSwipe(e) {
        utils.stopPropagation(e);
        return;
    },
    /**
     * 切换输入法类型
     */
    switchInputMethodType() {
        this.onDestroy();
        this.typeData = "";
        //看着这么长一坨, 实际功能实现很简单, 不做注释咯
        if (this.inputMethod.keyboardType === inputMethod.keyboardTypeData.english) {
            this.inputMethod.keyboardType = inputMethod.keyboardTypeData.pinyin;
        } else if (this.inputMethod.keyboardType === inputMethod.keyboardTypeData.pinyin) {
            this.inputMethod.keyboardType = inputMethod.keyboardTypeData.english;
        }
        this.getSearchText();
    },
    /**
     * 从键盘去候选词
     */
    keyboardReplaceCandidate() {
        this.inputMethod.show.keyboard = false;
        this.inputMethod.show.candidate = true;
        utils.rotationFocus(this, "list", true);
    },
    /**
 * 候选词滑动
 */
    candidateSwipe(e) {
        if (utils.checkIsSwipingBack(e)) this.keyboardBackMain();
    },
    /**
     * 从候选词回键盘
     */
    keyboardBackMain() {
        utils.rotationFocus(this, "list", false);
        this.inputMethod.show.candidate = false;
        this.inputMethod.show.keyboard = true;
        utils.scrollTo(this, "list", 0);
    },
    /**
     * 添加内容
     */
    addLetter(text) {
        if (this.inputMethod.keyboardType === inputMethod.keyboardTypeData.pinyin) {
            //如果输入法在拼音界面, 添加到候选词输入内容里而非便条输入内容里
            this.inputMethod.chineseCandidateWord += text;
            this.getKeyboardPinyinCandidateData(this.inputMethod.chineseCandidateWord);
            return;
        }
        this.typeData += text;
    },
    /**
     * 添加候选词到便条内容当中
     */
    addCandidate(text) {
        if (text === "" || text === null) return; //不添加空内容
        this.typeData += text;
        if (this.inputMethod.show.candidate) {
            //用户输入候选词时应退出候选词界面回键盘界面
            this.keyboardBackMain();
        }
        if (this.inputMethod.keyboardType === inputMethod.keyboardTypeData.pinyin) {
            //拼音输入法用户输入候选词后应该清空之前候选词带来的所有数据
            this.inputMethod.chineseCandidateWord = "";
            this.inputMethod.candidateArr = [];
        }
    },
    /**
     * 获取拼音候选词
     */
    getKeyboardPinyinCandidateData(pinyin) {
        this.inputMethod.candidateArr = inputMethod.getChineseCandidate(pinyin);
    },
    /**
 * 删除一位内容
 */
    deleteLetter() {
        if (this.inputMethod.keyboardType === inputMethod.keyboardTypeData.pinyin && this.inputMethod.chineseCandidateWord.length !== 0) {
            //如果输入法在拼音界面并且候选词输入内容不为空, 删除候选词输入内容而非便条内容
            this.inputMethod.chineseCandidateWord = this.inputMethod.chineseCandidateWord.substring(0, this.inputMethod.chineseCandidateWord.length - 1);
            this.getKeyboardPinyinCandidateData(this.inputMethod.chineseCandidateWord);
            return;
        }
        //用substring截取舍弃最后一位数据, 实现删除功能
        //删除前先看看最后一位字符是不是双码点字符，如果是的话得删两个字节 因为jerryscript未更新到es6
        var deleteCount = 0;
        var charCode = this.typeData.charCodeAt(this.typeData.length - 2);
        if (charCode >= 0xD800 && charCode <= 0xDBFF) {
            deleteCount = 2;
        } else {
            deleteCount = 1;
        }
        this.typeData = this.typeData.substring(0, this.typeData.length - deleteCount);
    },
    /**
     * 删除全部内容
     */
    deleteAllLetter() {
        //震动提醒用户全部删除
        if (this.inputMethod.keyboardType === inputMethod.keyboardTypeData.pinyin && this.inputMethod.chineseCandidateWord.length !== 0) {
            //如果输入法在拼音界面并且候选词输入内容不为空, 删除候选词输入内容而非便条内容
            this.inputMethod.chineseCandidateWord = "";
            this.getKeyboardPinyinCandidateData(this.inputMethod.chineseCandidateWord);
            return;
        }
        this.typeData = "";
    },
    getLeftStr(text) {
        let processText = text.slice(text.lastIndexOf("\n") + 1, text.length);
        //通过textlayout的getTextByLayoutReverse获取溢出str实现滚动输入框
        return textlayout.getTextByLayoutReverse(processText, 260, 1, 0, -20);
    },
    handleSeeTips() {
        storage.set({
            key: 'isShowSearchTips',
            value: "0"
        });
        this.isShowSearchTips = false;
    },
    handleTipsClick(e) {
        utils.stopPropagation(e);
    },
    onDestroy() {
        let that = this;
        storage.get({
            key: 'SaveKeyboardWord',
            default: '1',
            success: function (data) {
                if (data == '1') {
                    storage.set({
                        key: that.getUserSearchType(),
                        value: that.typeData
                    });
                }
            }
        });
    },
    handleReplaceSearchSettings() {
        if (this.isShowSearchTips) this.handleSeeTips();
        $app.saveData({
            searchType: this.getUserSearchType()
        });
        router.push({
            uri: "pages/settings/settings"
        });
    },
    search() {
        let that = this;
        if (this.toast.show == false) {
            if (this.typeData == '') {
                this.showToast('搜索内容不可为空', 320, 2000);
            } else {
                $app.saveData({
                    searchType: this.getUserSearchType()
                });
                common.writeMultiParams({
                    searchWord: that.typeData,
                    searchType: that.search_type,
                    wantType: that.getUserSearchType()
                }, () => {
                    router.push({
                        uri: "pages/search_word/search_word"
                    });
                });
            }
        }
    },
    getUserSearchType() {
        return this.inputMethod.keyboardType === inputMethod.keyboardTypeData.pinyin ? 'chinese' : 'english';
    },
    onswipe(e) {
        if (e.direction == "right" || e.distance >= 150) {
            router.back()
        }
    },
    change() {
        router.replace({
            uri: 'pages/search_keyboard/chinese/chinese'
        })
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
}
