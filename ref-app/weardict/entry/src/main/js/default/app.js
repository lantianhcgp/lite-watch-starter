import brightness from '@system.brightness';
import storage from '@system.storage';

var EMPTY_STRING = "NONE";

function checkEmptyData(data) {
    return Object.keys(data).length === 0 ? EMPTY_STRING : data;
}

function restoreObject(obj) {
    return obj === EMPTY_STRING ? {} : obj;
}

var isSavingData = false;
var isRestoredData = false;
var replaceParams = {};
var pagesArray = [];
var currentUri = "";
var saveDataObj = {};

export default {
    onCreate() {
        console.log("app onCreate");
        this.keepScreenOn();
    },
    onDestroy() {
        console.log("app onDestroy");
        brightness.setKeepScreenOn({
            keepScreenOn: false,
        });
    },
    onSaveData(e) {
        console.log("app onSaveData");
        storage.get({
            key: 'isNeedSaveData',
            default: "1",
            success: (data) => {
                let isNeedSaveData = data === "1";
                isSavingData = isNeedSaveData;
                if (isNeedSaveData) {
                    let saveData = {
                        params: checkEmptyData(replaceParams),
                        pages: pagesArray,
                        saveData: checkEmptyData(saveDataObj),
                        currentUri: currentUri
                    }
                    e.data = saveData;
                    return;
                }
                let longString = "this is a long string, this is a long string, this is a long string, this is a long string, this is a long string,";
                for (let i = 0; i < 5; i++) {
                    longString += longString;
                }
                e.data = longString; //利用超长字符串使得后台功能无法正常运行
            }
        });
    },
    onRestoreData(e) {
        console.log("app onRestoreData, restore state: " + JSON.stringify(e));
        this.keepScreenOn();
        if (e.errorCode !== 0) {
            return;
        }
        isRestoredData = true;
        replaceParams = restoreObject(e.data.params);
        pagesArray = e.data.pages;
        saveDataObj = restoreObject(e.data.saveData);
        currentUri = e.data.currentUri;
    },
    onPageChange(uri) {
        console.log("app trigger custom Lifecycle: onPageChange, change uri: " + uri);
        isSavingData = false;
        isRestoredData = false;
        currentUri = uri;
    },
    keepScreenOn() {
        storage.get({
            key: 'AlwaysOn',
            default: '1',
            success: function (data) {
                if (data == '1') {
                    brightness.setKeepScreenOn({
                        keepScreenOn: true
                    });
                }
            }
        });
    },
    getIsSavingData(callback) {
        callback(isSavingData);
    },
    getIsRestoredData(callback) {
        callback(isRestoredData);
    },
    cleanAllParams() {
        replaceParams = {};
    },
    getAllParams(func) {
        func(replaceParams);
    },
    addAllParams(params) {
        replaceParams = params;
    },
    getRouterUriList(func) {
        func(pagesArray);
    },
    writeRouterUriList(pages) {
        pagesArray = pages;
    },
    getCurrentUri(func) {
        func(currentUri);
    },
    saveData(data) {
        saveDataObj = data;
    },
    getData(callback) {
        callback(saveDataObj);
    },
    cleanData() {
        saveDataObj = {};
    }
}