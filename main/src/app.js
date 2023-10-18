import { Color, MeshLambertMaterial  } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

let modelExt;
let url = ''

// Lectura del container y asignacion viewer    
const container = document.getElementById('viewer-container');
let viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Parametros de la pantalla inicial
function inicioPlano(){    
    // Setup camera controls
    const controls = viewer.context.ifcCamera.cameraControls;
    controls.setPosition(7.6, 4.3, 24.8, false);
    controls.setTarget(-7.1, -0.3, 2.5, false);   
    // Planos de color de fondo, grillas y eje XY    
    viewer.context.getScene().background = new Color (localStorage.getItem('bgColor')) || null          
	viewer.IFC.setWasmPath("../static/");
    viewer.grid.setGrid(50,30);
    viewer.axes.setAxes(5,5);
}

// Parametros para iniciar modelo y variables globales
async function loadIfc(url) {
    // Lectura del modelo IFC modo WIV (WebIFCViewer)
	const model = await viewer.IFC.loadIfcUrl(url);    
    await viewer.shadowDropper.renderShadow(model.modelID);
	modelExt = model;	
    setupEvents(viewer);
	const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
    createTreeMenu(ifcProject);    
}
inicioPlano();

// Configuracion del inicio de colores de fondo
let bgColor;
let cj = colorjoe.rgb(document.querySelector('.colorjoe'));
cj.show();
cj.on("change", color => {
    bgColor = color.css();
    viewer.context.getScene().background = new Color (bgColor);
});
cj.on("done", color => {
    bgColor = color.css();
    viewer.context.getScene().background = new Color (bgColor);
    localStorage.setItem('bgColor', bgColor)
});

// Creacion de constantes de colores
const blue = new MeshLambertMaterial({
	transparent: true,
	opacity: 0.6,
	color: 0x0000ff,
	depthTest: false    
})

const purple = new MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0x800080,
    depthTest: false
})

const yellow = new MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xffff00,
    depthTest: false
})

const red = new MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xff0000,
    depthTest: false
})

// Botones top-2 right-2
const sampleButton = document.getElementById('sample-button');
const saveButton = document.getElementById('save-button');
const removeButton = document.getElementById('remove-button');

// Botones bottom
const mapButton = document.getElementById('map-button');
const dimButton = document.getElementById('dim-button');
const cutButton = document.getElementById('cut-button');
const paletteButton = document.getElementById('palette-button');
const lightdarkButton = document.getElementById('lightdark-button');
const showhideButton = document.getElementById('showhide-button');
const propTreeButton = document.getElementById('propTree-button')
const propButton = document.getElementById('prop-button');
const guideButton = document.getElementById('guide-button')
const guideContainer = document.getElementById('guide-container');

// Botones bottom-2 right-2 
const abiertoButton = document.getElementById('abierto-button');
const procesoButton = document.getElementById('proceso-button');
const pendienteButton = document.getElementById('pendiente-button');
const noconformidadButton = document.getElementById('noconformidad-button');

// Previene cargar varias veces los archivos
function updateButtons(activarBotones) {
    if(localStorage.getItem('ifcURL')){
        url = '../IFC/'+localStorage.getItem('ifcURL');   
        activarBotones=false; 
    }
    if (activarBotones) {          
        sampleButton.removeAttribute("disabled");
        saveButton.removeAttribute("disabled");
        removeButton.setAttribute("disabled", "");
        document.getElementById("ifc-tree-menu").style.display="none";
        document.getElementById("ifc-property-menu").style.display="none";
    } else {        
        loadIfc(url);
        sampleButton.setAttribute("disabled", "");
        saveButton.setAttribute("disabled", "");
        removeButton.removeAttribute("disabled");
    }
    activarBotones = !activarBotones;    
}
updateButtons(true);

// Menú M-A-R
// Botón (M)odelo Ejemplo
sampleButton.onclick = () => {
    url = '../IFC/01.ifc';
    localStorage.setItem('ifcURL','01.ifc');
    updateButtons(false);
}

// Botón (A)brir Modelo
const input = document.getElementById('file-input');
saveButton.onclick = () => input.click();
input.onchange = async (event) => {
    const file = event.target.files[0];
    url = URL.createObjectURL(file);
    localStorage.setItem('ifcURL',event.target.files[0].name);
    updateButtons(false);
}

// Botón (R)emover Modelo
removeButton.onclick = async () => {                    
    await viewer.dispose();    
    localStorage.removeItem('ifcURL');
    viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
    url = "";
    inicioPlano();
    updateButtons(true);
    location.reload();
}

// Menú Bottom Tools
// Botón Dimensiones
let dimension = false;
dimButton.onclick = () => {
    viewer.IFC.selector.unPrepickIfcItems();
    viewer.dimensions.active = !dimension;
    viewer.dimensions.previewActive = !dimension;
	window.ondblclick = () => viewer.dimensions.create();
    if (!dimension)
		viewer.dimensions.deleteAll();
    dimension = !dimension;
}

// Botón Recortar
let cut = false;
cutButton.onclick = () => {
	viewer.IFC.selector.unPrepickIfcItems();
    viewer.clipper.active = !cut;
	viewer.dimensions.active = !cut;
    viewer.dimensions.previewActive = !cut;
    if (!cut)
		window.ondblclick = () => viewer.clipper.createPlane();
	cut = !cut;
}

// Botón Paleta colores
let palette = false;
const paletteContainer = document.getElementById('palette-container');
paletteButton.onclick = () => {	
    if (palette)		
        paletteContainer.classList.add('hidden');
	else		
        paletteContainer.classList.remove('hidden');
    palette = !palette;
}

// Botón Claro-Oscuro
let lightdark = false;
lightdarkButton.onclick = () => {
    if (!lightdark)
		bgColor = 0x313745; //dark
	else
		bgColor = 0xffffff; //light
	viewer.context.getScene().background = new Color (bgColor);
	localStorage.setItem('bgColor', bgColor)
    lightdark = !lightdark;
}

// Botón Mostrar-Ocultar
let showhide = false;
showhideButton.onclick = () => {
    if (url){
        if (!showhide)		
            modelExt.removeFromParent();
        else
            loadIfc(url);
        showhide = !showhide;
    }
}

// Botón TreeView
let tree = false;
document.getElementById("ifc-tree-menu").style.display="none";
propTreeButton.onclick = () => {
    if (url){
        document.getElementById("ifc-property-menu").style.display="none";
        if (!tree)
            document.getElementById("ifc-tree-menu").style.display="block";
        else
            document.getElementById("ifc-tree-menu").style.display="none";
        tree = !tree;
    }
}

// Botón Propiedades
let propertiesB = false;
document.getElementById("ifc-property-menu").style.display="none";
propButton.onclick = () => {
    if (url){
        document.getElementById("ifc-tree-menu").style.display="none";
        if (!propertiesB)
            document.getElementById("ifc-property-menu").style.display="block";            
        else
            document.getElementById("ifc-property-menu").style.display="none";
            propertiesB = !propertiesB;
    }    
}

// Botón Ayuda
guideButton.onclick = () => {
    if (guideContainer.classList.contains('hidden'))
        guideContainer.classList.remove('hidden');
    else
        guideContainer.classList.add('hidden');
}

// Menú Categorías
// Botón Abierto
let abierto = false;
abiertoButton.onclick = () => {
	let sectores = [294,338,24620,24587];
    if(url)
    {
        if (abierto) {
            abiertoButton.classList.replace('bg-white', 'bg-blue-500');
            abiertoButton.classList.replace('text-blue-500', 'text-white');
            idsPinta(true, blue, sectores, 0);
        } else {
            abiertoButton.classList.replace('bg-blue-500', 'bg-white');
            abiertoButton.classList.replace('text-white', 'text-blue-500');
            idsPinta(false, blue, sectores, 0);
        }
        abierto = !abierto;
    }
}

// Botón En Proceso
let proceso = false;
procesoButton.onclick = () => {
	let sectores = [22620,182];
    if(url)
    {
        if (proceso) {
            procesoButton.classList.replace('bg-white', 'bg-purple-500');
            procesoButton.classList.replace('text-purple-500', 'text-white');
            idsPinta(true, purple, sectores, 0);
        } else {
            procesoButton.classList.replace('bg-purple-500', 'bg-white');
            procesoButton.classList.replace('text-white', 'text-purple-500');
            idsPinta(false, purple, sectores, 0);
        }
        proceso = !proceso;
    }
}

// Botón Pendiente
let pendiente = false;
pendienteButton.onclick = () => {
	let sectores = [22868,22884,22900,22916,22804,22820,22836,22852,22705,22748,22772,22788];
    if(url)
    {
        if (pendiente) {
            pendienteButton.classList.replace('bg-white', 'bg-yellow-500');
            pendienteButton.classList.replace('text-yellow-500', 'text-white');
            idsPinta(true, yellow, sectores, 0);
        } else {
            pendienteButton.classList.replace('bg-yellow-500', 'bg-white');
            pendienteButton.classList.replace('text-white', 'text-yellow-500');
            idsPinta(false, yellow, sectores, 0);
        }
        pendiente = !pendiente;
    }
}

// Botón No conformidad
let noconformidad = false;
noconformidadButton.onclick = () => {
	let sectores = [6518,6563,6595,6627,6659,6691,6723,6755,6787,5456,12423,12491,12587,9363,12528];
    if(url)
    {
        if (noconformidad) {
            noconformidadButton.classList.replace('bg-white', 'bg-red-500');
            noconformidadButton.classList.replace('text-red-500', 'text-white');
            idsPinta(true, red, sectores, 0);
        } else {
            noconformidadButton.classList.replace('bg-red-500', 'bg-white');
            noconformidadButton.classList.replace('text-white', 'text-red-500');
            idsPinta(false, red, sectores, 0);
        }
        noconformidad = !noconformidad;
    }
}
  
// Botones Mouse o Teclado
function setupEvents(viewer){            
    window.onclick = () => {if (url) viewer.IFC.selector.pickIfcItem(true);}  
    window.ondblclick = () =>  {if (url) hideClickedItem();}
    window.onmousemove = () => {if (url) viewer.IFC.selector.prePickIfcItem(); } 
    window.oncontextmenu = () => {if (url) hideClickedProp();}
    window.onkeydown = (event) => {        
        if (event.code === 'Delete') {viewer.dimensions.delete();}
        if (event.code === 'Backspace') {viewer.dimensions.delete();}
        if(event.code === 'KeyP'){viewer.clipper.createPlane();}
        if(event.code === 'KeyO'){viewer.clipper.deletePlane();}		
    }
}

// Función de colores que pinta las categorías
const scene = viewer.context.getScene();
function idsPinta(multiple, color, ids, modelID) {    
    const ifc = viewer.IFC.loader.ifcManager;    
	if (!dimension) {
        if (!multiple)
        {            
            ifc.visible = false;
            ifc.createSubset({
                modelID: modelID,
                ids: ids,
                material: color,
                scene,         
                removePrevious: multiple
            });          
        }else
            ifc.removeSubset(modelID, color);
    }
};

// Funcion de información por item
function hideClickedItem() {
	const result = viewer.context.castRayIfc();	    
	if (!result) return;
	const manager = viewer.IFC.loader.ifcManager;
	const id = manager.getExpressId(result.object.geometry, result.faceIndex);	
	console.log("modelID: ",modelExt.modelID);
	console.log("id: ",id);	
}

// Funcion de información propiedades
async function hideClickedProp() {
    const result = await viewer.IFC.selector.pickIfcItem(true);
    if (!result) return;
    const { modelID, id } = result;
    const props = await viewer.IFC.getProperties(modelID, id, true, false);
    createPropertiesMenu(props);
}

// Lateral TreeView
// Visualiza todas las categorías IFC anidadas del modelo
const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].onclick = () => {
        toggler[i].parentElement.querySelector(".nested").classList.toggle("active");
        toggler[i].classList.toggle("caret-down");
    }
}

// Spatial tree menu
function createTreeMenu(ifcProject) {
    const root = document.getElementById("tree-root");
    removeAllChildren(root);
    const ifcProjectNode = createNestedChild(root, ifcProject);
    ifcProject.children.forEach(child => {
        constructTreeMenuNode(ifcProjectNode, child);
    })
}

function nodeToString(node) {
    return `${node.type} - ${node.expressID}`
}

function constructTreeMenuNode(parent, node) {
    const children = node.children;
    if (children.length === 0) {
        createSimpleChild(parent, node);
        return;
    }
    const nodeElement = createNestedChild(parent, node);
    children.forEach(child => {
        constructTreeMenuNode(nodeElement, child);
    })
}

function createNestedChild(parent, node) {
    const content = nodeToString(node);
    const root = document.createElement('li');
    createTitle(root, content);
    const childrenContainer = document.createElement('ul');
    childrenContainer.classList.add("nested");
    root.appendChild(childrenContainer);
    parent.appendChild(root);
    
    return childrenContainer;
}

function createTitle(parent, content) {
    const title = document.createElement("span");
    title.classList.add("caret");
    title.onclick = () => {
        title.parentElement.querySelector(".nested").classList.toggle("active");
        title.classList.toggle("caret-down");
    }
    title.textContent = content;
    parent.appendChild(title);
}

function createSimpleChild(parent, node) {
    const content = nodeToString(node);
    const childNode = document.createElement('li');
    childNode.classList.add('leaf-node');
    childNode.textContent = content;
    parent.appendChild(childNode);

    childNode.onmouseenter = () => {
        viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
    }

    childNode.onclick = async () => {
        viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
    }	
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Lateral Propiedades
// Visualiza todas las propiedades del elemento seleccionado
const propsGUI = document.getElementById("ifc-property-menu-root");
function createPropertiesMenu(properties) {
    //console.log(properties);
    removeAllChildrenprop(propsGUI);
	const psets = properties.psets;
    const mats = properties.mats;
    const type = properties.type;
    delete properties.psets;
    delete properties.mats;
    delete properties.type;
    for (let key in properties) {
        createPropertyEntry(key, properties[key]);
    }
}

function createPropertyEntry(key, value) {
    const propContainer = document.createElement("div");
    propContainer.classList.add("ifc-property-item");

    if(value === null || value === undefined) value = "undefined";
    else if(value.value) value = value.value;

    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    propContainer.appendChild(keyElement);

    const valueElement = document.createElement("div");
    valueElement.classList.add("ifc-property-value");
    valueElement.textContent = value;
    propContainer.appendChild(valueElement);

    propsGUI.appendChild(propContainer);
}

function removeAllChildrenprop(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}