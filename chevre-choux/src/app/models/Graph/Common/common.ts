import * as THREE from 'three';
import { Graph } from '../graph';

export class Common extends Graph {

  constructor(nodes: any, links: any, type: string = 'common') {
    super(nodes, links, type);
  }

  draw(scene: THREE.Scene): void {}

  clear(): void {}

  simulate(scene: THREE.Scene): void {}

  stop(): void {}
}