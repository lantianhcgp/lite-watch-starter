import router from '../../common/router.js'
import app from '@system.app';
import storage from '@system.storage';
import fetch from '@system.fetch';

let timeInterval

function getIconPath(name) {
    return '/common/' + name;
}

let clickObj = {
    search() {
        router.push({
            uri: 'pages/input_method_editor/input_method_editor',
        })
    },
    about() {
        router.push({
            uri: 'pages/about/about',
        })
    },
    wordbook() {
        router.push({
            uri: 'pages/wordbook/wordbook',
        })
    },
    history() {
        router.push({
            uri: 'pages/history/history',
        })
    },
    settings() {
        router.push({
            uri: 'pages/settings/settings',
        })
    },
    feedback() {
        router.push({
            uri: 'pages/feedback/feedback',
        });
    },
    update() {
        router.push({
            uri: 'pages/update/update',
        });
    }
}

export default {
    data: {
        timeString: "",
        RounderBackgroundValue: {
            background: "transparent",
            radius: 0
        },
        isShowFeedback: true,
        list: [{
            name: "搜索单词", icon: getIconPath("search.png"), click: clickObj.search
        }, {
            name: "单词笔记", icon: getIconPath("wordbook.png"), click: clickObj.wordbook
        }, {
            name: "搜索历史", icon: getIconPath("history.png"), click: clickObj.history
        }, {
            name: "词典设置", icon: getIconPath("settings.png"), click: clickObj.settings
        }, {
            name: "关于词典", icon: getIconPath("about.png"), click: clickObj.about
        }]
    },
    onInit() {
        this.getTime();
        this.getUpdateAvailable();
        this.getBackgroundSettings();
        storage.get({
            key: 'ShowFeedback',
            default: '1',
            success: (data) => {
                if (data == '1') {
                    this.list.push({
                        name: "意见反馈", icon: getIconPath("feedback.png"), click: clickObj.feedback
                    });
                }
            }
        });
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
    getUpdateAvailable() {
        if (!!fetch) {
            this.list.push({
                name: "检查更新", icon: getIconPath("update.png"), click: clickObj.update
            });
        }
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
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation();
        }
    },
    onHide() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation({
                focus: false
            });
        }
    },
    onDestroy() {
        clearInterval(timeInterval);
    },
    onswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            app.terminate();
        }
    }
}
