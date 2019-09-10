var canvas;
var engine;
var scene;
var camera;
var Vector3 = BABYLON.Vector3;
var Color4 = BABYLON.Color4;

var cubes = [];

// calcolo l'angolo di inclinazione tale che i cubi si incastrino
// in modo corretto
var theta = Math.PI/4 - Math.asin(1/Math.tan(Math.PI*2/5)/Math.sqrt(2));

//
// createGrid()
//
// crea un LineSystem con i tre assi e 
// una griglia che rappresenta
// il piano xz
//
function createGrid() {    
    var m = 50;
    var r = 5;
    var pts = [];
    var colors = [];
    var c1 = new Color4(0.7,0.7,0.7,0.5);
    var c2 = new Color4(0.5,0.5,0.5,0.25);
    var cRed   = new Color4(0.8,0.1,0.1);
    var cGreen = new Color4(0.1,0.8,0.1);
    var cBlue  = new Color4(0.1,0.1,0.8);
    
    var color = c1;
    
    // funzione di utilità che aggiunge una linea del colore
    // corrente (color) fra i due punti (x0,y0,z0) e (x1,y1,z2)
    function line(x0,y0,z0, x1,y1,z1) { 
        pts.push([new Vector3(x0,y0,z0), new Vector3(x1,y1,z1)]); 
        colors.push([color,color]); 
    }
    
    // creo la griglia
    for(var i=0;i<=m;i++) {
        if(i*2==m) continue;
        color = (i%5)==0 ? c1 : c2;
        var x = -r+2*r*i/m;        
        line(x,0,-r, x,0,r);
        line(-r,0,x, r,0,x);
    }
    
    var r1 = r + 1;
    var a1 = 0.2;
    var a2 = 0.5;
    
    // x axis
    color = cRed;
    line(-r1,0,0, r1,0,0); 
    line(r1,0,0, r1-a2,0,a1);
    line(r1,0,0, r1-a2,0,-a1);
        
    // z axis
    color = cBlue;
    line(0,0,-r1, 0,0,r1); 
    line(0,0,r1, a1,0,r1-a2);
    line(0,0,r1,-a1,0,r1-a2);
    
    // y axis
    color = cGreen;
    line(0,-r1,0, 0,r1,0); 
    line(0,r1,0, a1,r1-a2,0);
    line(0,r1,0,-a1,r1-a2,0);
    line(0,r1,0, 0,r1-a2,a1);
    line(0,r1,0, 0,r1-a2,-a1);

    // creo ed inserisco nella scena il LineSystem 
    ppts = pts;
    ccolors = colors;
    lines = BABYLON.MeshBuilder.CreateLineSystem(
        "lines", {
                lines: pts,
                colors: colors,
                
        }, 
        scene);
    return lines;    
}

// questa funzione viene chiamata quando la pagina 
// è stata completamente caricata nel browser.
// crea l'engine (il componente che fa i disegni), la scena
// ecc.
window.onload = function() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.2,0.2,0.2);
    // camera
    camera = new BABYLON.ArcRotateCamera(
        "camera1", 0.0 ,1.0,10, 
        BABYLON.Vector3.Zero(), 
        scene);
    camera.attachControl(canvas, false);
    // luce
    var light = new BABYLON.PointLight(
        "light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .9;
    light.parent = camera;
    
    // elementi da visualizzare
    createGrid();
    createCubes();

    // faccio partire il renderloop    
    engine.runRenderLoop(function () { scene.render(); });   
    // informo l'engine se la finestra del browser viene ridimensionata
    window.addEventListener('resize', function(){ engine.resize(); });   
}


// creo i 5 cubi
function createCubes() {
    // i colori dei 5 cubi
    var cc = [
        [0.8,0.3,0.3],
        [0.8,0.6,0.3],
        [0.8,0.8,0.3],
        [0.2,0.8,0.3],
        [0.2,0.8,0.75],
        [0.75,0.2,0.75],
        ];
    for(var i=0;i<5;i++) {
        // creo il cubo i-esimo
        var cube = BABYLON.MeshBuilder.CreateBox(
            'c',{size:2},scene);
        // gli assegno il colore
        cube.material = new BABYLON.StandardMaterial();
        cube.material.diffuseColor.set(cc[i][0],cc[i][1],cc[i][2]);
        // aggiungo il cubo alla lista di cubi
        cubes.push(cube);        
    }
    // imposto il movimento dei cubi
    engine.onBeginFrameObservable.add(animateCubes);    
}


// controllo il movimento dei 5 cubi
function animateCubes() {
    // il parametro t controlla la roto-traslazione dei cubi
    // varia periodicamente fra -0.5 e 1.5
    var t = 0.5+1.0*Math.sin(performance.now()*0.001);
    // faccio in modo che t vari fra 0 e 1. 
    // questo assicura che le due configurazioni estreme 
    // rimangano ferme per qualche secondo
    t = Math.max(0, Math.min(1, t));
    // r è la distanza dei cubi dall'asse centrale
    var r = (1-t)*3;
    // roto-traslo i 5 cubi
    for(var i=0;i <5; i++) {
        var cube = cubes[i];
        // calcolo l'angolo azimutale del cubo i-esimo
        var phi = 2*Math.PI*i/5;
        // modifico la posizione
        cube.position.set(
            Math.cos(-phi+Math.PI/2)*r,
            0,
            Math.sin(-phi+Math.PI/2)*r);
        // e la rotazione
        cube.rotation.x = theta*t;
        cube.rotation.y = phi;
    }    
}
