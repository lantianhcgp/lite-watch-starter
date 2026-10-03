import router from '@system.router';
import vibrator from '@system.vibrator';
import app from '@system.app';

export default {
    data: {
        nowyear: 0,
        year: 0,
        month: 0,
        nowmonth: 0,
        day: 0,
        count: 0,
        datachange: false,
        left: 0,
        top: 0,
        render: false,
        right_if: true,
        left_if: true,
        date_content: [{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""},{"d":""}]
    },
    onInit() {
        if (this.datachange == false) {
            this.getdate();
            this.getnowdate();
        } else if (this.datachange = true) {
            this.getnowdate();
        }
        this.getday();
        this.getdatestate();
        this.renderui();
    },
    onShow() {
        let appData = getApp().data;
        if (appData.dateChange) {
            this.year = appData.newDate.year;
            this.month = appData.newDate.month;
            this.datachange = true;
            appData.dateChange = false;
            this.onInit();
        }
        app.setSwipeToDismiss(true);
    },
    onHide() {
        app.setSwipeToDismiss(false);
    },
    getdate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        this.year = year
        this.month = month
    },
    getnowdate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        this.nowyear = year
        this.nowmonth = month
        this.day = day
    },
    getday() {
        let year = this.year
        let month = this.month
        const days = new Date(year, month, -1);
        let count = days.getDate() + 1;
        this.count = count
    },
    getdatestate() {
        if ((this.year == 2037) && (this.month == 12)) {
            this.right_if = false
        } else if ((this.year == 1970) && (this.month == 1)) {
            this.left_if = false
        }
    },
    renderui() {
        let index = [7, 1, 2, 3, 4, 5, 6]
        let year = this.year
        let month = this.month
        let firstday = index[new Date(year, month - 1, 1).getDay()] - 2;
        for (let i = 1;i <= this.count; i++) {
            this.date_content[firstday+i].d = i
        }
        for (let i = 0; i <= firstday; i++) {
            this.date_content[i].d = "";
        }
        for (let i = firstday + this.count + 1; i < this.date_content.length; i++) {
            this.date_content[i].d = "";
        }
    },
    touchMove(e) {
        if (e.distance > 120 && e.direction == 'right') {
            if ((this.year != 1970) || (this.month != 1)) {
                this.swiperight();
            }
        } else if (e.direction == 'left' && e.distance > 120) {
            if ((this.year != 2037) || (this.month != 12)) {
                this.swipeleft();
            }
        } else if (e.direction == 'down' && e.distance > 120) {
            router.replace({
                uri: 'pages/index1/index1'
            })
        }
    },
    replacemore() {
        router.push({
            uri: 'pages/more/more',
            params: {
                year: this.year,
                month: this.month,
                datachange: this.datachange,
            }
        })
    },
    watchdate(day) {
        if (day != '') {
            router.push({
                uri: 'pages/daydetails/daydetails',
                params: {
                    year: this.year,
                    month: this.month,
                    day: day,
                    from: "details"
                }
            })
        }
    },
    swiperight() {
        if (this.month == 1) {
            this.year = this.year - 1
            this.month = 12
        } else {
            this.month = this.month - 1
        }
        this.getday();
        this.renderui();
        this.getdatestate();
    },
    sliderchange(data) {
        if (data.progress == 0) {
            router.replace({
                uri: 'pages/index1/index1',
            })
        }
    },
    swipeleft() {
        if (this.month == 12) {
            this.year = this.year + 1
            this.month = 1
        } else {
            this.month = this.month + 1
        }
        this.getday();
        this.renderui();
        this.getdatestate();
    },
    jumpto() {
        var that = this;
        vibrator.vibrate({
            mode: 'short',
            success: function () {
                router.push({
                    uri: 'pages/jumpto/jumpto',
                    params: {
                        from: 'details',
                        year: that.year,
                        month: that.month,
                        datachange: that.datachange,
                    }
                })
            }
        })
    },
}