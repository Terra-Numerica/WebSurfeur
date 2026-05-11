import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game/game.service';

@Component({
  selector: 'app-game-mode-menu',
  templateUrl: './game-mode-menu.component.html',
  styleUrls: ['./game-mode-menu.component.scss']
})
export class GameModeMenuComponent implements OnInit {

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  displayRules() {
    this.gameService.displayRules()
  }

}
