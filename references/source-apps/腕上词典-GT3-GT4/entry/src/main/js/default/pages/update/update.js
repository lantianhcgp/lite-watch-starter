import router from '../../common/router.js';
import app from '@system.app';
import fetch from '@system.fetch';
import { KeepLight } from '../../common/Light.js';

export default {
    data: {
        isShow: {
            main: true,
            info: false,
            log: false
        },
        updateData: null,
        updateLogTextHeight: 600,
        appVersionCode: 0,
        appVersionName: "0.0.0",
        cloudVersionCode: 0,
        cloudVersionName: "0.0.0"
    },
    onShow() {
        KeepLight(true);
        this.checkUpdate(0);
    },
    checkUpdate(tryCount) {
        console.log("start check update.");
        if (fetch == undefined) {
            console.log("detected non-gt4 devices(not supported fetch modules), cancel update check.");
            this.updateData = -1;
            this.showInfoPage();
            return;
        }
        fetch.fetch({
            url: "https://cnoim.coding.net/api/user/cnoim/project/cnoim/shared-depot/weardict/git/blob/master/updateInfo.json",
            method: "GET",
            responseType: "json",
            success: (data) => {
                console.log("fetch get updateInfo.json info succeed, get content: " + data.data.data.file.data);
                this.updateData = JSON.parse(data.data.data.file.data);
                this.getUpdateData();
            },
            fail: (data, code) => {
                if (tryCount == 4) {
                    this.updateData = -1;
                    this.showInfoPage();
                    return;
                }
                this.checkUpdate(tryCount + 1);
            }
        });
    },
    getUpdateData() {
        console.log("received checkUpdate callback.");
        this.analyzeUpdateData();
        this.showInfoPage();
        KeepLight(false);
    },
    analyzeUpdateData() {
        this.appVersionCode = app.getInfo().versionCode;
        this.cloudVersionCode = this.updateData.latest.versionCode;
        this.appVersionName = app.getInfo().versionName;
        this.cloudVersionName = this.updateData.latest.versionName;
    },
    showInfoPage() {
        this.isShow.main = false;
        this.isShow.info = true;
    },
    handleShowUpdateLog() {
        this.updateLogTextHeight = this.getTextHeight("topBox", "bottomBox");
        this.isShow.info = false;
        this.isShow.log = true;
        this.rotation("log", true);
    },
    handleMainSwipe(e) {
        if (e.direction === 'right' && e.distance >= 150) {
            router.back();
        }
    },
    handleLogSwipe(e) {
        if (e.direction === 'right' && e.distance >= 150) {
            this.rotation("log", false);
            this.isShow.log = false;
            this.isShow.info = true;
        }
    },
    getTextHeight(topRef, bottomRef) {
        let topPosition = this.$refs[topRef].getPosition();
        let bottomPosition = this.$refs[bottomRef].getPosition();
        let textHeight = bottomPosition.y - topPosition.y;
        return textHeight;
    },
    rotation(ref, focus) {
        setTimeout(() => {
            if (this.$refs[ref] && this.$refs[ref].rotation) {
                this.$refs[ref].rotation({
                    focus: focus
                });
            }
        }, 50);
    }
}
