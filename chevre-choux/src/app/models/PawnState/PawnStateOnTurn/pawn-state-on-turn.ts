import { environment } from "src/environments/environment";
import { PawnState } from "../pawn-state";
import * as d3 from "d3";
import { Graph } from "../../Graph/graph";

export class PawnStateOnTurn implements PawnState {
    private edges: any[] = []

    dragstarted(event: any, d: any): void {
        d.setted_position = false;

        for(const node of (d.graph as Graph).nodes) {
            if(node.x === d.last_position.x && node.y === d.last_position.y) {
                this.edges = (d.graph as Graph).edges({index: node.index})
                break;
            }
        }

        d3.select(event.sourceEvent.target).raise().attr('stroke', 'black')
    }

    dragged(event: any, d: any): void {
        d3.select(`#${d.id}`).attr('cx', event.x).attr('cy', event.y)
    }
    
    dragended(event: any, d: any): PawnState {
        d3.select(`#${d.id}`).raise().attr('stroke', null)

        for(const node of this.edges) {
            if(d.detect_radius >= this.getDistance({x: event.x, y: event.y}, {x: node.x, y: node.y})) {
                d3.select(`#${d.id}`).attr('cx', node.x).attr('cy', node.y);
                d.setted_position = true;
                d.last_position = node
                d.gameService.updateGoatPosition(node)
            }
        }

        if(!d.setted_position) {
            d3.select(`#${d.id}`).attr('cx', d.last_position.x).attr('cy', d.last_position.y)
            return this
        } else {
            return environment.pawnWaitingTurn;
        }
    }

    private getDistance(pos1: {x: number, y: number}, pos2: {x: number, y: number}): number {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y,2))
    }
    
}
