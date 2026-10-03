let time_worked = {};

let timerWorker = {
    timer_type: {
        timeout: 0,
        interval: 1
    },
    add: (name, type, func, timeout, cleanAfterExec=false) => {
        let callType = type === timerWorker.timer_type.timeout ? setTimeout : setInterval;
        let timeId = callType(() => {
            func();
            if (cleanAfterExec) timerWorker.clean(name);
        }, timeout);
        time_worked[name] = {
            type: type,
            timeId: timeId
        };
    },
    clean: (name) => {
        let obj = time_worked[name];
        if (!obj) return;
        if (obj.type == timerWorker.timer_type.timeout) {
            clearTimeout(obj.timeId);
            delete time_worked[name];
        } else if (obj.type == timerWorker.timer_type.interval) {
            clearInterval(obj.timeId);
            delete time_worked[name];
        }
    },
    isExist: (name) => {
        return time_worked[name] == true;
    }
};

export { timerWorker };