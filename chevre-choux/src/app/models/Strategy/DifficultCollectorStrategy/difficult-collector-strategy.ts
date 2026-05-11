import { Strategy } from "../istrategy";
import { Graph } from "../../Graph/graph";

export class DifficultCollectorStrategy implements Strategy<number[]>{
    private harvestCapacity: number;

    constructor(harvestCapacity: number){
        this.harvestCapacity = harvestCapacity;
    }

    turnAction(graph: Graph, goat_index: number, cabbage_indices: number[]): number[] {
        const nodeGoat = graph.nodes.find(n => n.index === goat_index);
        if(!nodeGoat) {return cabbage_indices;}

        let cabbageDistances = [];
        const neighborNodes = graph.edges(nodeGoat);
        if(neighborNodes.length === 0){return cabbage_indices;}

        for(let cabbageIndex of cabbage_indices){
            let minDistance = 99999;

            for(let neighbor of neighborNodes){
                const nodeCabbage = graph.nodes.find(n => n.index === cabbageIndex);
                if(!nodeCabbage) {continue;}

                const distance = graph.distance(neighbor, nodeCabbage);

                if(distance < minDistance){
                    minDistance = distance;
                }
            }
            cabbageDistances.push({distance: minDistance, index: cabbageIndex});
        }
        cabbageDistances.sort((a, b) => a.distance - b.distance);
        const cabbagesToCollect = Math.min(this.harvestCapacity, cabbageDistances.length);
        cabbageDistances.splice(0, cabbagesToCollect);

        return cabbageDistances.map(c => c.index);
    }
}
