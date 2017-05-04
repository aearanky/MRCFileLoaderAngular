angular.module("ngMrcviewer", [])
.directive(
	"ngMrcviewer",
	[function () {
			return {
				restrict: "E",
				scope: {
					mrcUrl: '@mrcUrl'
				},
				link: function (scope) {
					if (!Detector.webgl)
						Detector.addGetWebGLMessage();

					var container,
					stats,
					camera,
					controls,
					scene,
					renderer,
					gui,
					container2,
					renderer2,
					camera2,
					axes2,
					scene2;
					var sliceZ,
					sliceY,
					sliceX;
					var windowWidth,
					windowHeight;
					windowWidth = window.innerWidth;
					windowHeight = window.innerHeight;
					var view;
					var views = [{
							left: 0,
							bottom: 0,
							width: 0.6,
							height: 1.0,
							background: new THREE.Color().setRGB(0, 0, 0),
							eye: [-200, 200, 300],
							up: [0, 1, 0],
							fov: 60,
							updateCamera: function (camera, scene) {
								camera.lookAt(scene.position);
							}
						}, {
							left: 0.6,
							bottom: 0.70,
							width: 0.3,
							height: 0.233,
							background: new THREE.Color().setRGB(0, 0, 0),
							eye: [-300, 0, 0],
							up: [0, 1, 0],
							fov: 45,
							updateCamera: function (camera, scene) {
								camera.lookAt(scene.position);
							}
						}, {
							left: 0.6,
							bottom: 0.38,
							width: 0.3,
							height: 0.333,
							background: new THREE.Color().setRGB(0, 0, 0),
							eye: [0, 350, 0],
							up: [0, 1, 0],
							fov: 45,
							updateCamera: function (camera, scene) {
								camera.lookAt(scene.position);
							}
						}, {
							left: 0.6,
							bottom: 0,
							width: 0.3,
							height: 0.333,
							background: new THREE.Color().setRGB(0, 0, 0),
							eye: [0, 0, 400],
							up: [1, 0, 0],
							fov: 60,
							updateCamera: function (camera, scene) {
								camera.lookAt(scene.position);
							}
						}
					];

					// init scene
					init();
					animate();

					function init() {
						container = document.createElement('container');
						document.body.appendChild(container);

						//camera
						for (var i = 0; i < views.length; i++) {
							view = views[i];
							camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 0.01, 10000);
							camera.position.x = view.eye[0];
							camera.position.y = view.eye[1];
							camera.position.z = view.eye[2];
							camera.up.x = view.up[0];
							camera.up.y = view.up[1];
							camera.up.z = view.up[2];
							view.camera = camera;
						}

						//scene
						scene = new THREE.Scene();
						scene.add(camera);

						// light
						var dirLight = new THREE.DirectionalLight(0xffffff);
						dirLight.position.set(200, 200, 1000).normalize();
						scene.add(dirLight);

						//loader
						var manager = new THREE.LoadingManager();
						var loader = new THREE.MRCLoader(manager);
						console.log("Manager is ready");

						modelUrl = scope.mrcUrl;
						console.log("Loading " + modelUrl);
						loader.load(modelUrl, function (volume) {

							//box helper to see the extend of the volume
							var geometry = new THREE.BoxGeometry(volume.xLength, volume.yLength, volume.zLength);
							var material = new THREE.MeshBasicMaterial({
									color: 0x00ff00
								});

							var cube = new THREE.Mesh(geometry, material);
							cube.visible = false;
							var box = new THREE.BoxHelper(cube);
							scene.add(box);
							box.applyMatrix(volume.matrix);
							scene.add(cube);

							//x plane
							var indexX = 0;
							sliceX = volume.extractSlice('x', Math.floor(volume.RASDimensions[0] / 2));
							scene.add(sliceX.mesh);

							//y plane
							var indexY = 0;
							sliceY = volume.extractSlice('y', Math.floor(volume.RASDimensions[1] / 2));
							scene.add(sliceY.mesh);

							//z plane
							var indexZ = 0;
							sliceZ = volume.extractSlice('z', Math.floor(volume.RASDimensions[2] / 4));
							scene.add(sliceZ.mesh);

							gui.add(sliceX, "index", 0, volume.RASDimensions[0], 1).name("indexX").onChange(function () {
								sliceX.repaint.call(sliceX);
							});
							gui.add(sliceY, "index", 0, volume.RASDimensions[1], 1).name("indexY").onChange(function () {
								sliceY.repaint.call(sliceY);
							});
							gui.add(sliceZ, "index", 0, volume.RASDimensions[2], 1).name("indexZ").onChange(function () {
								sliceZ.repaint.call(sliceZ);
							});
							gui.add(volume, "lowerThreshold", volume.min, volume.max, 1).name("Lower Threshold").onChange(function () {
								volume.repaintAllSlices();
							});
							gui.add(volume, "upperThreshold", volume.min, volume.max, 1).name("Upper Threshold").onChange(function () {
								volume.repaintAllSlices();
							});
							gui.add(volume, "windowLow", volume.min, volume.max, 1).name("Window Low").onChange(function () {
								volume.repaintAllSlices();
							});
							gui.add(volume, "windowHigh", volume.min, volume.max, 1).name("Window High").onChange(function () {
								volume.repaintAllSlices();
							});
						});

						// renderer
						renderer = new THREE.WebGLRenderer({
								antialias: true
							});
						renderer.setPixelRatio(window.devicePixelRatio);
						renderer.setSize(window.innerWidth, window.innerHeight);
						container.appendChild(renderer.domElement);

						stats = new Stats();
						container.appendChild(stats.dom);
						var gui = new dat.GUI();
						window.addEventListener('resize', onWindowResize, false);
						setupInset();
					}

					function onWindowResize() {
						if (windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
							windowWidth = window.innerWidth;
							windowHeight = window.innerHeight;
							renderer.setSize(window.innerWidth, window.innerHeight);
						}
						//controls.handleResize();
					}
					function animate() {
						requestAnimationFrame(animate);
						for (var i = 0; i < views.length; i++) {
							view = views[i];
							camera = view.camera;
							view.updateCamera(camera, scene);
							var left = Math.floor(windowWidth * view.left);
							var bottom = Math.floor(windowHeight * view.bottom);
							var width = Math.floor(windowWidth * view.width);
							var height = Math.floor(windowHeight * view.height);
							renderer.setViewport(left, bottom, width, height);
							renderer.setScissor(left, bottom, width, height);
							renderer.setScissorTest(true);
							renderer.setClearColor(view.background);
							camera.aspect = window.innerWidth / window.innerHeight;
							camera.updateProjectionMatrix();
							renderer.render(scene, camera);
						}
						//controls.update();
						//copy position of the camera into inset
						camera2.position.copy(camera.position);
						camera2.position.setLength(300);
						camera2.lookAt(scene2.position);
						renderer2.render(scene2, camera2);
						stats.update();
					}
					
					function rotateAroundWorldAxis(object, axis, radians) {
						var rotWorldMatrix = new THREE.Matrix4();
						rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
						object.applyMatrix(rotWorldMatrix);
					}
					
					function setupInset() {
						var insetWidth = 150,
						insetHeight = 150;
						container2 = document.getElementById('inset');
						container2.width = insetWidth;
						container2.height = insetHeight;
						// renderer
						renderer2 = new THREE.WebGLRenderer({
								alpha: true
							});
						renderer2.setClearColor(0x000000, 0);
						renderer2.setSize(insetWidth, insetHeight);
						container2.appendChild(renderer2.domElement);
						// scene
						scene2 = new THREE.Scene();
						// camera
						camera2 = new THREE.PerspectiveCamera(50, insetWidth / insetHeight, 1, 1000);
						camera2.up = camera.up; // important
						// axes
						axes2 = new THREE.AxisHelper(100);
						scene2.add(axes2);
					}
				}
			}
		}
	]);
