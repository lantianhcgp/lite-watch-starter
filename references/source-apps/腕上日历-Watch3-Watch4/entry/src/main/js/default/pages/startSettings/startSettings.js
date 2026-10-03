import storage from '@system.storage';

export default {
    data: {
        indexchecked: true,
        detailschecked: false,
        festivalchecked: false,
        adjustholidaychecked: false,
        solartermchecked: false,
        timerchecked: false,
    },
    onInit() {
        this.getdatastate();
    },
    getdatastate() {
        var that = this;
        storage.get({
            key: 'whenstart',
            default: 'index',
            success: function (data) {
                switch (data) {
                    case 'index':
                        that.indexchecked = true
                        break;
                    case 'details':
                        that.detailschecked = true
                        that.indexchecked = false
                        break;
                    case 'festival':
                        that.festivalchecked = true
                        that.indexchecked = false
                        break;
                    case 'adjustholiday':
                        that.adjustholidaychecked = true
                        that.indexchecked = false
                        break;
                    case 'solarterm':
                        that.solartermchecked = true
                        that.indexchecked = false
                        break;
                    case 'timer':
                        that.timerchecked = true
                        that.indexchecked = false
                        break;
                }
            },
        })
    },
    indexclick() {
        this.indexchecked = true
        this.detailschecked = false
        this.adjustholidaychecked = false
        this.festivalchecked = false
        this.solartermchecked = false
        this.timerchecked = false
        this.selectonDestroy();
    },
    detailsclick() {
        this.indexchecked = false
        this.detailschecked = true
        this.adjustholidaychecked = false
        this.festivalchecked = false
        this.solartermchecked = false
        this.timerchecked = false
        this.selectonDestroy();
    },
    festivalclick() {
        this.indexchecked = false
        this.detailschecked = false
        this.adjustholidaychecked = false
        this.festivalchecked = true
        this.solartermchecked = false
        this.timerchecked = false
        this.selectonDestroy();
    },
    adjustholidayclick() {
        this.indexchecked = false
        this.detailschecked = false
        this.adjustholidaychecked = true
        this.festivalchecked = false
        this.solartermchecked = false
        this.timerchecked = false
        this.selectonDestroy();
    },
    solartermclick() {
        this.indexchecked = false
        this.detailschecked = false
        this.adjustholidaychecked = false
        this.festivalchecked = false
        this.solartermchecked = true
        this.timerchecked = false
        this.selectonDestroy();
    },
    timerclick() {
        this.indexchecked = false
        this.detailschecked = false
        this.adjustholidaychecked = false
        this.festivalchecked = false
        this.solartermchecked = false
        this.timerchecked = true
        this.selectonDestroy();
    },
    selectonDestroy() {
        if (this.detailschecked == true) {
            storage.set({
                key: 'whenstart',
                value: 'details',
            })
        } else if (this.indexchecked == true) {
            storage.set({
                key: 'whenstart',
                value: 'index',
            })
        } else if (this.festivalchecked == true) {
            storage.set({
                key: 'whenstart',
                value: 'festival',
            })
        } else if (this.adjustholidaychecked == true) {
            storage.set({
                key: 'whenstart',
                value: 'adjustholiday',
            })
        } else if (this.solartermchecked == true) {
            storage.set({
                key: 'whenstart',
                value: 'solarterm',
            })
        } else if (this.timerchecked == true) {
            storage.set({
                key: 'whenstart',
                value: 'timer',
            })
        }
    }
}
