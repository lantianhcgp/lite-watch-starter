import router from '../../common/router.js';
import data from '../../common/data.js';
import storage from '@system.storage';
import utils from '../../common/utils.js';
import { DAY_NAMES, DAY_NAMES_SHORT, COURSE_COLORS, PERIOD_TIMES } from '../../common/constants.js';

export default {
    data: {
        currentWeek: 1,
        weekDisplay: '',
        selectedDay: 1,
        dayCourses: [],
        isEmpty: true
    },
    onInit: function () {
        this.selectedDay = utils.getDayOfWeek();
        this.loadData();
    },
    onShow: function () {
        this.loadData();
        this.enableRotation('courseList', true);
    },
    onHide: function () {
        this.enableRotation('courseList', false);
    },
    onDestroy: function () {
        this.enableRotation('courseList', false);
    },
    enableRotation: function (ref, value) {
        var r = this.$refs[ref];
        if (r && r.rotation) {
            r.rotation({ focus: value });
        }
    },
    onDaySelect: function (day) {
        this.selectedDay = day;
        this.loadDayCourses();
    },
    loadData: function () {
        var self = this;
        data.loadSettings(function (settings) {
            self.currentWeek = utils.calculateCurrentWeek(settings.semesterStart);
            self.weekDisplay = '\u7b2c' + self.currentWeek + '\u5468';
            self.loadDayCourses();
        });
    },
    loadDayCourses: function () {
        var self = this;
        data.getCoursesForDay(self.selectedDay, self.currentWeek, function (courses) {
            var list = [];
            var now = utils.getCurrentMinutes();
            var today = utils.getDayOfWeek();
            for (var i = 0; i < courses.length; i++) {
                var c = courses[i];
                var startMin = utils.timeToMinutes(c.startTime);
                var endMin = utils.timeToMinutes(c.endTime);
                var statusColor = '#4caf50';
                if (self.selectedDay < today || (self.selectedDay === today && now >= endMin)) {
                    statusColor = '#f44336';
                } else if (self.selectedDay === today && now >= startMin && now < endMin) {
                    statusColor = '#ffc107';
                }
                list.push({
                    id: c.id,
                    name: c.name,
                    teacher: c.teacher,
                    
                    timeRange: c.startTime + ' - ' + c.endTime,
                    periodText: c.startPeriod + '-' + c.endPeriod + '\u8282',
                    color: COURSE_COLORS[c.colorIndex || 0],
                    statusColor: statusColor
                });
            }
            /* 脏检查：同一天重复 onShow 不重建列表（性能优化 2026-10-10） */
            var key = self.selectedDay + ':' + JSON.stringify(list);
            if (self._dayKey === key) { return; }
            self._dayKey = key;
            self.dayCourses = list;
            self.isEmpty = list.length === 0;
        });
    },
    onSyncClick: function () {
        router.push({ uri: 'pages/sync/sync' });
    },
    onCourseClick: function (courseId) {
        if (!courseId) return;
        storage.set({
            key: 'nav_courseId',
            value: courseId,
            success: function () {
                storage.set({
                    key: 'nav_source',
                    value: 'week',
                    success: function () {
                        router.push({ uri: 'pages/detail/detail' });
                    }
                });
            }
        });
    },
    onBack: function () {
        router.push({ uri: 'pages/index/index' });
    }
};