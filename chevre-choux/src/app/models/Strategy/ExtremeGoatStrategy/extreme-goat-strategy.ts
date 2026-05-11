import { Graph } from "../../Graph/graph";
import { Strategy } from "../istrategy";

export class ExtremeGoatStrategy implements Strategy<number>{
    private harvestCapacity: number;

    constructor(harvestCapacity: number){
        this.harvestCapacity = harvestCapacity;
    }

    turnAction(graph: Graph, goat_position_index: number, cabbage_positions_index: number[]): number {
        const goatNode = graph.nodes.find(n => n.index === goat_position_index);
        if(!goatNode){return goat_position_index;}

        const neighbors = graph.edges(goatNode);
        if(neighbors.length === 0){return goat_position_index;}

        let bestNeighbor = neighbors[0].index;
        let bestScore = 99999;

        for(const neighborNode of neighbors){
            if(cabbage_positions_index.includes(neighborNode.index)){
                return neighborNode.index;
            }

            let cabbagesByDistance = [];
            const neighbor = neighborNode;

            for(const cabbageIndex of cabbage_positions_index){
                const cabbageNode = graph.nodes.find(n => n.index === cabbageIndex);
                if(!cabbageNode){continue;}

                const distance = graph.distance(neighbor, cabbageNode);
                cabbagesByDistance.push({distance, index: cabbageIndex});
            }
            cabbagesByDistance.sort((a, b) => a.distance - b.distance);

            if(cabbagesByDistance.length === 0){continue;}

            const safeIndex = Math.min(this.harvestCapacity, cabbagesByDistance.length - 1);
            const score = cabbagesByDistance[safeIndex].distance;

            if(score === 1){
                return neighbor.index;
            }

            if(score < bestScore){
                bestScore = score;
                bestNeighbor = neighbor.index;
            }
        }
        return bestNeighbor;
    }
}
