/**
 * Created by pery on 31/01/2016.
 */
require('./simpleTimer.scss');

function timerController($scope, $location, $timeout, Timer){
   /* var context = $scope.context;
    var timer = context.timer = new Timer(context.duration);

    if('autostart' in $location.search()){
        timer.start();
    }
    $scope.$watch('context.duration', function (nv) {
        timer.setDuration(nv);
    })
*/
}

module.exports.stateConfig = {
    name:"timer",
    url:"/timer",
    abstract:false,
    template: require("./simpleTimer.html"),
    controller: timerController
};