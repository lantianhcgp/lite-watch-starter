import fs from '../common/fs';

//候选词文件读取相关实现
var chineseCandidateData = [];
var dict_uri = "internal://app/rawfile/inputMethod/chineseCandidate.json";

let globalApp = {};

try {
    if ($app) {
        globalApp = $app;
    }
} catch (e) {
    globalApp = {};
}

if (globalApp.getChineseCandidate) {
    console.log("can read chinese candidate from app.js.");
    globalApp.getChineseCandidate((data) => {
        chineseCandidateData = data;
    });
} else {
    console.log("can not read chinese candidate from app.js, used read file instead.");
    fs.readLargeFile(dict_uri, (err, data) => {
        if (err) {
            fs.printGeneralError(err, data, "read file");
            return;
        }
        chineseCandidateData = JSON.parse(data);
        data = null;
        return;
    });
}

export default class inputMethod {
    /**
     * 获取中文候选词
     * @param pinyin 汉字拼音, 当前只支持单个汉字
     * @returns 包含当前拼音的所有候选词的数组
     */
    static getChineseCandidate(pinyin) {
        if (pinyin.length === 0) return []; //传入空字符串返回空数组
        let firstLetter = pinyin[0]; //获取第一个拼音字母
        let otherLetter = pinyin[1] ? pinyin.slice(1, pinyin.length) : "empty"; //获取其他拼音字母, 不存在则为empty
        let firstStageData = chineseCandidateData[firstLetter]; //获取第一个拼音字母对应的object
        if (firstStageData == undefined) return []; //如果不存在返回空数据
        let secondStageData = firstStageData[otherLetter]; //获取其他字母对应的string
        if (secondStageData == undefined) { //如果不存在, 自动联想到其他拼音上
            if (pinyin.length === 1) { //如果拼音的length只有1且不存在empty项 则自动联想第一个(有待改进)
                let otherLetter = Object.keys(firstStageData)[0];
                return firstStageData[otherLetter].split("");
            }
            let firstStageArr = Object.keys(firstStageData); //如果拼音的length不为1, 则寻找与之类似的拼音
            for (let i = 0, len = firstStageArr.length; i < len; i++) {
                let data = firstStageArr[i];
                if (data.indexOf(otherLetter) !== -1) return firstStageData[data].split("");
            }
            return []; //如果上述方法都无数据, 则返回空数据
        }
        return secondStageData.split(""); //如果存在 则返回原数据
    }

    /**
     * 键盘输入方式数据, 该项为内部实现数据
     */
    static keyboardTypeData = {
        english: "english",
        pinyin: "pinyin",
        symbol: "symbol"
    }

    /**
     * 键盘大小写数据, 该项为内部实现数据
     */
    static keyboardCaseData = {
        upper: "upper",
        lower: "lower",
        upperUnlock: "upperUnlock"
    }

    /**
     * 键盘布局数据, 该项为内部实现数据
     */
    static keyboardLayoutData = {
        uppercase: "QWERTYUIOPASDFGHJKLZXCVBNM",
        uppercaseArr: [["W", "E", "R", "T", "Y", "U", "I", "O"], ["S", "D", "F", "G", "H", "J", "K"], ["X", "C", "V", "B", "N"]],
        lowercase: "qwertyuiopasdfghjklzxcvbnm",
        lowercaseArr: [["w", "e", "r", "t", "y", "u", "i", "o"], ["s", "d", "f", "g", "h", "j", "k"], ["x", "c", "v", "b", "n"]],
        symbolLabel: [{
                          value: "数字", arr: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."]
                      }, {
                          value: "中文",
                          arr: ["？", "！", "，", "。", "、", "；", "：", "@", "#", "＄", "￥", "%", "“", "”", "‘", "’", "《", "》", "【", "】", "（", "）", "＿", "+", "-", "=", "｀", "~", "／", "［", "］", "＜", "＞", "＾", "&", "*", "｛", "｝", "｜", "·"]
                      }, {
                          value: "英文",
                          arr: ["?", "!", ",", ".", "/", "$", "@", "^", "#", "*", "(", ")", "_", "+", "-", "=", "%", "&", "~", ";", "'", "[", "]", "\\", "<", ">", "`", ":", "\"", "{", "}", "|", "·"]
                      }]
    }
}