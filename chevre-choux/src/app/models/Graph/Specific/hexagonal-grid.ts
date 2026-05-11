import { Graph } from '../graph';
import * as THREE from 'three';

export class HexagonalGrid extends Graph {
    private nodeObjects: THREE.Mesh[] = [];
    private linkObjects: THREE.Mesh[] = [];

    constructor(nodes: any, links: any) {
        super(nodes, links, 'hexagonal-grid');
    }

    clear(): void {
        this.nodeObjects = [];
        this.linkObjects = [];
    }

    draw(scene: THREE.Scene): void {
        this.clear();
        this.drawLinks(scene);
        this.drawNodes(scene);
    }

    private drawNodes(scene: THREE.Scene): void {
        const geometry = new THREE.SphereGeometry(0.18, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4caf50,
            shininess: 100,
            specular: 0x111111
        });
        this.nodes.forEach(n => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(n.x, n.y, n.z);
            mesh.userData = {type: 'node', index: n.index, node: n};
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            this.nodeObjects.push(mesh);
        });
    }

    private drawLinks(scene: THREE.Scene): void {
        this.links.forEach(l => {
            const sourceNode = this.nodes.find(n => n.index === l.source);
            const targetNode = this.nodes.find(n => n.index === l.target);
            if(sourceNode && targetNode){
                const mesh = this.createEdgeMesh(sourceNode, targetNode);
                scene.add(mesh);
                this.linkObjects.push(mesh);
            }
        });
    }

    private createEdgeMesh(source: any, target: any): THREE.Mesh {
        const start = new THREE.Vector3(source.x ?? 0, source.y ?? 0, source.z ?? 0);
        const end = new THREE.Vector3(target.x ?? 0, target.y ?? 0, target.z ?? 0);

        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();

        const geometry = new THREE.CylinderGeometry(0.04, 0.04, length, 12);
        const material = new THREE.MeshPhongMaterial({
            color: 0xaaaaaa,
            shininess: 30
        });

        const cylinder = new THREE.Mesh(geometry, material);

        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        cylinder.position.copy(midpoint);

        const axis = new THREE.Vector3(0, 1, 0);
        cylinder.quaternion.setFromUnitVectors(axis, direction.clone().normalize());

        cylinder.castShadow = true;
        cylinder.receiveShadow = true;

        return cylinder;
    }

    simulate(scene: THREE.Scene): void {}

    stop(): void{}
}
