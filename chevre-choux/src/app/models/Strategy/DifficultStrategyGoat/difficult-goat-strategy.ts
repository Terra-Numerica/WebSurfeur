import { Strategy } from "../istrategy";
import { Graph } from "../../Graph/graph";

export class DifficultGoatStrategy implements Strategy<number>{
    private harvestCapacity: number;

    constructor(harvestCapacity: number){
        this.harvestCapacity = harvestCapacity;
    }

    turnAction(graph: Graph, goat_position_index: number, cabbage_positions_index: number[]): number {
        const goatNode = graph.nodes.find(n => n.index === goat_position_index);

        if(!goatNode){return goat_position_index;}

        let cabbagesByDistance = [];
        for(const cabbageIndex of cabbage_positions_index){
            const cabbageNode = graph.nodes.find(n => n.index === cabbageIndex);
            if(!cabbageNode){continue;}

            const distance = graph.distance(goatNode, cabbageNode);
            if(distance === 1){
                return cabbageNode.index;
            }
            cabbagesByDistance.push({distance, index: cabbageIndex});
        }

        cabbagesByDistance.sort((a, b) => a.distance - b.distance);

        if(cabbagesByDistance.length === 0){
            return goat_position_index;
        }

        const targetIndex = Math.min(this.harvestCapacity, cabbagesByDistance.length - 1);
        const targetCabbageIndex = cabbagesByDistance[targetIndex].index;

        const targetNode = graph.nodes.find(n => n.index === targetCabbageIndex);
        if (!targetNode) { return goat_position_index; }

        const neighbors = graph.edges(goatNode);
        let bestNeighborIndex = goat_position_index;
        let minDistance = -1;

        for (const neighbor of neighbors) {
            const d = graph.distance(neighbor, targetNode);
            if (d !== -1 && (minDistance === -1 || d < minDistance)) {
                minDistance = d;
                bestNeighborIndex = neighbor.index;
            }
        }

        return bestNeighborIndex;
    }
}
