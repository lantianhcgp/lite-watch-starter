import router from '../../common/router.js';
import data from '../../common/data.js';
import storage from '@system.storage';
import utils from '../../common/utils.js';
import { DAY_RANGE, PERIOD_RANGE, PERIOD_TIMES, WEEK_TYPES, COURSE_COLORS } from '../../common/constants.js';

export default {
    data: {
        mode: 'add',
        courseId: '',
        courseName: '',
        teacher: '',
        dayIndex: 0,
        startPeriodIndex: 0,
        endPeriodIndex: 0,
        weekTypeIndex: 0,
        dayRange: DAY_RANGE,
        periodRange: PERIOD_RANGE,
        pageTitle: '\u6dfb\u52a0\u8bfe\u7a0b',
        source: 'week',
        _loaded: false
    },
    onInit: function () {
        var params = router.getParams();
        if (params && params.mode === 'edit') {
            this.mode = 'edit';
            this.pageTitle = '\u7f16\u8f91\u8bfe\u7a0b';
        }
    },
    onShow: function () {
        var self = this;
        storage.get({
            key: 'nav_source',
            default: 'week',
            success: function (src) {
                self.source = src;
                if (self.mode === 'edit' && !self._loaded) {
                    storage.get({
                        key: 'nav_courseId',
                        default: '',
                        success: function (cid) {
                            if (cid) {
                                self.courseId = cid;
                                self.loadCourseData(cid);
                                self._loaded = true;
                            }
                        }
                    });
                }
            }
        });
    },
    loadCourseData: function (cid) {
        var page = this;
        data.findCourse(cid, function (c) {
            if (!c) return;
            page.courseName = c.name;
            page.teacher = c.teacher || '';
            page.dayIndex = c.dayOfWeek - 1;
            page.startPeriodIndex = c.startPeriod - 1;
            page.endPeriodIndex = c.endPeriod - 1;
            if (c.weekType === 'odd') page.weekTypeIndex = 1;
            else if (c.weekType === 'even') page.weekTypeIndex = 2;
            else page.weekTypeIndex = 0;
        });
    },
    onDayChange: function (e) { this.dayIndex = e.selected; },
    onStartPeriodChange: function (e) {
        this.startPeriodIndex = e.selected;
        if (this.endPeriodIndex < this.startPeriodIndex) this.endPeriodIndex = this.startPeriodIndex;
    },
    onEndPeriodChange: function (e) {
        this.endPeriodIndex = e.selected;
        if (this.endPeriodIndex < this.startPeriodIndex) this.startPeriodIndex = this.endPeriodIndex;
    },
    onWeekTypeAll: function () { this.weekTypeIndex = 0; },
    onWeekTypeOdd: function () { this.weekTypeIndex = 1; },
    onWeekTypeEven: function () { this.weekTypeIndex = 2; },
    onNameInput: function (e) { this.courseName = e.value; },
    onTeacherInput: function (e) { this.teacher = e.value; },
    onSave: function () {
        if (!this.courseName || this.courseName.trim() === '') return;
        var sp = this.startPeriodIndex + 1;
        var ep = this.endPeriodIndex + 1;
        if (ep < sp) ep = sp;
        var wt = WEEK_TYPES[this.weekTypeIndex].value;
        var course = {
            id: this.mode === 'edit' ? this.courseId : utils.generateId(),
            name: this.courseName.trim(),
            location: '',
            teacher: this.teacher ? this.teacher.trim() : '',
            dayOfWeek: this.dayIndex + 1,
            startPeriod: sp,
            endPeriod: ep,
            startTime: PERIOD_TIMES[sp - 1].start,
            endTime: PERIOD_TIMES[ep - 1].end,
            weekType: wt,
            weeks: [],
            colorIndex: 0
        };
        var src = this.source;
        var cb = function (ok) {
            if (ok) router.push({ uri: src === 'week' ? 'pages/week/week' : 'pages/index/index' });
        };
        if (this.mode === 'edit') data.updateCourse(course, cb);
        else data.addCourse(course, cb);
    },
    onCancel: function () {
        router.push({ uri: this.source === 'week' ? 'pages/week/week' : 'pages/index/index' });
    }
};