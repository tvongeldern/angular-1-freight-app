app.service('timeDateSvc', function($filter){

    function differenceInDays(firstDate, secondDate) {
        var dt1 = firstDate.split('-'),
            dt2 = secondDate.split('-'),
            one = new Date(dt1[0], dt1[1]-1, dt1[2]),
            two = new Date(dt2[0], dt2[1]-1, dt2[2]);

        var millisecondsPerDay = 1000 * 60 * 60 * 24;
        var millisBetween = two.getTime() - one.getTime();
        var days = millisBetween / millisecondsPerDay;

        return Math.floor(days);
    }

    function differenceInMinutes(firstTime, secondTime) {
        var t1 = firstTime.split(':');
        var t2 = secondTime.split(':');
        var time1 = (60 * parseInt(t1[0])) + parseInt(t1[1]);
        var time2 = (60 * parseInt(t2[0])) + parseInt(t2[1]);
        return (time2 - time1);
    }

    function parseTime(time){
        return parseInt(time.slice(0,2)) > 12 ? (parseInt(time.slice(0,2)) - 12) + ":" + time.slice(3,5) + " PM" : parseInt(time.slice(0,2)) == 12 ? time.slice(0,-3) + " PM" : time.slice(0,-3) + " AM";
    }

    function relativeDate(date){
        var today = $filter('date')(new Date(),'yyyy-MM-dd');
        var diff = this.differenceInDays(today, date);
        if (diff == 0){
            return "today";
        } else if (diff == -1){
            return "yesterday";
        } else if (diff == 1){
            return "tommorrow";
        } else {
            var arr = date.split('-');
            return " on " + arr[1] + '/' + arr[2] + '/' + arr[0];
        }
    }

    return {
        differenceInDays,
        differenceInMinutes,
        parseTime,
        relativeDate
    }

});
