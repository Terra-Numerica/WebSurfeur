import * as THREE from 'three';

export abstract class Graph {
  private _typology: string;
  private _nodes: any[];
  private _links: any[];

  protected allowedToMove = false;

  constructor(nodes: any[], links: any[], typology: string) {
    this._nodes = [...nodes];
    this._links = [...links];
    this._typology = typology;
  }

  setAllowedToMove(allowedToMove: boolean): void {
    this.allowedToMove = allowedToMove;
  }

  abstract draw(scene: THREE.Scene): void;

  abstract clear(): void;

  abstract simulate(scene: THREE.Scene): void;

  abstract stop(): void;

  getRandomEdge(): any {
    return { ...this._nodes[this.getRandomInt(this._nodes.length - 1)] };
  }

  edges(node: any, speed = 1, exclude: any[] = []): any[] {
    const edges = [];

    if (node.index === undefined) {
      node = node.__data__;
    }

    for (const l of this.links) {
      if (l.source.index === node.index) {
        edges.push(this._nodes.find((n: any) => n.index === l.target.index));
      } else if (l.target.index === node.index) {
        edges.push(this._nodes.find((n: any) => n.index === l.source.index));
      } else if (l.source === node.index) {
        edges.push(this._nodes.find((n: any) => n.index === l.target));
      } else if (l.target === node.index) {
        edges.push(this._nodes.find((n: any) => n.index === l.source));
      }
    }

    if (speed > 1) {
      return this.globalEdges(edges, --speed, exclude);
    }

    return edges;
  }

  private globalEdges(edges: any[], speed: number, exclude: any[] = []): any[] {
    let result: any[] = edges;
    let newEdges = [...edges];

    while (speed !== 0) {
      const tmp: any[] = [];

      for (const e of newEdges) {
        if (!exclude.includes(e as never)) {
          this.edges(e).forEach(n => {
            if (
              !result.find(el => el.index === n.index) &&
              !exclude.some((el: any) => el.index === n.index)
            ) {
              result.push(n);
              tmp.push(n);
            }
          });
        }
      }

      newEdges = tmp;
      speed--;
    }

    return result;
  }

  getRandomAccessibleEdges(n: any, speed: any): any {
    const edges = this.edges(n, speed);
    return edges[this.getRandomInt(edges.length)];
  }

  distance(n1: any, n2: any): number {
    let distance = 0;
    const marked: any[] = [];

    marked.push(n1.index);

    if (n1.index === n2.index) {
      return distance;
    }

    let edges = this.edges(n1).filter(e => !(marked.includes(e.index)));

    while (edges.length > 0) {
      distance++;

      for (const e of edges) {
        if (e.index === n2.index) {
          return distance;
        }
      }

      const save = edges;
      edges = [];

      for (const e of save) {
        this.edges(e)
          .filter(i => !(marked.includes(i.index)))
          .forEach(edge => {
            let isIn = false;

            for (const i of edges) {
              if (i.index === edge.index) {
                isIn = true;
              }
            }

            if (!isIn) {
              edges.push(edge);
            }
          });

        marked.push(e.index);
      }
    }

    return -1;
  }

  get nodes(): any[] {
    return this._nodes;
  }

  get links(): any[] {
    return this._links;
  }

  get typology(): string {
    return this._typology;
  }

  set nodes(n: any[]) {
    this._nodes = n;
  }

  set links(l: any[]) {
    this._links = l;
  }

  set typology(type: string) {
    this._typology = type;
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }
}