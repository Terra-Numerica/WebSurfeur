import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParamBoundary } from 'src/app/models/param-boundary.model';
import { GameService } from 'src/app/services/game/game.service';
import { GraphService } from 'src/app/services/graph/graph.service';

@Component({
  selector: 'app-configuration-menu',
  templateUrl: './configuration-menu.component.html',
  styleUrls: ['./configuration-menu.component.scss']
})
export class ConfigurationMenuComponent implements OnInit {

  public configurations = ['tree', 'conf2', 'conf3', 'hexagonal', 'maze', 'enriched_tree', 'ring_branches'];
  public selected_configuration: string = 'tree';
  public configuration_param_boundaries: { [index: string]: { param1: ParamBoundary, param2: ParamBoundary | undefined } } = {
    tree: {
      param1: { min: 2, max: 25 },
      param2: { min: 1, max: 10 }
    },
    conf2: {
      param1: { min: 2, max: 20 },
      param2: undefined
    },
    conf3: {
      param1: { min: 2, max: 15 },
      param2: { min: 1, max: 10 }
    },
    hexagonal: {
      param1: { min: 2, max: 10 },
      param2: { min: 2, max: 10 }
    },
    maze: {
      param1: { min: 2, max: 10 },
      param2: { min: 2, max: 10 }
    },
    enriched_tree: {
      param1: { min: 10, max: 30 },
      param2: { min: 1, max: 5 }
    },
    ring_branches: {
      param1: { min: 5, max: 20 },
      param2: { min: 2, max: 8 }
    }
  }
  public param1: number = 0;
  public param2: number = 0;

  public opponent_types = ['ai', 'player'];
  private selected_opponent_type = 'player' 

  public sides = ['goat', 'collector'];
  private player_side = 'goat';

  public harvest_capacity = 1;

  public selected_level = 'easy';

  constructor(private gameService: GameService, private router: Router, private graphService: GraphService) { }

  startGame() {
    this.gameService.board_conf = this.selected_configuration;
    this.gameService.opponent_type = this.selected_opponent_type;
    this.gameService.player_side = this.player_side;

    const params = [this.param1, this.param2];
    this.gameService.board_params = params;

    this.gameService.graph = this.graphService.generateGraph(this.selected_configuration, params);
    this.gameService.harvest_capacity = this.harvest_capacity;
    
    this.router.navigate(['/board']);
  }

  ngOnInit(): void {
    this.initParams();
  }

  private initParams(): void {
    this.param1 = this.configuration_param_boundaries[this.selected_configuration].param1.min;
    if (this.configuration_param_boundaries[this.selected_configuration].param2 !== undefined) {
      this.param2 = this.configuration_param_boundaries[this.selected_configuration].param2!.min;
    } else { this.param2 = -1 }
  }

  displayRules() {
    this.gameService.displayRules()
  }

  goBack() {
    this.router.navigate(['/game-mode-selection'])
  }

  

  getConfigurationName(configuration: string): string {
    switch (configuration) {
      case 'tree':
        return 'Arbre Standard';
      case 'conf2':
        return 'Arbre Binaire';
      case 'conf3':
        return 'Arbre Restreint';
      case 'hexagonal':
        return 'Grille hexagonale';
      case 'maze':
        return 'Labyrinthe léger';
      case 'enriched_tree':
        return 'Arbre enrichi';
      case 'ring_branches':
        return 'Anneau avec branches';
      default:
        return 'Configuration inconnue';
    }
  }

  getConfigurationIcon(configuration: string): string {
    switch (configuration) {
      case 'tree':
        return 'assets/simple_lavender_organizational_tree_icon.png';
      case 'conf2':
        return 'assets/simple_purple_binary_tree_icon.png';
      case 'conf3':
        return 'assets/minimalist_purple_tree_diagram.png';
      case 'hexagonal':
        return 'assets/pastel_hexagonal_network_diagram.png';
      case 'maze':
        return 'assets/lavender_network_maze_diagram.png';
      case 'enriched_tree':
        return 'assets/abstract_purple_network_diagram.png';
      case 'ring_branches':
        return 'assets/lavender_molecule_network_icon_design.png';
      default:
        return 'assets/tree.svg';
    }
  }

  selectConfiguration(configuration: string) {
    this.selected_configuration = configuration;
    this.initParams();
  }

  isSelectedConfiguration(configuration: string): string {
    let classes = this.selected_configuration === configuration ? 'selected' : ''
    return classes
  }

  

  checkValueRightness(event: FocusEvent) {
    const target = event.target as any
    if (target.value !== '') {
      if (+target.value < target.min) {
        target.value = target.min;
      } else if (target.max !== '' && +target.value > target.max) {
        target.value = target.max;
      }
    } else {
      target.value = target.min;
    }
  }

  getParam1Name() {
    switch (this.selected_configuration) {
      case 'tree':
      case 'conf2':
      case 'conf3':
        return 'Nombre de noeuds :';
      case 'hexagonal':
      case 'maze':
        return 'Largeur :';
      case 'enriched_tree':
        return 'Nombre de noeuds :';
      case 'ring_branches':
        return 'Taille de l\'anneau :';
      default:
        return 'Paramètre 1 :';
    }
  }

  getParam2Name() {
    switch (this.selected_configuration) {
      case 'tree':
      case 'conf2':
      case 'conf3':
        return 'Arité :';
      case 'hexagonal':
      case 'maze':
        return 'Hauteur :';
      case 'enriched_tree':
        return 'Connexions bonus :';
      case 'ring_branches':
        return 'Nombre de branches :';
      default:
        return 'Paramètre 2 :';
    }
  }

  

  getOpponentTypeMessage(type: string): string {
    switch (type) {
      case 'ai':
        return 'Jouer contre un ordinateur';
      case 'player':
        return 'Jouer à 2 joueurs';
      default:
        return 'Adversaire inconnue';
    }
  }

  selectOpponentType(type: string) {
    this.selected_opponent_type = type;
  }

  isSelectedOpponentType(type: string): string {
    return this.selected_opponent_type === type ? `selected ${type}` : type;
  }

  isOnePlayerGame(): boolean {
    return this.selected_opponent_type === 'ai'
  }

  

  getSideName(side: string): string {
    switch (side) {
      case 'goat':
        return 'Chèvre';
      case 'collector':
        return 'Collecteur de choux';
      default:
        return 'Camp inconnue';
    }
  }

  selectSide(side: string) {
    this.player_side = side;
  }

  isSelectedSide(side: string): string {
    return this.player_side === side ? 'selected' : '';
  }

  

  isSelectedLevel(level: string): string {
    return this.selected_level === level ? 'selected' : '';
  }

}
