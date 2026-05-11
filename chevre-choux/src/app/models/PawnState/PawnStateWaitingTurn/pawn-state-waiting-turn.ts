import { PawnState } from "../pawn-state";
import * as d3 from "d3";

export class PawnStateWaitingTurn implements PawnState {
    private details_id = '#details-informations';

    dragstarted(event: any, d: any): void {
        
        d3.select(this.details_id)
            .append('p')
                .attr('id', 'turn-info')
                .text(() => 'Le chèvre ne peut pas être déplacée.');
        d3.select(event.sourceEvent.target).raise().attr('stroke', 'black');
    }

    dragged(event: any, d: any): void {
    }

    dragended(event: any, d: any): PawnState {
        
        d3.select('#turn-info').remove();
        return this;
    }
    
}
