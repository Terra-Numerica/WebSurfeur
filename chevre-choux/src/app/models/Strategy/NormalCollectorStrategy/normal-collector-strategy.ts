import { Strategy } from "../istrategy";
import { Graph } from "../../Graph/graph";

export class NormalCollectorStrategy implements Strategy<number[]>{
    private harvestCapacity: number;

    constructor(harvestCapacity: number){
        this.harvestCapacity = harvestCapacity;
    }
    
    turnAction(graph: Graph, goat_index: number, cabbage_indices: number[]): number[] {
        const nodeGoat = graph.nodes.find(n => n.index === goat_index);
        if(!nodeGoat) {return cabbage_indices;}

        const distances = [];
        for(let cabbageIndex of cabbage_indices) {
            const nodeCabbage = graph.nodes.find(n => n.index === cabbageIndex);
            if(!nodeCabbage) {continue;}

            const distance = graph.distance(nodeGoat, nodeCabbage);
            distances.push({distance, index: cabbageIndex});
        }
        distances.sort((a, b) => a.distance - b.distance);
        const nbCabbagesToCollect = Math.min(this.harvestCapacity, distances.length);

        distances.splice(0, nbCabbagesToCollect);

        return distances.map(d => d.index);
    }
}
