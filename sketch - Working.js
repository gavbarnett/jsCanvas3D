var player={};
var seed;
var viewport;
var mapview;
var Cwidth = 1900;
var Cheight = 900;
var oldstamp = Date.now();
var newstamp;
var img = new Image();
var tide= 0;
function startGame() {
    img.src = 'portal_gun.png';
    viewport = new viewer();
    mapview = new mapper();
        startup();
    player.angle = 0;
    player.height = 2;
    myGameArea.start();
}

function startup(){
  var trial = 0;
  var minalt = 5;  //adjust here
  var maxalt = 50; //          and here to spawn at different heights
  var foundpos = false;
  do{
    seed = Math.random()*10;
    trial = 0;
    do {
      player.x = Math.random()*10000;
      player.y = Math.random()*10000;
      trial += 1;
      alt = Altitude(player.x,player.y);
      foundpos = ((minalt<alt && alt<maxalt) || trial>500);
    } while (foundpos==false);
    //if not found in trial period then change seed and re-try
  } while (trial>50);
  player.angle = Math.random()*2*Math.PI;
  player.headtilt = 0; //look straight forward
  return (player);
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = Cwidth;
        this.canvas.height = Cheight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 250);
        document.onkeydown = checkKey;
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function checkKey(e) {

    e = e || window.event;
    var speed = 0.2; //distance traveled per command. To be expanded for horseback, running etc.
    if (e.keyCode == '87') {
        // w arrow
        e.preventDefault();
        player.y += speed*Math.cos(player.angle);
        player.x -= speed*Math.sin(player.angle);
      }
    else if (e.keyCode == '83') {
        // s arrow
        e.preventDefault();
        player.y -= speed*Math.cos(player.angle);
        player.x += speed*Math.sin(player.angle);
    }
    else if (e.keyCode == '65') {
       // a arrow
       e.preventDefault();
       player.angle -=0.1
       if (player.angle<-Math.PI){
         player.angle+=2*Math.PI;
       }
    }
    else if (e.keyCode == '68') {
       // d arrow
       e.preventDefault();
       player.angle +=0.1
       if (player.angle>Math.PI){
         player.angle-=2*Math.PI;
       }
     }
   else if (e.keyCode == '38') {
      // up arrow
      e.preventDefault();
      player.headtilt -=0.1
    }
      else if (e.keyCode == '40') {
         // down arrow
         e.preventDefault();
         player.headtilt +=0.1
       }
}


function updateGameArea() {
    myGameArea.clear();
    //player.x+=10;
    //player.height+=2;
    //player.y+=0.1;
  //  player.angle+=0.01-Math.random(0.02);
    viewport.update();
    mapview.update();
}

function mapper(x,y,a){
  this.update = function(){
    var scale = 400;
    var X,Y;
    var sat;
    var x = player.x;
    var y = player.y;
    var a = player.angle;
    var TrueAngle;
    ctx = myGameArea.context;
    //sky
    var alt = Altitude(player.x,player.y);
    for (d = scale; d > 50; d*=0.8){
      for (angle =0; angle<(2*Math.PI);angle += Math.PI/20){
        ctx.beginPath();
        TrueAngle = a + angle;
        X = x - d*Math.sin(TrueAngle);
        Y = y + d*Math.cos(TrueAngle);
        sat = (Altitude(X,Y)-alt)/20+50;
        //console.log(sat);
        X = x - d/25*Math.sin(-angle+Math.PI);
        Y = y + d/25*Math.cos(-angle+Math.PI);
        ctx.fillStyle = 'hsl(120, 0%, ' + sat + '% )';
        ctx.arc(50+(x-X), 150-(y-Y),2, 0, 2*Math.PI, false);
        ctx.fill();
      }
    }
  }
}

function viewer(x,y,a) {
    //this.size = size;
    //this.x = x;
    //this.y = y;
    //this.shcolor = shcolor;
    this.update = function(){
      console.log("redrawing...");
      var shade = 5;
      var x = player.x;
      var y = player.y;
      var h = player.height;
      var a = player.angle;
      var X,Y;
      //var h=2;
      var DrawX;
      var DrawY;
      var altcol;
      var Current_Altitude = Altitude(x,y);
      //3570
      //var D = 357*Math.pow(h+Current_Altitude,0.5);
      var D = 357*Math.pow(1000,0.5);
      var TrueAngle = 0;
      var tempalt, tempangle = 0;
      var viewingangle = 60;//degrees
        ctx = myGameArea.context;
        //sky
        //195 - blue
        ctx.fillStyle = 'hsl(195, 53%,' + ((80-Current_Altitude/50)) +'% )';
        ctx.fillRect(0,0,Cwidth,Cheight);
        var startangle = 0;
        for (d = D; d >1; d*=0.8){
          shade = (100-10*Math.log(d));
          ctx.beginPath();
          //start at bottom of screen
          ctx.moveTo(Cwidth,Cheight);
          ctx.lineTo(0,Cheight);
          //rotate view from left to right
          DrawX = 0;
          DrawY = Cheight;
          startangle -= (viewingangle/60)/180*Math.PI/3;
          for (angle =startangle; angle<(viewingangle/180*Math.PI);angle += (viewingangle/60)/180*Math.PI) {
            ctx.beginPath();
            //start at bottom of screen
            ctx.moveTo(Cwidth,Cheight);
            ctx.lineTo(DrawX,Cheight);
            ctx.lineTo(DrawX,DrawY);
            TrueAngle = a - viewingangle/2/180*Math.PI + angle;
            X = x - d*Math.sin(TrueAngle);
            Y = y + d*Math.cos(TrueAngle);
            tempalt = Altitude(X,Y);
            tide = tide + 1/1000;
            switch (true) {
              case (tempalt > 0.5*Math.sin(2*Math.PI*0.02*tide)):
                altcol = 10 + (5000-tempalt)*(142/5000); //hill colors
                break;
              default:
                tempalt=0;
                altcol = 230 -2+4*Math.random();
                break;
            }
            tempangle = Math.atan((tempalt-(h+Current_Altitude))/d)+player.headtilt;
            DrawX = angle*(Cwidth/(viewingangle/2/180*Math.PI));
            DrawY = -tempangle*(Cheight/(Math.PI))+Cheight/2;
            ctx.lineTo(DrawX, DrawY);
            ctx.closePath();
            ctx.fillStyle = 'hsl(' + altcol + ', ' + (shade) + '%, 50%)';
            ctx.fill();
            //console.log(tempangle*(700/(10/18*Math.PI)));
          }
          //ctx.strokeStyle = 'hsl(80, 100%,' + shade + '% )'; //white
          //ctx.stroke();
        }
        //draw cross hair
        ctx.beginPath();
        ctx.moveTo(Cwidth/2-25,Cheight/2);
        ctx.lineTo(Cwidth/2+25,Cheight/2);
        ctx.strokeStyle = '#FFFFFF'
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(Cwidth/2,Cheight/2-25);
        ctx.lineTo(Cwidth/2,Cheight/2+25);
        ctx.strokeStyle = '#FFFFFF'
        ctx.stroke();
        ctx.fillStyle = 'hsl(195, 53%,80% )';
        ctx.fillRect(0,0,180,90);
        ctx.font = "16px Arial";
        ctx.fillStyle = 'hsl(195, 20%, 20% )';
        ctx.textAlign = "left";
        ctx.fillText('Altitude: '+ Math.round(Current_Altitude)+'m',10, 20);
        ctx.fillText('Bearing: '+ Math.round(a/Math.PI*180)+'deg',10, 40);
        ctx.fillText('Lat,Long: '+ Math.round(player.x)+', '+Math.round(player.y),10, 60);
        oldstamp = newstamp;
        newstamp = Date.now();
        ctx.fillText('FPS: '+  Math.round(1/((newstamp-oldstamp)/1000)) ,10, 80);
        var W = 175*5
        var H = 103*5
        ctx.drawImage(img, Cwidth-W, Cheight-H,W,H );
    }
}

function Altitude (x,y) {
  //procedural mapgen
    /*
    This code uses n sine waves for x and y
    to generate a procedural altitude map.
    This is not limited to integers.
    */
    var X = 0, Y = 0, P = Math.PI;
    var f = 0, A = 0, O =0, Amax = 0;
    var j = 0;
    var n = 10;

    for (i = 0; i < n; i++) {
        j = i+1;
        //Frequency
        f = Math.abs((1/(5000))*(Math.pow(3,i))*Math.sin(seed*(j)));
        //Amplitude
        A = Math.abs(Math.sin(seed*(3*j))/Math.pow(f,1.1));
        //Offset Angle
        O = 2*P*Math.sin(seed*12.4);
        //Sum of Sinewaves in this direction
        X += A*Math.sin(2*P*f*x+O);
        //Worst case additive maximum amplitude of all frequencies
        //(used for scaling)
        Amax += A;
    }
    for (i = 0; i < n; i++) {
        j = i+1;
        f = Math.abs((1/(5000))*(Math.pow(3,i))*Math.sin(seed*7*j));
        A = Math.abs(Math.sin(seed*(2.5*j))/Math.pow(f,1.1));
        O = 2*P*Math.sin(seed*12.4);
        Y += A*Math.sin(2*P*f*y+O);
        Amax += A;
    }
    return (3000+6000*((X+Y)/Amax));
}
