import { Matrix4, Vector3,
    PerspectiveCamera,
    DirectionalLight,
    AmbientLight,
    Scene, WebGLRenderer
} from "three";

import { IFCLoader } from "web-ifc-three";

let lng
let lat
let coordinates


lng = -70.561181
lat = -33.407302
coordinates = [lng, lat]

//Token www.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZ2V0b3JyZXN2IiwiYSI6ImNsbWd0aGRsaDF5YXEzZ3A4bHZ0Njd3aXQifQ.xLema8DQYF7VbSlOMSfffg';
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/light-v10',
projection: 'globe', // Display the map as a globe
center: coordinates,
zoom: 20.5,
center: [lng, lat],
pitch: 75,
bearing: -80,
antialias: true
});

const nav = new mapboxgl.NavigationControl({
    visualizePitch: true
    });
map.addControl(nav, 'bottom-left');

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
.setLngLat(coordinates)
.setPopup(
    new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(
        `<h3>current location:</h3><h5>[${lng}, ${lat}]</h5>`
    )
)
.addTo(map);

// Create customLayer for IFC model
const renderer = new WebGLRenderer({
    canvas: map.getCanvas(),
    antialias: true,
});

renderer.autoClear = false;
const scene = new Scene();
const camera = new PerspectiveCamera();

const modelOrigin = [marker1._lngLat.lng, marker1._lngLat.lat];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, .72, 0];

const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

const modelTransform = {
translateX: modelAsMercatorCoordinate.x,
translateY: modelAsMercatorCoordinate.y,
translateZ: modelAsMercatorCoordinate.z,
rotateX: modelRotate[0],
rotateY: modelRotate[1],
rotateZ: modelRotate[2],
scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
};
   // Lectura del modelo IFC modo WIT (Three.js)
   const loader = new IFCLoader();        
   loader.ifcManager.setWasmPath( "../static/");         
   let ifcURL = '../IFC/'+localStorage.getItem('ifcURL');
   
const customLayer = {

    id: '3d-model',
    type: 'custom',
    renderingMode: '3d',

    onAdd: function () {
         
        // Lectura del modelo IFC modo WIT (Three.js)
        loader.load(ifcURL, (ifcModel) => scene.add(ifcModel));

        const directionalLight = new DirectionalLight(0x404040);
        const directionalLight2 = new DirectionalLight(0x404040);
        const ambientLight = new AmbientLight( 0x404040, 3 );

        directionalLight.position.set(0, -70, 100).normalize();
        directionalLight2.position.set(0, 70, 100).normalize();

        scene.add(directionalLight, directionalLight2, ambientLight);
    },

    render: function (gl, matrix) {
        const rotationX = new Matrix4().makeRotationAxis(
        new Vector3(1, 0, 0), modelTransform.rotateX);
        const rotationY = new Matrix4().makeRotationAxis(
        new Vector3(0, 1, 0), modelTransform.rotateY);
        const rotationZ = new Matrix4().makeRotationAxis(
        new Vector3(0, 0, 1), modelTransform.rotateZ);

        const m = new Matrix4().fromArray(matrix);
        const l = new Matrix4()
        .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ
        )
        .scale(
        new Vector3(
        modelTransform.scale,
        -modelTransform.scale,
        modelTransform.scale)
        )
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ);

        camera.projectionMatrix = m.multiply(l);
        renderer.resetState();
        renderer.render(scene, camera);
        map.triggerRepaint();
      }
};

map.on('style.load', () => {
    map.addLayer(customLayer, 'waterway-label');
})
map.on('load', () => {
// Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;
    // The 'building' layer in the Mapbox Streets
    // vector tileset contains building height data
    // from OpenStreetMap.
    map.addLayer(
        {
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
            ],
            'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }
        },
        labelLayerId
    );

    map.setFog({'range': [0.8, 8]});
})


// Viajar o volver al modelo 
let isAtStart = true;
const start = {
    center: [30, 50],
    zoom: 1,
    pitch: 0,
    bearing: 0
};
const end = {        
    center: coordinates,
    zoom: 20.5,
    pitch: 75,
    bearing: -80,
};


// Botón Viajar al modelo
const flyButton = document.getElementById('fly')
flyButton.addEventListener('click', () => {
// depending on whether we're currently at point a or b,
// aim for point a or b
    const target = isAtStart ? end : start;
    isAtStart = !isAtStart;
    if (isAtStart) {
        flyButton.classList.remove('bg-white', 'text-blue-500')
        flyButton.classList.add('bg-blue-500', 'text-white')        
    } else {
        flyButton.classList.remove('bg-blue-500', 'text-white')
        flyButton.classList.add('bg-white', 'text-blue-500')        
    }
    map.flyTo({
        ...target, // Fly to the selected target
        duration: 12000, // Animate over 12 seconds
        essential: true // This animation is considered essential with respect to prefers-reduced-motion                        
    });
});


// Botón Referencia
let markerVisibility = true;
const markerVisButton = document.getElementById('markerVis')
markerVisButton.addEventListener('click', () => {
    if (markerVisibility) {
        markerVisButton.classList.remove('bg-white', 'text-blue-500')
        markerVisButton.classList.add('bg-blue-500', 'text-white')
        marker1.remove()
    } else {
        markerVisButton.classList.remove('bg-blue-500', 'text-white')
        markerVisButton.classList.add('bg-white', 'text-blue-500')
        marker1.addTo(map)
    }
    markerVisibility = !markerVisibility
});
