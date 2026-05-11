import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { ConfigurationMenuComponent } from './components/configuration-menu/configuration-menu.component';
import { CreditComponent } from './components/credit/credit.component';
import { GameModeMenuComponent } from './components/game-mode-menu/game-mode-menu.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'game-mode-selection'},
  {path: 'configuration', component: ConfigurationMenuComponent},
  {path: 'game-mode-selection', component: GameModeMenuComponent},
  {path: 'board', component: BoardComponent},
  {path: 'credit', component: CreditComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
