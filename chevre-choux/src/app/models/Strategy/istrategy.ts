import { Graph } from "../Graph/graph";

export interface Strategy<T> {
    turnAction(graph: Graph, goat_position_index: number, cabbage_positions_index: number[]): T;
}