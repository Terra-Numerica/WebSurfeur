export interface PawnState {
    dragstarted(event: any, d: any): void;
    dragged(event: any, d: any): void;
    dragended(event: any, d: any): PawnState;
}
