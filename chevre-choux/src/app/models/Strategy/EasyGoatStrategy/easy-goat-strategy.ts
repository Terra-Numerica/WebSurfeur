import { Strategy } from '../istrategy';
import { Graph } from '../../Graph/graph';

export class EasyGoatStrategy implements Strategy<number>{
    turnAction(graph: Graph, goat_index: number, cabbage_indices: number[]): number {
        const currentNode = graph.nodes.find(n => n.index === goat_index);
        if(!currentNode){return goat_index;}

        const neighbors = graph.edges(currentNode);
        if(neighbors.length === 0) {return goat_index;}
        
        const randomNeighbor = Math.floor(Math.random() * neighbors.length);
        const targetNode = neighbors[randomNeighbor];

        return targetNode.index;
    }
}
