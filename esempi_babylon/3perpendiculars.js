var canvas;
var engine;
var scene;
var camera;
var Vector3 = BABYLON.Vector3;
var Color4 = BABYLON.Color4;


//
// createGrid()
//
// Crea una griglia quadrata di linee sul piano XZ
// Parametri:
//   size = lato del quadrato
//   count = numero di linee per ogni direzione 
//           (la griglia ha 2*count linee)
//   ticks = ogni tick linee viene tracciata una linea principale 
//           (di colore diverso)
//   color = colore delle linee
//   tickColor = colore delle linee principali
//
function createGrid(params) {    
    var pts = [];
    var colors = [];
    
    var currentColor;
    // funzione di comodo: aggiunge la linea (x0,y0,z0)-(x1,y1,z1) di
    // colore = currentColor
    function line(x0,y0,z0, x1,y1,z1) { 
        pts.push([new Vector3(x0,y0,z0), new Vector3(x1,y1,z1)]); 
        colors.push([currentColor,currentColor]); 
    }
    
    var r = params.size/2;
    
    // aggiungo le linee
    for(var i=0;i<params.count;i++) {
        currentColor = (i%params.ticks)==0 ? params.tickColor : params.color;
        var u = -r+2*r*i/(params.count-1); // u : -r => r        
        line(u,0,-r, u,0,r);
        line(-r,0,u, r,0,u);
    }
    
    // creo e aggiungo alla scena il LineSystem    
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

//
// crea una sfera: centro in p, raggio r e colore = color
// 
function createSphere(p,r, color) {
    var sphere = BABYLON.MeshBuilder.CreateSphere(
        "sphere", 
        {diameter:2*r, tessellation:10}, 
        scene);
    sphere.position.copyFrom(p);
    sphere.material = new BABYLON.StandardMaterial();
    sphere.material.diffuseColor.copyFrom(color);
    return sphere;
}

//
// crea un cilindro: 
//   centri delle due facce opposte in p0,p1,
//   raggio r e colore = color
// 

function createCylinder(p0,p1,r, color) {
    var distance = BABYLON.Vector3.Distance(p0, p1);
    if(distance<1.0e-8) return null;
    var cylinder = BABYLON.MeshBuilder.CreateCylinder(
        "cylinder", 
        { 
            diameter: 2*r,
            height: distance,
            tessellation: 30,
        },
        scene);    
    cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, distance / 2, 0)); 
    var dx = p0.x-p1.x;
    var dz = p0.z-p1.z;
    var r2 = dx*dx+dz*dz;    
    var v1 = p1.subtract(p0);
    v1.normalize();
    if(r2<0.001)
    {
        if(p1.y>p0.y) cylinder.position = p0;
        else cylinder.position = p1;
    }
    else                
    {
        var v2 = new BABYLON.Vector3(0, 1, 0);                    
        var axis = BABYLON.Vector3.Cross(v2, v1);
        axis.normalize();
        var angle = Math.acos(BABYLON.Vector3.Dot(v1, v2));
        cylinder.position = p0;
        cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
    }
    cylinder.material = new BABYLON.StandardMaterial();
    cylinder.material.diffuseColor.copyFrom(color);    
    return cylinder; 
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
    scene.ambientColor.set(1,1,1);
    // camera
    camera = new BABYLON.ArcRotateCamera(
        "camera1", 0.0 ,1.0,10, BABYLON.Vector3.Zero(),scene);
    camera.attachControl(canvas, false);
    camera.wheelPrecision = 20;
    // luce
    var light = new BABYLON.PointLight(
        "light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .9;
    light.parent = camera;
    
    // crea gli oggetti in scena
    createGrid({
        size  : 10,
        count : 21,
        ticks : 5,
        color : new Color4(0.5,0.5,0.5),
        tickColor : new Color4(0.8,0.8,0.95),        
    });
    
    createModel();
    
    // fa partire il rendering
    engine.runRenderLoop(function () { scene.render(); });   
    // informa l'engine se la finestra del browser cambia dimensioni
    window.addEventListener('resize', function(){ engine.resize(); });   
}

var p0 = new Vector3(2,0,3), p1 = new Vector3(-4,0,1);
var tline;


function createModel() {
        
    
    var color1 = new Color4(0.6,0.8,0.9);
    var color2 = new Color4(0.8,0.6,0.8);
    
    var lineRadius = 0.05;
    var pointRadius = 0.09;

    var tline, aline, hline;

    // la retta perpendicolare al piano XZ    
    aline = createCylinder(
        new Vector3(0,-3,0), 
        new Vector3(0,3,0),
        lineRadius,
        new Color4(0.8,0.3,0.3));
    
    // la seconda retta (che giace nel piano XY)
    tline = createCylinder(
        p0, 
        p1,
        lineRadius,
        new Color4(0.2,0.8,0.3));
        
    // la perpendicolare comune passa per l'origine e per il punto p
    // calcolo il punto p (con un po' di algebra vettoriale)
    var u = p1.subtract(p0);
    var q = -Vector3.Dot(p0,u) / Vector3.Dot(u,u);    
    var p = Vector3.Lerp(p0,p1,q);
    
    // disegno la perpendicolare comune e i due punti (0,0,0) e p
    createSphere(p,pointRadius, new Color4(0.1,0.1,0.1));
    createSphere(Vector3.Zero(),pointRadius, new Color4(0.1,0.1,0.1));
    
    hline = createCylinder(p,Vector3.Zero(), lineRadius, new Color4(0.8,0.6,0.8));
    
}
