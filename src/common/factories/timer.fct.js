var ga = window.ga;
module.exports = angular.module(__filename,[])
    .factory('Timer', function ($rootScope,$timeout) {
        var _duration = Symbol('_duration');
        var _on = Symbol('_on');
        var _emit = Symbol('_emit');
        var durationOption = {
            trim: false,
            template: 'hh:mm:ss'
        };
        /** [10h] [10m] [10s] [10ms] */
        /** [10hour] [10min] [10sec] [10milisec] */
        /** [10hour[s]] [10minute[s]] [10second[s]] [10[milisec[s]] */
        var hours = "(?:(\\d{1,2})\\s*(?:h|hour|hours)\\b)?"  //\b is word boundary
            ,minutes = "(?:(\\d{1,2})\\s*(?:m|min|minute|minutes)\\b)?"
            ,seconds = "(?:(\\d{1,2})\\s*(?:s|sec|second|seconds)\\b)?"
            ,miliseconds = "(?:(\\d{1,2})\\s*(?:ms|milisec|milisecs)\\b)?"
            ;
        var format = [hours,minutes,seconds,miliseconds].join('\\s*')
            ,timeExtractor = new RegExp(format);
        function parseDuration(text){
            var breakdown = (text || '').match( timeExtractor );
            var describTime = null;
            if(breakdown[0]){ //if !=''
                describTime = {
                    h: breakdown[1]*1 || 0,
                    m: breakdown[2]*1 || 0,
                    s: breakdown[3]*1 || 0,
                    ms: breakdown[4]*1 || 0
                };

            }

            return breakdown[0]?describTime:text;
        }


        function Timer(durationText){
            var me = this;
            this[_on]= {};
            this[_emit]= {};
            this.state = {
                 pause : true,
                 setted : false,
                 timeEnd : false, /*mean time reached the end*/
                 start  : false,
                 stop: true
            };
            var previousCycle = new Date();

            /** generate events code **/
            var events = 'start,pause,reset,setduration,update,timeEnd'.split(',');
            events.forEach(function (eventName) {
                var queue = me[_on][eventName] = [];
                /*listeners*/
                me['on'+_.capitalize(eventName)] =  queue.push.bind(queue);
                /*emits*/
                me[_emit][eventName] = function () {
                    _.over(queue).apply(me,arguments);
                };
            });

            this.setDuration( durationText );
            cycle(updateTimer);
            /*cycle*/
            function cycle(callback){
                var time = Date.now();
                callback(time, previousCycle);
                previousCycle = time;
                requestAnimationFrame(cycle.bind(this,callback));
            }

            function updateTimer(time,prevTime){
                if(me.state.pause) return ;
                if(me.state.stop) return ;

                var timePass = time - prevTime;
                var duration = me[_duration];
                duration.subtract(timePass,'milliseconds');
                //console.log(timePass, duration.asMilliseconds());


                if( duration.asMilliseconds() <= 0 ){
                    duration.add( -duration.asMilliseconds() );
                    me.pause();
                    me.state.timeEnd = true;
                    me.state.stop = true;
                    me[_emit].timeEnd(duration);
                    /* google analytic */
                    ga && ga( 'Timer.send', 'event', 'Timer', 'time end', 'duration', this.durationText );
                }
                me[_emit].update(duration);

                //!$rootScope.$$phase && $rootScope.$digest(); //bad way
                $timeout();//good way
            }
        }
        var events = 'reset'.split(',');
        _.extend(Timer.prototype,{
            setDuration: function setDuration( durationText ) {
                var durationDescription = parseDuration(durationText);
                durationDescription = durationDescription || this.durationDescription;
                this[_duration] =  moment.duration( durationDescription );
                this.durationDescription = durationDescription;
                /*state*/
                this.state.timeEnd = false;
                this.state.setted = (this[_duration].asMilliseconds() > 0);
                /*event*/
                this[_emit].setduration( this[_duration] );
                this[_emit].update( this[_duration] )
            },
            getDuration:function getDuration(){
                return this[_duration];
            },
            start: function start(){
                if(!this.state.timeEnd){
                    /*state*/
                    this.state.start = true;
                    this.state.pause = false;
                    this.state.stop = false;
                    this.state.timeEnd = false;
                    /*event*/
                    this[_emit].start( this[_duration] );
                    /* google analytic */
                    ga && ga('Timer.send', 'event', 'Timer', 'start', 'time', this[_duration].format(durationOption) );
                }
            },
            pause: function pause () {
                //ga('create', 'UA-XXXXX-Y', 'auto', 'stop timter');
                //_trackEvent('timer', 'start', time)
                /*state*/
                this.state.start = false;
                this.state.pause = true;
                this.state.stop = false;
                this.state.timeEnd = false;
                /*event*/
                this[_emit].pause( this[_duration] );

                /* google analytic */
                ga && ga('Timer.send', 'event', 'Timer', 'pause', 'time', this[_duration].format(durationOption) );

            },
            reset: function reset(){
                this.setDuration();
                /*state*/
                this.state.start = false;
                this.state.pause = false;
                this.state.stop = true;
                this.state.timeEnd = false;

                this[_emit].reset( this[_duration] );
                /* google analytic */
                ga && ga('Timer.send', 'event', 'Timer', 'reset', 'time', this[_duration].format(durationOption) );
            },
            restart: function restart () {
                //ga('create', 'UA-XXXXX-Y', 'auto', 'start timer');
                this.reset();
                this.start();
            },
            stop: function(){
                this.reset();
            }
        });


        return Timer;
    });

