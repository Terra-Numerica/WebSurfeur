import { Graph } from '../graph';
import * as THREE from 'three';

export class Tree extends Graph {
  private nodeObjects: THREE.Mesh[] = [];
  private linkObjects: THREE.Mesh[] = [];

  constructor(nodes: any, links: any) {
    super(nodes, links, 'tree');
  }

  draw(scene: THREE.Scene): void {
    this.clear();
    this.drawLinks(scene);
    this.drawNodes(scene);
  }

  clear(): void {
    this.nodeObjects = [];
    this.linkObjects = [];
  }

  private drawNodes(scene: THREE.Scene): void {
    const geometry = new THREE.SphereGeometry(0.18, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4caf50,
      shininess: 100,
      specular: 0x111111
    });

    this.nodes.forEach((node: any) => {
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.set(
        node.x ?? 0,
        node.y ?? 0,
        node.z ?? 0
      );

      sphere.castShadow = true;
      sphere.receiveShadow = true;

      sphere.userData = {
        index: node.index,
        type: 'node',
        node
      };

      scene.add(sphere);
      this.nodeObjects.push(sphere);
    });
  }

  private drawLinks(scene: THREE.Scene): void {
    this.links.forEach((link: any) => {
      const source = this.getNodeByIndex(link.source);
      const target = this.getNodeByIndex(link.target);

      if (!source || !target) {
        return;
      }

      const edge = this.createEdgeMesh(source, target);
      scene.add(edge);
      this.linkObjects.push(edge);
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

  private getNodeByIndex(index: number): any {
    return this.nodes.find((node: any) => node.index === index);
  }

  simulate(scene: THREE.Scene): void {
  }

  stop(): void {
  }
}