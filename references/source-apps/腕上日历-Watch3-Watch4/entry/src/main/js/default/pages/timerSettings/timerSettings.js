import storage from '@system.storage';

export default {
    data: {
        daychecked: true,
        weekchecked: false,
        monthchecked: false,
        yearchecked: false
    },
    onInit() {
        this.gettimerstate();
    },
    gettimerstate() {
        var that = this;
        storage.get({
            key: 'default_index',
            default: 'day',
            success: function (data) {
                switch (data) {
                    case 'day':
                        that.daychecked = true
                        break;
                    case 'week':
                        that.weekchecked = true
                        that.daychecked = false
                        break;
                    case 'month':
                        that.monthchecked = true
                        that.daychecked = false
                        break;
                    case 'year':
                        that.yearchecked = true
                        that.daychecked = false
                        break;
                }
            },
        })
    },
    dayclick() {
        this.daychecked = true
        this.weekchecked = false
        this.monthchecked = false
        this.yearchecked = false
        this.timeronDestroy();
    },
    weekclick() {
        this.daychecked = false
        this.weekchecked = true
        this.monthchecked = false
        this.yearchecked = false
        this.timeronDestroy();
    },
    monthclick() {
        this.daychecked = false
        this.weekchecked = false
        this.monthchecked = true
        this.yearchecked = false
        this.timeronDestroy();
    },
    yearclick() {
        this.daychecked = false
        this.weekchecked = false
        this.monthchecked = false
        this.yearchecked = true
        this.timeronDestroy();
    },
    timeronDestroy() {
        if (this.daychecked == true) {
            storage.set({
                key: 'default_index',
                value: 'day',
            })
        } else if (this.weekchecked == true) {
            storage.set({
                key: 'default_index',
                value: 'week',
            })
        } else if (this.monthchecked == true) {
            storage.set({
                key: 'default_index',
                value: 'month',
            })
        } else if (this.yearchecked == true) {
            storage.set({
                key: 'default_index',
                value: 'year',
            })
        }
    }
}
