import { Strategy } from "../istrategy";
import { Graph } from "../../Graph/graph";

export class NormalGoatStrategy implements Strategy<number>{
    turnAction(graph: Graph, goat_index: number, cabbage_indices: number[]): number {
        if (cabbage_indices.length === 0) {return goat_index;}

        const goatNode = graph.nodes.find(n => n.index === goat_index);

        if (!goatNode) {return goat_index;}

        const firstCabbageNode = graph.nodes.find(n => n.index === cabbage_indices[0]);

        if (!firstCabbageNode) {return goat_index;}

        let minDistance = graph.distance(goatNode, firstCabbageNode);
        let targetCabbageIndex = cabbage_indices[0];

        for (const cabbageIndex of cabbage_indices) {
            const cabbageNode = graph.nodes.find(n => n.index === cabbageIndex);

            if (!cabbageNode) {continue;}

            const distance = graph.distance(goatNode, cabbageNode);

            if (distance !== -1 && (minDistance === -1 || distance < minDistance)) {
                minDistance = distance;
                targetCabbageIndex = cabbageIndex;
            }
        }

        if (minDistance === -1) {return goat_index;}

        const neighbors = graph.edges(goatNode);
        const targetNode = graph.nodes.find(n => n.index === targetCabbageIndex);

        if (!targetNode) {return goat_index;}

        let bestNeighborIndex = goat_index;
        let minNeighborDistance = -1;

        for (const neighbor of neighbors) {
            const distance = graph.distance(neighbor, targetNode);

            if (distance !== -1 && (minNeighborDistance === -1 || distance < minNeighborDistance)) {
                minNeighborDistance = distance;
                bestNeighborIndex = neighbor.index;
            }
        }

        return bestNeighborIndex;
    }
}
