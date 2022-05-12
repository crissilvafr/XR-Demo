import * as THREE from 'three';

import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
//import { ARButton } from 'https://unpkg.com/three/examples/jsm/webxr/ARButton.js';

let container, stats, clock, gui, mixer, controls;
let camera, scene, renderer, model, face, skeleton;

let idleAction, fightIdle, frontPunch;
let actions, settings;

let singleStepMode = false;
init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.position.set(- 5, 3, 10);
    //camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );
    controls = new OrbitControls(camera, container);
    controls.target.set(0, 2, 0);
    controls.enableDamping = true;
    controls.listenToKeyEvents(window); // optional
    controls.update();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    clock = new THREE.Clock();

    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    // ground

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    scene.add(mesh);

    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    // model

    const loader = new GLTFLoader();
    loader.load('models/Voxel-CASF.glb', function (gltf) {

        model = gltf.scene;
        /*model.scale.x = .5;
        model.scale.y = .5;
        model.scale.z = .5;*/
        scene.add(model);
        skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);
        console.log(gltf);
        //createGUI( model, gltf.animations );
        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer(model);

        idleAction = mixer.clipAction(animations[2]);
        fightIdle = mixer.clipAction(animations[3]);
        frontPunch = mixer.clipAction(animations[0]);

        actions = [idleAction, fightIdle, frontPunch];
        //setWeight(actions[0], 1);
        actions[0].play();
        
    }, undefined, function (e) {

        console.error(e);

    });




    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    //let arButton =  ARButton.createButton( renderer );
    //arButton.style.bottom = "100px";
    document.body.appendChild( arButton );
    window.addEventListener('resize', onWindowResize);

    // stats
    //stats = new Stats();
    //container.appendChild( stats.dom );

}

document.getElementById('idle').addEventListener('click', function(){
    stopAnims();
    actions[0].play();
});

document.getElementById('fightIdle').addEventListener('click', function(){
    stopAnims();
    actions[1].play();
});

document.getElementById('frontPunch').addEventListener('click', function(){
    stopAnims();
    actions[2].play();
});

function stopAnims(){
    for(var i = 0; i < actions.length; i++){
        actions[i].stop();
    }
}

function animate() {

    requestAnimationFrame(animate);
    try {
        let mixerUpdateDelta = clock.getDelta();
        mixer.update(mixerUpdateDelta);
    } catch { }
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}