if (true) {
    let axisLength = 1000;
    let axisXG = new THREE.Geometry();
    axisXG.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLength, 0, 0));
    let axisYG = new THREE.Geometry();
    axisYG.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLength, 0));
    let axisZG = new THREE.Geometry();
    axisZG.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLength));
    let axisX = new THREE.Line(axisXG, new THREE.LineBasicMaterial({color:0xff0000}));
    let axisY = new THREE.Line(axisYG, new THREE.LineBasicMaterial({color:0x00ff00}));
    let axisZ = new THREE.Line(axisZG, new THREE.LineBasicMaterial({color:0x0000ff}));
    self.scene.add(axisX);
    self.scene.add(axisY);
    self.scene.add(axisZ);
}
