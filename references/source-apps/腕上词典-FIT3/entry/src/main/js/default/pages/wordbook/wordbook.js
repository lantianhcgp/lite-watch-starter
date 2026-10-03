import router from '../../common/router.js';
import fs from '../../common/fs.js';
import common from '../../common/common.js';
import storage from '@system.storage';

let working_uri = "internal://app/wordbook";
let timeInterval
let wordbook = [];
let render_temp = [];

var index = 0;

function analyzeItem() {
    var item_uri = "";
    var obj;
    for (let i = 0, len = wordbook.length; i < len; i++) {
        if (wordbook[index] != undefined) {
            item_uri = working_uri + "/" + wordbook[index][1][0] + "/" + wordbook[index][0];
            fs.rawApi.readText({
                uri: item_uri,
                success: (data) => {
                    obj = JSON.parse(data.text);
                    data.text = null;
                    obj.showMean = obj.part + obj.mean;
                    render_temp.push(obj);
                }
            })
        }
        index++;
    }
    item_uri = null;
    obj = null;
}

fs.readLargeFile(working_uri + "/list.json", (err, data) => {
    if (err) {
        fs.printGeneralError(fs, data);
        return;
    }
    wordbook = JSON.parse(data);
    data = null;
    if (wordbook.length == 0) {
        return;
    }
    analyzeItem();
});

var deleteItem = -1;

export default {
    data: {
        content: render_temp,
        showDialog: false,
        totalCount: wordbook.length,
        moveY: -1,
        RounderBackgroundValue: {
            background: "transparent",
            radius: 0
        },
    },
    onInit() {
        this.getTime();
        this.getBackgroundSettings();
        common.clean();
    },
    getBackgroundSettings() {
        storage.get({
            key: 'RounderBackground',
            default: '1',
            success: (data) => {
                if (data == '1') {
                    this.RounderBackgroundValue.background = "rgb(36,36,36)";
                    this.RounderBackgroundValue.radius = 75;
                }
            }
        });
    },
    getTime() {
        var getTime = () => {
            var date = new Date();
            var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
            var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
            let timeString = hh + ':' + mm;
            if (this.timeString != timeString) this.timeString = timeString;
        }
        timeInterval = setInterval(getTime, 1000);
        getTime();
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
        clearInterval(timeInterval);
        wordbook = null;
    },
    showdetails(index, event) {
        var offset = -1;
        if (event) {
            if (event.globalY < 160) offset += 1;
            if (event.globalY > 320) offset -= 1;
        }
        let moveY = ((index + offset) * 160) + 100;
        common.writeMultiParams({
            result: this.content[index],
            searchType: this.content[index].type,
            moveY: moveY
        }, () => {
            router.push({
                uri: 'pages/show_word/show_word'
            });
        });
    },
    touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.back();
        }
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
        if (e.direction == "right" && (e.distance ? e.distance >= 150 : true)) {
            this.exitDialog();
        }
    },
    confirmDelete() {
        let then = () => {
            wordbook.splice(deleteItem, 1);
            this.totalCount = wordbook.length;
            fs.rawApi.writeText({
                uri: working_uri + "/list.json",
                text: JSON.stringify(wordbook)
            });
            deleteItem = -1;
            setTimeout(this.exitDialog, 100);
        }
        this.content.splice(deleteItem, 1);
        fs.rawApi.delete({
            uri: working_uri + "/" + wordbook[deleteItem][1][0] + "/" + wordbook[deleteItem][0],
            success: then
        });
    }
}
