import storage from '@system.storage';
import app from '@system.app';
import router from '@system.router';

var index = [6, 0, 1, 2, 3, 4, 5];
var dateArr = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

export default {
    data: {
        daytimer: "00.0",
        daytotal: "00时00分00秒",
        weektimer: "00.0",
        weektotal: "0天00时\n00分00秒",
        monthtimer: "00.0",
        monthtotal: "00天00时\n00分00秒",
        yeartimer: "00.0",
        yeartotal: "000天00时\n00分00秒",
        index: 0,
        interval: null
    },
    onInit() {
        this.getdefaultindex();
    },
    indexonchange(e) {
        this.index = e.index;
    },
    getdefaultindex() {
        var that = this;
        storage.get({
            key: 'default_index',
            default: 'day',
            success: function (data) {
                console.log(data)
                switch (data) {
                    case 'day':
                        that.index = 0
                        break;
                    case 'week':
                        that.index = 1
                        break;
                    case 'month':
                        that.index = 2
                        break;
                    case 'year':
                        that.index = 3
                        break;
                }
            },
        })
    },
    onShow() {
        var that = this;
        that.getdate();
        this.interval = setInterval(that.getdate, 500);
    },
    onHide() {
        clearInterval(this.interval);
    },
    getdate() {
        const date = new Date();
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let month = date.getMonth() + 1;
        let daytime = date.getDate() - 1;
        let day = index[date.getDay()];
        const date1 = new Date(year, month, -1);
        let count = date1.getDate() + 1;
        var hourstotal = hours;
        var minutestotal = minutes;
        var secondstotal = seconds;
        if (hourstotal < 10) {
            hourstotal = "0" + hourstotal;
        }
        if (minutestotal < 10) {
            minutestotal = "0" + minutestotal;
        }
        if (secondstotal < 10) {
            secondstotal = "0" + secondstotal;
        }
        this.daytotal = hourstotal + "时" + minutestotal + "分" + secondstotal + "秒"
        this.weektotal = day + "天" + hourstotal + "时" + "\n" + minutestotal + "分" + secondstotal + "秒"
        this.monthtotal = daytime + "天" + hourstotal + "时" + "\n" + minutestotal + "分" + secondstotal + "秒"
        if ((year % 4 == 0 && year % 100 != 0) || (year % 100 == 0 && year % 400 == 0)) {
            var yearcount = 31622400;
        } else {
            yearcount = 31536000;
        }
        if (count == 28) {
            var monthcount = 2419600;
        } else if (count == 29) {
            monthcount = 2505600;
        } else if (count == 30) {
            monthcount = 2592000;
        } else if (count == 31) {
            monthcount = 2678400;
        }
        var daycount = 0;
        for (var i = 0; i < month - 1; i++) {
            daycount += dateArr[i];
        }
        daycount = daycount + daytime;
        this.yeartotal = daycount + "天" + hourstotal + "时" + "\n" + minutestotal + "分" + secondstotal + "秒"
        let daytotal = (hours * 3600) + (minutes * 60) + seconds;
        let weektotal = day * 86400 + daytotal;
        let monthtotal = daytime * 86400 + daytotal;
        let yeartotal = daycount * 86400 + daytotal;
        var daytimer = Number((daytotal / 86400) * 100).toFixed(1);
        var weektimer = Number((weektotal / 604800) * 100).toFixed(1);
        var monthtimer = Number((monthtotal / monthcount) * 100).toFixed(1);
        var yeartimer = Number((yeartotal / yearcount) * 100).toFixed(1);
        if (Number(daytimer) < 10) {
            daytimer = "0" + daytimer;
        } else if (Number(daytimer) == 100) {
            daytimer = String(100)
        }
        if (Number(weektimer) < 10) {
            weektimer = "0" + weektimer;
        } else if (Number(weektimer) == 100) {
            weektimer = String(100)
        }
        if (Number(monthtimer) < 10) {
            monthtimer = "0" + monthtimer;
        } else if (Number(monthtimer) == 100) {
            monthtimer = String(100)
        }
        if (Number(yeartimer) < 10) {
            yeartimer = "0" + yeartimer;
        } else if (Number(yeartimer) == 100) {
            yeartimer = String(100)
        }
        if (this.daytimer != daytimer) {
            this.daytimer = daytimer;
        }
        if (this.weektimer != weektimer) {
            this.weektimer = weektimer;
        }
        if (this.monthtimer != monthtimer) {
            this.monthtimer = monthtimer;
        }
        if (this.yeartimer != yeartimer) {
            this.yeartimer = yeartimer;
        }
    },
};
