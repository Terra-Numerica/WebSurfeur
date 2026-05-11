import { PawnStateOnTurn } from "src/app/models/PawnState/PawnStateOnTurn/pawn-state-on-turn";
import { PawnStateWaitingTurn } from "src/app/models/PawnState/PawnStateWaitingTurn/pawn-state-waiting-turn";

export const environment = {
  production: true,
  pawnWaitingTurn: new PawnStateWaitingTurn(),
  pawnOnTurn: new PawnStateOnTurn()
};
