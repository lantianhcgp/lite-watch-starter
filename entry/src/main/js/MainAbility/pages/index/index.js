import router from '../../common/router.js';
import data from '../../common/data.js';
import storage from '@system.storage';
import utils from '../../common/utils.js';
import { DAY_NAMES, COURSE_COLORS } from '../../common/constants.js';

export default {
    data: {
        dayName: '',
        weekDisplay: '',
        todayCourses: [],
        isEmpty: true
    },
    onInit: function () {
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
        data.clearCache();
    },
    enableRotation: function (ref, value) {
        var r = this.$refs[ref];
        if (r && r.rotation) {
            r.rotation({ focus: value });
        }
    },
    loadData: function () {
        var self = this;
        var day = utils.getDayOfWeek();
        self.dayName = DAY_NAMES[day];
        data.loadSettings(function (settings) {
            var week = utils.calculateCurrentWeek(settings.semesterStart);
            self.weekDisplay = utils.getDateString() + ' \u7b2c' + week + '\u5468';
            data.getCoursesForDay(day, week, function (courses) {
                var list = [];
                var now = utils.getCurrentMinutes();
                var currentIdx = -1;
                var nextIdx = -1;
                for (var i = 0; i < courses.length; i++) {
                    var c = courses[i];
                    var startMin = utils.timeToMinutes(c.startTime);
                    var endMin = utils.timeToMinutes(c.endTime);
                    var statusColor = '#4caf50';
                    if (now >= endMin) {
                        statusColor = '#f44336';
                    } else if (now >= startMin) {
                        statusColor = '#ffc107';
                        currentIdx = i;
                    } else if (nextIdx < 0) {
                        nextIdx = i;
                    }
                    list.push({
                        id: c.id, name: c.name, teacher: c.teacher,
                        timeRange: c.startTime + ' - ' + c.endTime,
                        periodText: c.startPeriod + '-' + c.endPeriod + '\u8282',
                        statusColor: statusColor
                    });
                }
                /* 脏检查：onInit+onShow 会连调两次，数据没变跳过整体重建，
                 * 避免 Lite 上的重复列表渲染（性能优化 2026-10-10） */
                var key = JSON.stringify(list);
                if (self._listKey === key) { return; }
                self._listKey = key;
                self.todayCourses = list;
                self.isEmpty = list.length === 0;
                /* 上课中滚到当前课；没在上课滚到下一节要上的课（用户需求
                 * 2026-10-10）；全部上完则不滚 */
                var target = currentIdx >= 0 ? currentIdx : nextIdx;
                if (target > 0) {
                    setTimeout(function () {
                        var listRef = self.$refs.courseList;
                        if (listRef && listRef.scrollTo) {
                            listRef.scrollTo({ index: target });
                        }
                    }, 32);
                }
            });
        });
    },
    onCourseClick: function (courseId) {
        storage.set({
            key: 'nav_courseId',
            value: courseId,
            success: function () {
                storage.set({
                    key: 'nav_source',
                    value: 'main',
                    success: function () {
                        router.push({ uri: 'pages/detail/detail' });
                    }
                });
            }
        });
    },
    onWeekViewClick: function () {
        router.push({ uri: 'pages/week/week' });
    },
    onSyncClick: function () {
        router.push({ uri: 'pages/sync/sync' });
    },
    onSwipe: function (e) {
        if (e.direction === 'right' && e.distance >= 150) { router.back(); }
    }
};