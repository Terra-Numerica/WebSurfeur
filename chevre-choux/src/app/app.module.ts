import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigurationMenuComponent } from './components/configuration-menu/configuration-menu.component';
import { GameModeMenuComponent } from './components/game-mode-menu/game-mode-menu.component';
import { GameService } from './services/game/game.service';
import { FormsModule } from '@angular/forms';
import { CreditComponent } from './components/credit/credit.component';
import { BoardComponent } from './components/board/board.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigurationMenuComponent,
    GameModeMenuComponent,
    BoardComponent,
    CreditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    GameService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
