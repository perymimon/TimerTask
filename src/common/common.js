/**
 * Created by pery on 06/02/2016.
 */

require('./styleFx/elegantShadow.scss')

module.exports = angular.module(__filename, [
    require('./timer.drv/timer.drv.js').name
    ,require('./tickTock.drv/tickTock.drv').name

])
    .run(function () {
    console.log('common run');
});