import { Injectable } from '@angular/core';
import { Graph } from 'src/app/models/Graph/graph';
import { Tree } from 'src/app/models/Graph/Tree/tree';
import { HexagonalGrid } from 'src/app/models/Graph/Specific/hexagonal-grid';
import { Specific } from 'src/app/models/Graph/Specific/specific';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private graph: Graph | undefined;

  constructor() { }

  drawGraph(scene: THREE.Scene): void {
    this.graph?.draw(scene);
  }

  stop(): void {
    this.graph?.stop();
  }

  generateGraph(type: string, args: any[]) {
    switch (type) {
      case 'tree':
        this.graph = this.generateTree(args[0], args[1]);
        break;
      case 'conf2':
        this.graph = this.generateTree(args[0], 2);
        break;
      case 'conf3':
        this.graph = this.generateTree(args[0], args[1]);
        break;
      case 'hexagonal':
        this.graph = this.generateHexagonalGrid(args[0], args[1]);
        break;
      case 'maze':
        this.graph = this.generateMaze(args[0], args[1]);
        break;
      case 'enriched_tree':
        this.graph = this.generateEnrichedTree(args[0], args[1]);
        break;
      case 'ring_branches':
        this.graph = this.generateRingBranches(args[0], args[1]);
        break;
    }

    return this.graph;
  }

  private generateTreeLinks(size: number, arity: number): any[] {
    const links = [];

    for (let i = 0; i < size; i++) {
      for (let j = 1; j <= arity; j++) {
        const child = i * arity + j;
        if (child < size) {
          links.push({
            source: i,
            target: child
          });
        }
      }
    }

    return links;
  }

  private generateTreeNodes(size: number, arity: number): any[] {
    const nodes = Array.from({ length: size }, (_, i) => ({
      index: i,
      x: 0,
      y: 0,
      z: 0
    }));

    const levels: number[][] = [];
    let currentLevel: number[] = [0];
    let nextIndex = 1;
    let depth = 0;

    while (currentLevel.length > 0) {
      levels.push(currentLevel);

      const nextLevel: number[] = [];

      for (const _parent of currentLevel) {
        for (let j = 0; j < arity && nextIndex < size; j++) {
          nextLevel.push(nextIndex);
          nextIndex++;
        }
      }

      currentLevel = nextLevel;
      depth++;
    }

    const horizontalSpacing = 2.5;
    const verticalSpacing = 2.5;
    const depthSpacing = 2.5;

    levels.forEach((level, levelIndex) => {
      const count = level.length;
      const radius = levelIndex * horizontalSpacing;

      level.forEach((nodeIndex, i) => {
        if (levelIndex === 0) {
          nodes[nodeIndex].x = 0;
          nodes[nodeIndex].y = 0;
          nodes[nodeIndex].z = 0;
        } else {
          const angle = (i / count) * Math.PI * 2;
          nodes[nodeIndex].x = Math.cos(angle) * radius;
          nodes[nodeIndex].y = -levelIndex * verticalSpacing;
          nodes[nodeIndex].z = Math.sin(angle) * radius;
        }
      });
    });

    return nodes;
  }

  generateTree(size: number, arity: number): Tree {
    const nodes = this.generateTreeNodes(size, arity);
    const links = this.generateTreeLinks(size, arity);

    return new Tree(nodes, links);
  }

  private generateHexagonalGrid(width: number, height: number): HexagonalGrid {
    const nodes = [];
    const links = [];
    const spacing = 2;

    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const x = w * spacing * 1.5;
        const z = h * spacing * Math.sqrt(3) + (w % 2 === 0 ? 0 : spacing * Math.sqrt(3) / 2);
        nodes.push({ index: nodes.length, x, y: 0, z });
      }
    }

    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const current = h * width + w;
        
        const neighbors = [];
        if (w + 1 < width) neighbors.push(h * width + (w + 1)); 
        if (h + 1 < height) neighbors.push((h + 1) * width + w); 

        if (w % 2 === 0) {
          if (w + 1 < width && h - 1 >= 0) neighbors.push((h - 1) * width + (w + 1));
        } else {
          if (w + 1 < width && h + 1 < height) neighbors.push((h + 1) * width + (w + 1));
        }

        neighbors.forEach(neighbor => {
          links.push({ source: current, target: neighbor });
        });
      }
    }

    return new HexagonalGrid(nodes, links);
  }

  private generateMaze(width: number, height: number): Specific {
    const nodes = [];
    const spacing = 2;

    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        nodes.push({ index: nodes.length, x: w * spacing, y: 0, z: h * spacing });
      }
    }

    const allLinks = [];
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const current = h * width + w;
        if (w + 1 < width) allLinks.push({ source: current, target: h * width + (w + 1) });
        if (h + 1 < height) allLinks.push({ source: current, target: (h + 1) * width + w });
      }
    }

    const parent = Array.from({ length: nodes.length }, (_, i) => i);
    const find = (i: number): number => {
      if (parent[i] === i) return i;
      return parent[i] = find(parent[i]);
    };
    const union = (i: number, j: number) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
      }
      return false;
    };

    const shuffled = allLinks.sort(() => Math.random() - 0.5);
    const resultLinks: any[] = [];
    const remainingLinks: any[] = [];

    shuffled.forEach(link => {
      if (union(link.source, link.target)) {
        resultLinks.push(link);
      } else {
        remainingLinks.push(link);
      }
    });

    const extraLinks = remainingLinks.slice(0, Math.floor(remainingLinks.length * 0.2));

    return new Specific(nodes, [...resultLinks, ...extraLinks]);
  }

  private generateEnrichedTree(size: number, extraEdges: number): Specific {
    const nodes = this.generateTreeNodes(size, 3); 
    const links = this.generateTreeLinks(size, 3);

    const possibleExtras = [];
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        
        if (!links.some(l => (l.source === i && l.target === j) || (l.source === j && l.target === i))) {
          possibleExtras.push({ source: i, target: j });
        }
      }
    }

    const shuffled = possibleExtras.sort(() => Math.random() - 0.5);
    const resultLinks = [...links, ...shuffled.slice(0, extraEdges)];

    return new Specific(nodes, resultLinks);
  }

  private generateRingBranches(cycleSize: number, numBranches: number): Specific {
    const nodes = [];
    const links = [];
    const spacing = 3;

    
    for (let i = 0; i < cycleSize; i++) {
      const angle = (i / cycleSize) * Math.PI * 2;
      nodes.push({
        index: i,
        x: Math.cos(angle) * (cycleSize * spacing / (2 * Math.PI)),
        y: 0,
        z: Math.sin(angle) * (cycleSize * spacing / (2 * Math.PI))
      });
      links.push({ source: i, target: (i + 1) % cycleSize });
    }

    
    let nextIndex = cycleSize;
    const branchLength = 2;
    for (let i = 0; i < numBranches; i++) {
      let root = Math.floor(Math.random() * cycleSize);
      let currentRoot = root;

      const angle = (root / cycleSize) * Math.PI * 2;
      const dirX = Math.cos(angle);
      const dirZ = Math.sin(angle);

      for (let j = 0; j < branchLength; j++) {
        nodes.push({
          index: nextIndex,
          x: nodes[currentRoot].x + dirX * spacing,
          y: 0,
          z: nodes[currentRoot].z + dirZ * spacing
        });
        links.push({ source: currentRoot, target: nextIndex });
        currentRoot = nextIndex;
        nextIndex++;
      }
    }

    return new Specific(nodes, links);
  }
}