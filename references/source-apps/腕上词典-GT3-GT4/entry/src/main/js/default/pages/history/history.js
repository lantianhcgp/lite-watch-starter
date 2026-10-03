import router from '../../common/router.js';
import fs from '../../common/fs';
import storage from '@system.storage';
import common from '../../common/common.js';

let working_uri = "internal://app/history";
let history = [];
let render_temp = [];

var index = 0;

fs.readLargeFile(working_uri + "/list.json", (err, data) => {
    if (err) {
        fs.printGeneralError(fs, data);
        return;
    }
    history = JSON.parse(data);
    data = null;
    if (history.length == 0) {
        return;
    }
    analyzeItem();
});

function analyzeItem(renderObj = render_temp) {
    var item_uri = "";
    var obj;
    var len = history.length;
    for (let i = index; i < len; i++) {
        if (history[index] != undefined) {
            item_uri = working_uri + "/" + history[index][1][0] + "/" + history[index][0];
            if (history[index][1][1] != undefined) {
                fs.rawApi.readText({
                    uri: item_uri + "/list.json",
                    length: 4096,
                    success: (data) => {
                        obj = JSON.parse(data.text);
                        data.text = null;
                        obj.showMean = obj.preview;
                        renderObj.push(obj);
                    }
                })
            } else {
                fs.rawApi.readText({
                    uri: item_uri,
                    success: (data) => {
                        obj = JSON.parse(data.text);
                        data.text = null;
                        obj.showMean = obj.part + obj.mean;
                        renderObj.push(obj);
                    }
                });
            }
        }
        index++;
    }
    obj = null;
    item_uri = null;
}

var deleteItem = -1;

export default {
    data: {
        content: render_temp,
        showDialog: false,
        showLoading: false,
        historyCount: 30,
        totalCount: history.length,
        moveY: -1,
        RounderBackgroundValue: {
            background: "transparent",
            radius: 0
        }
    },
    onInit() {
        this.getBackgroundSettings();
        common.clean();
        storage.get({
            key: 'historyCount',
            default: '30',
            success: (data) => {
                this.historyCount = Number(data)
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
    onShow() {
        this.rotation("list", true);
        if (this.moveY !== -1) {
            if (this.$refs.list.scrollBy) {
                this.$refs.list.scrollBy({
                    distance: -this.moveY
                });
            }
        }
    },
    onHide() {
        this.rotation("list", false);
    },
    onDestroy() {
        history = null;
    },
    showdetails(index, event) {
        var offset = -1;
        if (event) {
            if (event.globalY < 160) offset += 1;
            if (event.globalY > 320) offset -= 1;
        }
        let moveY = ((index + offset) * 160) + 100;
        var isChinese = this.content[index].preview !== undefined;
        common.writeMultiParams({
            result: this.content[index],
            searchType: this.content[index].type,
            chineseWord: isChinese ? this.content[index].words : null,
            moveY: moveY
        }, () => {
            var push = () => {
                router.push({
                    uri: 'pages/show_word/show_word'
                });
            }
            if (isChinese) {
                this.showLoading = true;
                setTimeout(push, 100);
            } else {
                push();
            }
        });
    },
    touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.back();
        }
    },
    reRenderList(_index) {
        index = _index;
        this.content = [];
        analyzeItem(this.content);
    },
    rotation(ref, value) {
        if (this.$refs[ref].rotation) {
            this.$refs[ref].rotation({
                focus: value
            });
        }
    },
    doNotPropagation(event) {
        event[event.StopPropagation ? "StopPropagation" : "stopPropagation"]();
    },
    dialogClick(event) {
        this.exitDialog();
        this.doNotPropagation(event);
    },
    handleDelete(index) {
        deleteItem = index;
        this.rotation("list", false);
        this.showDialog = true;
    },
    exitDialog() {
        deleteItem = -1;
        this.showDialog = false;
        this.rotation("list", true);
    },
    dialogSwipe(e) {
        if (e.direction == "down" && (e.distance ? e.distance >= 80 : true)) {
            this.exitDialog();
        }
    },
    confirmDelete() {
        let then = () => {
            history.splice(deleteItem, 1);
            fs.rawApi.writeText({
                uri: working_uri + "/list.json",
                text: JSON.stringify(history)
            });
            deleteItem = -1;
            setTimeout(this.exitDialog, 60);
        }
        this.content.splice(deleteItem, 1);
        if (history[deleteItem][1][1] != undefined) {
            fs.rawApi.rmdir({
                uri: working_uri + "/" + history[deleteItem][1][0] + "/" + history[deleteItem][0],
                recursive: true,
                success: then
            });
        } else {
            fs.rawApi.delete({
                uri: working_uri + "/" + history[deleteItem][1][0] + "/" + history[deleteItem][0],
                success: then
            });
        }
    }
}
