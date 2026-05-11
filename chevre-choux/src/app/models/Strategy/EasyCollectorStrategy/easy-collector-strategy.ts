import { Graph } from "../../Graph/graph";
import { Strategy } from "../istrategy";

export class EasyCollectorStrategy implements Strategy<number[]>{
    private harvestCapacity: number;
    
    constructor(harvestCapacity: number){
        this.harvestCapacity = harvestCapacity;
    }

    turnAction(graph: Graph, goat_position_index: number, cabbage_positions_index: number[]): number[] {
        let collectNumber = this.harvestCapacity;
        for(let i = 0; i < collectNumber && cabbage_positions_index.length > 0; i++){
            const randomIndex = Math.floor(Math.random() * cabbage_positions_index.length);
            const cabbageToRemoveIndex = cabbage_positions_index[randomIndex];
            cabbage_positions_index = cabbage_positions_index.filter(cabbage_position_index => cabbage_position_index !== cabbageToRemoveIndex);
        }
        return cabbage_positions_index;
    }
}
