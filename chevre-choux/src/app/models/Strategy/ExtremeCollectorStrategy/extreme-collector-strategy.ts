import { Graph } from "../../Graph/graph";
import { Strategy } from "../istrategy";

export class ExtremeCollectorStrategy implements Strategy<number[]>{
    private harvestCapacity: number;

    constructor(harvestCapacity: number){
        this.harvestCapacity = harvestCapacity;
    }

    turnAction(graph: Graph, goat_position_index: number, cabbage_positions_index: number[]): number[] {
        const goatNode = graph.nodes.find(n => n.index === goat_position_index);
        if(!goatNode){return cabbage_positions_index;}

        const neighborsNode = graph.edges(goatNode);
        if(!neighborsNode || neighborsNode.length === 0){return cabbage_positions_index;}

        let results = [] as number[][];
        let selection = [];
        let bestScore = -1;
        let bestGroupe = [];

        this.formerGroupesDeChoux(selection, results, cabbage_positions_index, 0);

        for(const choice of results){
            let goatChoice = [];
            let plateauRestant = cabbage_positions_index.filter(c => !choice.includes(c));

            if(plateauRestant.length === 0){
                bestGroupe = choice;
                break;
            }

            for(const neighbor of neighborsNode){
                let cabbageByDistance = [];
                for(const cabbageIndex of plateauRestant){
                    const cabbageNode = graph.nodes.find(n => n.index === cabbageIndex);
                    if(!cabbageNode){continue;}

                    let distance = graph.distance(neighbor, cabbageNode);

                    cabbageByDistance.push({distance, cabbageNodeIndex: cabbageNode.index});
                }
                if(cabbageByDistance.length === 0){continue;}

                let minDistanceNeighbor = Math.min(...cabbageByDistance.map(c => c.distance));
                goatChoice.push({neighbor: neighbor.index, minDistanceNeighbor});
            }
            
            if(goatChoice.length === 0){continue;}

            let score = Math.min(...goatChoice.map(c => c.minDistanceNeighbor));
            
            if(score > bestScore){
                bestScore = score;
                bestGroupe = choice;
            }
        }
        if (bestGroupe.length === 0) {return cabbage_positions_index;}

        return cabbage_positions_index.filter(c => !bestGroupe.includes(c));
    }

    formerGroupesDeChoux(currentSelection: number[], results: number[][], sourceArray: number[],startIndex: number){
        if(currentSelection.length === this.harvestCapacity){
            results.push([...currentSelection]);
            return;
        }else if(this.harvestCapacity >= sourceArray.length){
            results.push([...sourceArray]);
            return;
        }else{
            for(let i = startIndex; i < sourceArray.length; i++){
                currentSelection.push(sourceArray[i]);
                this.formerGroupesDeChoux(currentSelection, results, sourceArray, i + 1);
                currentSelection.pop();
            }
        }
    }
}
