

/**
 * Rysowanie planszy gry
 */
var drawArea = function () {
    var canvas = document.getElementById('game-canvas');
    var context = canvas.getContext('2d');



    canvas.width = 650;
    canvas.height = 560;



    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    context.lineCap = 'butt';


    context.beginPath();
    context.moveTo(80, 95);
    context.lineTo(580, 95);

    context.moveTo(580, 95);
    context.lineTo(580, 230);

    context.moveTo(580, 230);
    context.lineTo(625, 230);

    context.moveTo(625, 230);
    context.lineTo(625, 320);

    context.moveTo(625, 320);
    context.lineTo(580, 320);

    context.moveTo(580, 320);
    context.lineTo(580, 455);

    context.moveTo(580, 455);
    context.lineTo(80, 455);

    context.moveTo(80, 455);
    context.lineTo(80, 320);

    context.moveTo(80, 320);
    context.lineTo(35, 320);

    context.moveTo(35, 320);
    context.lineTo(35, 230);

    context.moveTo(35, 230);
    context.lineTo(80, 230);

    context.moveTo(80, 230);
    context.lineTo(80, 95);

    for (var i = 130; i < 45 * 12; i += 45) {
        for (var j = 140; j < 45 * 10; j += 45) {
            context.fillRect(i, j, 2, 2);
        }
    }

    context.fillRect(80, 275, 2, 2);
    context.fillRect(580, 270, 2, 2);

    context.stroke();



    canvas.onclick = function (evt) {
        console.log(canvas.width + " x " + canvas.height);
        var rect = canvas.getBoundingClientRect();

        var x = Math.round((evt.clientX-rect.left) * (canvas.width / canvas.offsetWidth));
        var y = Math.round((evt.clientY-rect.top) * (canvas.height / canvas.offsetHeight));

        alert(x + " . " + y);
    };


};