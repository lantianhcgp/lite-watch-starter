import file from '@system.file';
import storage from '@system.storage';
import router from '../../common/router.js';
import 'array-flat-polyfill';
import common from '../../common/common.js';
import { KeepLight } from '../../common/Light.js';

let bundle_name = ''
let isAutoSearch = false
let historyCount = 30
let chineseCount = 50
let chineseCurrentCount = 0
let chineseResult = {
    words: "",
    preview: "",
    type: "",
    data: []
}
let internal_uri = ""
let dict_map = []
storage.get({
    key: 'bundle_name',
    success: (data) => {
        bundle_name = data
        internal_uri = 'internal://app/..\\..\\run\\' + bundle_name + '\\assets\\js\\default\\common\\dict\\';
    }
});
storage.get({
    key: 'AutoSearch',
    default: '1',
    success: (data) => {
        if (data == '0') {
            isAutoSearch = false
        } else {
            isAutoSearch = true
        }
    }
});
storage.get({
    key: 'historyCount',
    default: '30',
    success: (data) => {
        historyCount = Number(data);
    }
});
storage.get({
    key: 'chineseCount',
    default: '50',
    success: (data) => {
        chineseCount = Number(data);
    }
});
let searching_file = ""

let chineseSearchFileMap = "abcdefghijklmnopqrstuvwxyz";
let chineseSearchFileIndex = 0;

export default {
    data: {
        searchWord: "",
        searchType: "",
        wantType: "",
        isSearchAgain: false,
        moveY: -1,
        dict: {
            words: "",
            part: "",
            mean: "",
            ex: "",
            tran: ""
        }
    },
    onInit() {
        common.getParams(this, () => {
            KeepLight(true);
            searching_file = "dic_" + this.searchType;
            if (this.wantType == "english") {
                this.readNormalText(internal_uri + searching_file + "_" + this.searchWord[0] + "_map.bin", this.getDictMap);
            } else if (this.wantType == "chinese") {
                this.readNormalText(internal_uri + searching_file + "_" + chineseSearchFileMap[chineseSearchFileIndex] + "_map.bin", this.getDictMap);
            }
            setTimeout(() => {
                this.searchWordProcess();
            }, 5)
        });
    },
    onDestroy() {
        chineseResult = null;
        dict_map = null;
    },
    searchWordProcess() {
        if (this.wantType == 'chinese') {
            chineseResult.words = this.searchWord;
            chineseResult.type = this.searchType;
            this.searchChineseWordProcess1();
        } else if (this.wantType == 'english') {
            this.searchEnglishWordProcess1();
        }
    },
    searchEnglishWordProcess1(index=0) {
        try {
            var map_index = dict_map[this.getSecondLetter(this.searchWord)][index];
        } catch (e) {
            map_index = undefined
        } finally {
            if (map_index == undefined) {
                setTimeout(() => {
                    this.searchEnglishResultNullFunc();
                }, 5)
            } else {
                let uri = internal_uri + searching_file + ".bin"
                let length = map_index[0];
                let position = map_index[1];
                setTimeout(() => {
                    this.readDictText(uri, length, position, this.searchEnglishWordProcess2, index);
                }, 5)
            }
        }
    },
    searchEnglishWordProcess2(data, index) {
        let dict = data.split("|")
        let word_find_index = dict.indexOf(this.searchWord)
        if (word_find_index == -1) {
            this.searchEnglishWordProcess1(index + 1);
            return;
        }
        var obj
        if (this.searchType == "a") {
            obj = {
                words: dict[word_find_index],
                part: dict[word_find_index+1],
                mean: dict[word_find_index+2],
                ex: dict[word_find_index+3],
                tran: dict[word_find_index+4],
                type: "a"
            }
            this.searchEnglishCompleted(obj);
            return;
        } else if (this.searchType == "b") {
            obj = {
                words: dict[word_find_index],
                part: "",
                mean: dict[word_find_index+1],
                type: "b"
            }
            this.searchEnglishCompleted(obj);
            return;
        }
    },
    searchEnglishCompleted(obj) {
        this.dict = obj;
        setTimeout(() => {
            this.recordIntoHistory(obj, () => {
                KeepLight(false);
                common.writeMultiParams({
                    result: obj,
                    searchType: this.searchType,
                    moveY: this.moveY
                }, () => {
                    router.replace({
                        uri: 'pages/show_word/show_word'
                    });
                });
            });
        }, 100);
    },
    searchEnglishResultNullFunc() {
        let replace_null = () => {
            common.writeMultiParams({
                result: null,
                moveY: this.moveY
            }, () => {
                router.replace({
                    uri: 'pages/show_word/show_word'
                });
                KeepLight(false);
            });
        }
        if (router.getLastUri() != "pages/search_keyboard/english/english") {
            replace_null();
        } else if (isAutoSearch && !this.isSearchAgain) {
            common.writeMultiParams({
                searchWord: this.searchWord,
                searchType: this.searchType === "a" ? "b" : "a",
                wantType: 'english',
                moveY: this.moveY,
                isSearchAgain: true
            }, () => {
                router.replace({
                    uri: "pages/search_word/search_word"
                });
            });
        } else {
            replace_null();
        }
    },
    searchChineseWordProcess1() {
        let process_list = this.objectGetValues(dict_map);
        process_list = process_list.flat(1);
        this.searchChineseWordProcess2(process_list, process_list.length, 0);
    },
    searchChineseWordProcess2(process_list, length, index) {
        this.readDictText(internal_uri + searching_file + ".bin", process_list[index][0], process_list[index][1], this.searchChineseWordProcess3, {
            process_list: process_list, length: length, index: index
        });
    },
    searchChineseWordProcess3(data, param) {
        if (data.indexOf(this.searchWord) != -1) {
            let dict = data.split("|")
            let add_count = this.searchType === "a" ? 5 : 2
            let reduce_count = this.searchType === "a" ? 2 : 1
            for (let i = 0, len = dict.length; i < len; i += add_count) {
                let result = dict[i + reduce_count].indexOf(this.searchWord)
                if (chineseCurrentCount > chineseCount - 1) {
                    setTimeout(() => {
                        this.searchChineseCompleted();
                    }, 5)
                    return;
                } else if (result != -1) {
                    var obj
                    if (this.searchType == "a") {
                        obj = {
                            words: dict[i],
                            part: dict[i+1],
                            mean: dict[i+2],
                            ex: dict[i+3],
                            tran: dict[i+4],
                        }
                    } else if (this.searchType == "b") {
                        obj = {
                            words: dict[i],
                            part: "",
                            mean: dict[i+1],
                        }
                    }
                    this.searchChineseAddResult(obj);
                }
                if (i == len - 1) {
                    break;
                }
            }
        }
        if (param.length - 1 == param.index) {
            if (chineseSearchFileIndex != 25) {
                chineseSearchFileIndex++;
                this.readNormalText(internal_uri + searching_file + "_" + chineseSearchFileMap[chineseSearchFileIndex] + "_map.bin", (data) => {
                    this.getDictMap(data);
                    setTimeout(() => {
                        this.searchChineseWordProcess1();
                    }, 5)
                });
            } else if (chineseCurrentCount == 0) {
                setTimeout(() => {
                    this.searchChineseResultNullFunc();
                }, 5)
            } else if (chineseSearchFileIndex == 25) {
                setTimeout(() => {
                    this.searchChineseCompleted();
                }, 5)
            }
        } else {
            setTimeout(() => {
                this.searchChineseWordProcess2(param.process_list, param.length, param.index + 1);
            }, 5)
        }
    },
    searchChineseCompleted() {
        var preview_word = chineseResult.data[0]
        for (let i = 1, len = chineseResult.data.length;i < (len < 6 ? len : 6); i++) {
            preview_word = preview_word + ', ' + chineseResult.data[i]
        }
        chineseResult.preview = preview_word;
        this.recordIntoChineseHistory(() => {
            common.writeMultiParams({
                result: chineseResult,
                searchType: this.searchType,
                moveY: this.moveY,
                chineseWord: this.searchWord
            }, () => {
                router.replace({
                    uri: 'pages/show_word/show_word'
                });
            });
            KeepLight(false);
        });
    },
    searchChineseAddResult(obj) {
        let analyzeUri = `internal://app/history/${this.searchType}/${this.searchWord}`;
        if (chineseCurrentCount == 0) {
            this.checkFileExist(analyzeUri, (isExist) => {
                if (isExist) {
                    file.rmdir({
                        uri: analyzeUri,
                        recursive: true
                    });
                }
                file.mkdir({
                    uri: analyzeUri,
                    recursive: true
                });
            });
        }
        file.writeText({
            uri: analyzeUri + "/" + obj.words,
            text: JSON.stringify(obj)
        });
        chineseCurrentCount++;
        chineseResult.data.push(obj.words);
    },
    searchChineseResultNullFunc() {
        let replace_null = () => {
            common.writeMultiParams({
                result: null,
                moveY: this.moveY
            }, () => {
                router.replace({
                    uri: 'pages/show_word/show_word'
                });
            });
            KeepLight(false);
        }
        if (router.getLastUri() != "pages/search_keyboard/chinese/chinese") {
            replace_null();
        } else if (isAutoSearch && !this.isSearchAgain) {
            common.writeMultiParams({
                searchWord: this.searchWord,
                searchType: this.searchType === "a" ? "b" : "a",
                wantType: 'chinese',
                moveY: this.moveY,
                isSearchAgain: true
            }, () => {
                router.replace({
                    uri: "pages/search_word/search_word"
                });
            });
        } else {
            replace_null();
        }
    },
    recordIntoHistory(obj, callback) {
        let history_path = "internal://app/history";
        let write_uri = history_path + "/" + this.searchType + "/" + obj.words;
        let history = [];
        let write_data = [obj.words, this.searchType];
        let write_history = () => {
            file.writeText({
                uri: write_uri,
                text: JSON.stringify(obj)
            });
        }
        let write_history_list = () => {
            file.writeText({
                uri: history_path + "/list.json",
                text: JSON.stringify(history)
            });
        }
        file.readText({
            uri: history_path + "/list.json",
            length: 4096,
            success: (data) => {
                history = JSON.parse(data.text);
                for (let i = 0, len = history.length;i < len; i++) {
                    if (history[i][0] == obj.words && history[i][1] == this.searchType) {
                        history.splice(i, 1);
                        break;
                    }
                }
                history.unshift(write_data);
                if (history.length > historyCount) {
                    if (history[history.length - 1][1][1] == undefined) this.deleteFile(`${history_path}/${history[history.length - 1][1][0]}/${history[history.length - 1][0]}`);
                    else this.deleteDir(`${history_path}/${history[history.length - 1][1][0]}/${history[history.length - 1][0]}`)
                    history.splice(history.length - 1, 1);
                }
                write_history();
                write_history_list();
            },
            fail: (_data, code) => {
                if (code == 301) {
                    history.unshift(write_data);
                    write_history();
                    write_history_list();
                }
            }
        });
        callback();
    },
    recordIntoChineseHistory(callback) {
        let history_path = "internal://app/history";
        let write_path = `${history_path}/${this.searchType}/${this.searchWord}/list.json`;
        let history = [];
        let searchType = this.searchType + "C";
        let write_data = [chineseResult.words, searchType];
        let write_history = () => {
            file.writeText({
                uri: write_path,
                text: JSON.stringify(chineseResult)
            });
        }
        let write_history_list = () => {
            file.writeText({
                uri: history_path + "/list.json",
                text: JSON.stringify(history)
            });
        }
        file.readText({
            uri: history_path + "/list.json",
            length: 4096,
            success: (data) => {
                history = JSON.parse(data.text);
                for (let i = 0, len = history.length;i < len; i++) {
                    if (history[i][0] == chineseResult.words && history[i][1] == searchType) {
                        history.splice(i, 1);
                        break;
                    }
                }
                history.unshift(write_data);
                if (history.length > historyCount) {
                    if (history[history.length - 1][1][1] == undefined) this.deleteFile(`${history_path}/${history[history.length - 1][1][0]}/${history[history.length - 1][0]}`);
                    else this.deleteDir(`${history_path}/${history[history.length - 1][1][0]}/${history[history.length - 1][0]}`)
                    history.splice(history.length - 1, 1);
                }
                write_history();
                write_history_list();
            },
            fail: (_data, code) => {
                if (code == 301) {
                    history.unshift(write_data);
                    write_history();
                    write_history_list();
                }
            }
        });
        callback();
    },
    cleanData() {
        dict_map = null;
    },
    getDictMap(data) {
        dict_map = JSON.parse(data)
    },
    checkFileExist(uri, callback) {
        file.get({
            uri: uri,
            success: () => {
                callback(true);
            },
            fail: () => {
                callback(false);
            }
        });
    },
    readNormalText(uri, callback, failCallback, param=undefined) {
        file.get({
            uri: uri,
            success: (data) => {
                let length = data.length
                let read_count = Math.ceil(length / 4096)
                let temp = ""
                for (let i = 0;i < read_count; i++) {
                    file.readText({
                        uri: uri,
                        position: i * 4096,
                        length: 4096,
                        success: (data) => {
                            temp += data.text
                            if (i + 1 === read_count) {
                                callback(temp, param);
                                temp = null;
                            }
                        }
                    })
                }
            },
            fail: (data, code) => {
                failCallback({
                    data: data, code: code
                }, param);
            }
        })
    },
    readDictText(uri, length, position, callback, param=undefined) {
        let read_count = Math.ceil(length / 4096);
        let last_length = length % 4096
        let temp = ""
        for (let i = 0;i < read_count; i++) {
            file.readText({
                uri: uri,
                length: i === (read_count - 1) ? last_length : 4096,
                position: position + (i * 4096),
                success: (data) => {
                    temp += data.text
                    if (i === read_count - 1) {
                        callback(temp, param);
                        temp = null;
                    }
                }
            })
        }
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
    getSecondLetter(str) {
        var second_letter
        second_letter = String(str[1])
        if (!isNaN(Number(str[1]))) {
            second_letter = 'a'
        }
        if (str[1] == undefined) {
            second_letter = "a"
        }
        return second_letter
    },
    objectGetValues(data) {
        let keys = Object.keys(data)
        let buffer = []
        for (let i = 0, len = keys.length;i < len; i++) {
            buffer.push(data[keys[i]])
        }
        return buffer;
    }
}