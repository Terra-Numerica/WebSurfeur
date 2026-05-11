import { Injectable } from '@angular/core';
import { Graph } from 'src/app/models/Graph/graph';
import Swal from 'sweetalert2';
import { Pawn } from 'src/app/models/Pawn/pawn';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { Strategy } from 'src/app/models/Strategy/istrategy';
import { EasyGoatStrategy } from 'src/app/models/Strategy/EasyGoatStrategy/easy-goat-strategy';
import { NormalGoatStrategy } from 'src/app/models/Strategy/NormalGoatStrategy/normal-goat-strategy';
import { DifficultGoatStrategy } from 'src/app/models/Strategy/DifficultStrategyGoat/difficult-goat-strategy';
import { ExtremeGoatStrategy } from 'src/app/models/Strategy/ExtremeGoatStrategy/extreme-goat-strategy';
import { EasyCollectorStrategy } from 'src/app/models/Strategy/EasyCollectorStrategy/easy-collector-strategy';
import { NormalCollectorStrategy } from 'src/app/models/Strategy/NormalCollectorStrategy/normal-collector-strategy';
import { DifficultCollectorStrategy } from 'src/app/models/Strategy/DifficultCollectorStrategy/difficult-collector-strategy';
import { ExtremeCollectorStrategy } from 'src/app/models/Strategy/ExtremeCollectorStrategy/extreme-collector-strategy';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _board_configuration: string | undefined;
  private _board_params: number[] = [];
  private _opponent_type: string | undefined;
  private _player_side: string = 'unknown';
  private _graph: Graph | undefined;
  private _harvest_capacity = 1;
  private _selected_level = 'easy';

  private currentCollectorStrategy: Strategy<number[]> | undefined;
  private currentGoatStrategy: Strategy<number> | undefined;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer3D!: THREE.WebGLRenderer;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private cabbageObjects: THREE.Object3D[] = [];
  private selectedCabbageObjects: THREE.Object3D[] = [];

  private goatObject?: THREE.Object3D;
  private textureLoader = new THREE.TextureLoader();

  private goat_turn = false;
  private goat_win = false;
  private goat_has_moved = false;
  private goat_token: Pawn | undefined;

  private goat_position: { index: number; x: number; y: number; z: number } = {
    index: -1,
    x: -1,
    y: -1,
    z: -1
  };
  
  private previous_goat_position: { index: number; x: number; y: number; z: number; node: any } | undefined;

  private cabbage_positions: { index: number; x: number; y: number; z: number }[] = [];

  private _turn_count = 0;

  private collector_color = '#4dc738';
  private goat_color = '#b56528';

  private replayCallback: () => void = () => {};

  constructor(private router: Router) { }

  

  startGame(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer3D: THREE.WebGLRenderer
  ): void {
    console.log('Starting game');

    if (!this._graph) {
      return;
    }

    this.scene = scene;
    this.camera = camera;
    this.renderer3D = renderer3D;

    const startPoint = this._graph.nodes[0];

    if (!startPoint) {
      return;
    }

    this.goat_turn = false;
    this.goat_win = false;
    this._turn_count = 0;

    this.cabbageObjects = [];
    this.selectedCabbageObjects = [];
    this.cabbage_positions = [];

    this.initAIStrategy();
    this.createCabbages(startPoint);
    this.createGoat(startPoint);
    this.initRaycasterClick();

    this.update();

    if (this.isAiOpponent()) {
      this.executeAiTurn();
    }
  }

  private isAiOpponent(): boolean {
    return (this._opponent_type ?? '').toLowerCase().trim() === 'ai'
        || (this._opponent_type ?? '').toLowerCase().trim() === 'ia';
  }

  private normalizedPlayerSide(): 'goat' | 'collector' | 'unknown' {
    const side = (this._player_side ?? '').toLowerCase().trim();

    if (side === 'goat' || side === 'chevre' || side === 'chèvre') {
      return 'goat';
    }

    if (side === 'collector' || side === 'collecteur') {
      return 'collector';
    }

    return 'unknown';
  }

  private initAIStrategy(): void {
    const side = this.normalizedPlayerSide();

    this.currentGoatStrategy = undefined;
    this.currentCollectorStrategy = undefined;

    if (side === 'collector') {
      if (this._selected_level === 'easy') {
        this.currentGoatStrategy = new EasyGoatStrategy();
      } else if (this._selected_level === 'medium') {
        this.currentGoatStrategy = new NormalGoatStrategy();
      } else if (this._selected_level === 'hard') {
        this.currentGoatStrategy = new DifficultGoatStrategy(this._harvest_capacity);
      } else if (this._selected_level === 'extreme') {
        this.currentGoatStrategy = new ExtremeGoatStrategy(this._harvest_capacity);
      }
    }

    if (side === 'goat') {
      if (this._selected_level === 'easy') {
        this.currentCollectorStrategy = new EasyCollectorStrategy(this._harvest_capacity);
      } else if (this._selected_level === 'medium') {
        this.currentCollectorStrategy = new NormalCollectorStrategy(this._harvest_capacity);
      } else if (this._selected_level === 'hard') {
        this.currentCollectorStrategy = new DifficultCollectorStrategy(this._harvest_capacity);
      } else if (this._selected_level === 'extreme') {
        this.currentCollectorStrategy = new ExtremeCollectorStrategy(this._harvest_capacity);
      }
    }

    console.log('[IA] init', {
      opponent_type: this._opponent_type,
      player_side: this._player_side,
      normalizedSide: side,
      level: this._selected_level,
      goatStrategy: !!this.currentGoatStrategy,
      collectorStrategy: !!this.currentCollectorStrategy
    });
  }

  private getRandomInt(min: number, max: number): number {
    const safeMin = Math.ceil(min);
    const safeMax = Math.floor(max);

    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }

  private createCabbages(startPoint: any): void {
    if (!this._graph) {
      return;
    }

    const totalNodesCount = this._graph.nodes.length;

    const safeNodes = this._graph.nodes
      .map(node => {
        if (
          node.index === startPoint.index ||
          node.x === undefined ||
          node.z === undefined
        ) {
          return null;
        }

        const distance = this._graph!.distance(startPoint, node);

        return {
          node,
          distance
        };
      })
      .filter(item => {
        if (!item) {
          return false;
        }

        
        
        
        
        return item.distance >= 2;
      }) as Array<{ node: any; distance: number }>;

    if (safeNodes.length === 0) {
      console.warn('[Choux] Aucun sommet sûr disponible pour placer les choux');
      return;
    }

    
    const minCabbages = Math.min(
      safeNodes.length,
      Math.max(3, this.harvest_capacity + 1)
    );

    const maxCabbages = Math.min(
      safeNodes.length,
      Math.max(minCabbages, Math.ceil(safeNodes.length * 0.75))
    );

    const cabbageCount = this.getRandomInt(minCabbages, maxCabbages);

    
    
    const sortedSafeNodes = [...safeNodes].sort((a, b) => {
      const scoreA = this.getCabbageDistanceScore(a.distance);
      const scoreB = this.getCabbageDistanceScore(b.distance);

      return scoreB - scoreA;
    });

    
    const shuffledSafeNodes = sortedSafeNodes.sort(() => Math.random() - 0.35);

    const selectedNodes = shuffledSafeNodes
      .slice(0, cabbageCount)
      .map(item => item.node);

    for (const node of selectedNodes) {
      const cabbage = this.createPawnSprite('assets/cabbageV2.png', 0x4dc738, 0.42);

      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const z = node.z ?? 0;

      cabbage.position.set(x, y + 0.25, z);

      cabbage.userData = {
        type: 'cabbage',
        index: node.index,
        node
      };

      this.scene.add(cabbage);
      this.cabbageObjects.push(cabbage);

      this.cabbage_positions.push({
        index: node.index,
        x,
        y,
        z
      });
    }

    console.log('[Choux] Distribution équilibrée générée', {
      totalNodes: totalNodesCount,
      safeNodes: safeNodes.length,
      cabbageCount,
      cabbagePositions: this.cabbage_positions.map(c => c.index),
      distances: selectedNodes.map(node => this._graph!.distance(startPoint, node))
    });
  }

  private getCabbageDistanceScore(distance: number): number {
    if (distance === 2) {
      return 100;
    }

    if (distance === 3) {
      return 80;
    }

    if (distance === 4) {
      return 50;
    }

    return 30;
  }

  private createGoat(startPoint: any): void {
    if (!this._graph) {
      return;
    }

    this.goatObject = this.createPawnSprite('assets/goat.png', 0xb56528, 0.58);

    this.goatObject.position.set(
      startPoint.x ?? 0,
      (startPoint.y ?? 0) + 0.35,
      startPoint.z ?? 0
    );

    this.goatObject.userData = {
      type: 'goat',
      index: startPoint.index,
      node: startPoint
    };

    this.scene.add(this.goatObject);

    this.goat_position = {
      index: startPoint.index,
      x: startPoint.x ?? 0,
      y: startPoint.y ?? 0,
      z: startPoint.z ?? 0
    };
  }

  private createPawnSprite(imagePath: string, fallbackColor: number, size: number): THREE.Sprite {
    const material = new THREE.SpriteMaterial({
      color: fallbackColor,
      transparent: true
    });

    this.textureLoader.load(
      imagePath,
      texture => {
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      },
      undefined,
      () => {
        material.color.set(fallbackColor);
        material.needsUpdate = true;
      }
    );

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size, 1);

    return sprite;
  }

  

  private initRaycasterClick(): void {
    this.renderer3D.domElement.removeEventListener('click', this.onCanvasClick);
    this.renderer3D.domElement.addEventListener('click', this.onCanvasClick);
  }

  private onCanvasClick = (event: MouseEvent): void => {
    if (!this.renderer3D || !this.camera || !this.scene) {
      return;
    }

    const canvas = this.renderer3D.domElement;
    const rect = canvas.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length === 0) {
      return;
    }

    const clickedObject = intersects[0].object as THREE.Object3D;

    if (clickedObject.userData.type === 'cabbage') {
      if (this.goat_turn) {
        this.moveGoatToNode(clickedObject.userData.node);
      } else {
        this.handleClickOnCabbage(clickedObject);
      }

      return;
    }

    if (clickedObject.userData.type === 'node' && clickedObject.userData.node) {
      this.moveGoatToNode(clickedObject.userData.node);
      return;
    }
  };

  

  private handleClickOnCabbage(cabbage: THREE.Object3D): void {
    if (this.goat_turn) {
      this.showTemporaryMessage(
        "Ce n'est pas au tour du collecteur de choux",
        'red'
      );
      return;
    }

    const alreadySelectedIndex = this.selectedCabbageObjects.findIndex(
      selected => selected.userData.index === cabbage.userData.index
    );

    if (alreadySelectedIndex !== -1) {
      this.selectedCabbageObjects.splice(alreadySelectedIndex, 1);
      this.setObjectOpacity(cabbage, 1);
    } else {
      if (this.selectedCabbageObjects.length < this.harvest_capacity) {
        this.selectedCabbageObjects.push(cabbage);
        this.setObjectOpacity(cabbage, 0.6);
      } else {
        this.showTemporaryMessage(
          'Vous avez atteint la limite de récolte pour ce tour',
          'red'
        );
      }
    }

    this.displayCollectCount();
  }

  private collectCabbages(): void {
    for (const cabbage of this.selectedCabbageObjects) {
      const index = cabbage.userData.index;

      const positionIndex = this.cabbage_positions.findIndex(
        cabbagePosition => cabbagePosition.index === index
      );

      if (positionIndex !== -1) {
        this.cabbage_positions.splice(positionIndex, 1);
      }

      const objectIndex = this.cabbageObjects.findIndex(
        object => object.userData.index === index
      );

      if (objectIndex !== -1) {
        this.cabbageObjects.splice(objectIndex, 1);
      }

      this.scene.remove(cabbage);
      this.disposeObject(cabbage);
    }

    this.selectedCabbageObjects = [];
  }

  private setObjectOpacity(object: THREE.Object3D, opacity: number): void {
    const material = (object as any).material as THREE.Material | undefined;

    if (!material) {
      return;
    }

    material.transparent = opacity < 1;
    material.opacity = opacity;
    material.needsUpdate = true;
  }

  

  private moveGoatToNode(node: any): void {
    if (!this.goatObject || !this._graph) {
      return;
    }

    if (!this.goat_turn) {
      this.showTemporaryMessage(
        "Ce n'est pas au tour de la chèvre",
        'red'
      );
      return;
    }

    if (this.goat_has_moved) {
      this.showTemporaryMessage(
        "La chèvre a déjà bougé ce tour-ci",
        'red'
      );
      return;
    }

    const currentNode = this.goatObject.userData.node;

    if (!currentNode) {
      return;
    }

    const accessibleNodes = this._graph.edges(currentNode);

    const isAccessible = accessibleNodes.some(
      accessibleNode => accessibleNode.index === node.index
    );

    if (!isAccessible) {
      this.showTemporaryMessage(
        'La chèvre ne peut se déplacer que sur un sommet adjacent',
        'red'
      );
      return;
    }

    
    this.previous_goat_position = {
      index: currentNode.index,
      x: currentNode.x,
      y: currentNode.y,
      z: currentNode.z,
      node: currentNode
    };

    this.goatObject.position.set(
      node.x ?? 0,
      (node.y ?? 0) + 0.35,
      node.z ?? 0
    );

    this.goatObject.userData.index = node.index;
    this.goatObject.userData.node = node;

    this.goat_has_moved = true;
    this.updateGoatPosition(node);
  }

  public updateGoatPosition(newGoatPosition: { index: number; x: number; y: number; z?: number }): void {
    this.goat_position = {
      index: newGoatPosition.index,
      x: newGoatPosition.x ?? 0,
      y: newGoatPosition.y ?? 0,
      z: newGoatPosition.z ?? 0
    };

    const cabbageIndex = this.cabbage_positions.findIndex(
      cabbage => cabbage.index === newGoatPosition.index
    );

    if (cabbageIndex !== -1) {
      this.goat_win = true;
    }
  }

  cancelMove(): void {
    if (!this.goat_turn) {
      
      for (const obj of this.selectedCabbageObjects) {
        this.setObjectOpacity(obj, 1);
      }
      this.selectedCabbageObjects = [];
      this.displayCollectCount();
      return;
    }

    if (this.goat_has_moved && this.previous_goat_position && this.goatObject) {
      const prev = this.previous_goat_position;
      this.goatObject.position.set(
        prev.x ?? 0,
        (prev.y ?? 0) + 0.35,
        prev.z ?? 0
      );
      this.goatObject.userData.index = prev.index;
      this.goatObject.userData.node = prev.node;

      this.goat_position = {
        index: prev.index,
        x: prev.x,
        y: prev.y,
        z: prev.z
      };

      this.goat_has_moved = false;
      this.goat_win = false;
      this.previous_goat_position = undefined;
      this.update();

      const limitMsg = document.getElementById('collect-limit');
      if (limitMsg) {
        limitMsg.remove();
      }
    }
  }

  

  validateTurn(): void {
    if (this.goat_turn === true) {
      if (!this.goat_has_moved) {
        this.showTemporaryMessage(
          "La chèvre doit bouger avant de finir son tour",
          'red'
        );
        return;
      }
      if (this.goatObject?.userData.node) {
        this.updateGoatPosition(this.goatObject.userData.node);
      }
      this.goat_token?.setState(environment.pawnWaitingTurn);
      this.goat_has_moved = false;
      this.previous_goat_position = undefined;
    } else {
      this.collectCabbages();
      this.goat_token?.setState(environment.pawnOnTurn);
    }

    if (this.checkEnd()) {
      this.handleGameOver();
      return;
    }

    this._turn_count++;
    this.goat_turn = !this.goat_turn;
    this.update();

    if (this.isAiOpponent()) {
      this.executeAiTurn();
    }
  }

  private executeAiGoatTurn(): void {
    if (!this._graph || !this.currentGoatStrategy) {
      console.warn('[IA chèvre] stratégie ou graphe manquant', {
        graph: !!this._graph,
        strategy: !!this.currentGoatStrategy
      });
      return;
    }

    const nextNodeIndex = this.currentGoatStrategy.turnAction(
      this._graph,
      this.goat_position.index,
      this.cabbage_positions.map(c => c.index)
    );

    let nextNode = this._graph.nodes.find(n => n.index === nextNodeIndex);

    if (!nextNode && this.goatObject?.userData.node) {
      const accessibleNodes = this._graph.edges(this.goatObject.userData.node);
      nextNode = accessibleNodes[0];
    }

    console.log('[IA chèvre] move', {
      from: this.goat_position.index,
      wanted: nextNodeIndex,
      selected: nextNode?.index
    });

    setTimeout(() => {
      if (nextNode) {
        this.moveGoatToNode(nextNode);
        this.validateTurn();
      } else {
        console.warn('[IA chèvre] aucun déplacement possible');
      }
    }, 1000);
  }

  private executeAiCollectorTurn(): void {
    if (!this._graph || !this.currentCollectorStrategy) {
      return;
    }

    const currentCabbageIndices = this.cabbage_positions.map(c => c.index);
    const remainingCabbages = this.currentCollectorStrategy.turnAction(
      this._graph,
      this.goat_position.index,
      currentCabbageIndices
    );

    const cabbagesToCollectIndices = currentCabbageIndices.filter(
      index => !remainingCabbages.includes(index)
    );

    this.selectedCabbageObjects = this.cabbageObjects.filter(obj =>
      cabbagesToCollectIndices.includes(obj.userData.index)
    );

    for (const obj of this.selectedCabbageObjects) {
      this.setObjectOpacity(obj, 0.6);
    }

    setTimeout(() => {
      this.validateTurn();
    }, 1000);
  }

  private executeAiTurn(): void {
    const side = this.normalizedPlayerSide();

    console.log('[IA] executeAiTurn', {
      opponent_type: this._opponent_type,
      player_side: this._player_side,
      normalizedSide: side,
      goat_turn: this.goat_turn
    });

    if (!this.isAiOpponent()) {
      return;
    }

    if (side === 'collector' && this.goat_turn) {
      this.executeAiGoatTurn();
      return;
    }

    if (side === 'goat' && !this.goat_turn) {
      this.executeAiCollectorTurn();
      return;
    }
  }

  private handleGameOver(): void {
    const message = this.goat_win
      ? 'La chèvre a gagnée !'
      : 'Le collecteur de choux a gagné !';

    const imgUrl = this.goat_win
      ? 'assets/goat.png'
      : 'assets/harvest.png';

    Swal.fire({
      title: 'Fin de partie',
      icon: 'success',
      text: message,
      showDenyButton: true,
      denyButtonText: 'Retour au menu',
      confirmButtonText: 'Rejouer',
      imageUrl: imgUrl,
      imageHeight: '10em'
    }).then((result) => {
      if (result.isDenied) {
        this.router.navigate(['/configuration']);
      } else if (result.isConfirmed) {
        this.replayCallback();
      }
    });
  }

  private checkEnd(): boolean {
    return this.goat_win || this.cabbage_positions.length === 0;
  }

  

  update(): void {
    if (this.goat_turn === true) {
      this.setDetailsText(
        "C'est au tour de la chèvre",
        this.goat_color
      );
    } else {
      this.setDetailsText(
        "C'est au tour du collecteur de choux",
        this.collector_color
      );

      this.displayCollectCount();
    }
  }

  private setDetailsText(message: string, color: string): void {
    const details = document.getElementById('details-informations');

    if (!details) {
      return;
    }

    details.style.color = color;
    details.textContent = message;
  }

  private displayCollectCount(): void {
    const details = document.getElementById('details-informations');

    if (!details) {
      return;
    }

    const oldInfo = document.getElementById('collect-informations');

    if (oldInfo) {
      oldInfo.remove();
    }

    const paragraph = document.createElement('p');
    paragraph.id = 'collect-informations';
    paragraph.textContent =
      `Nombre de choux restant à collecter : ${this.harvest_capacity - this.selectedCabbageObjects.length}`;

    details.appendChild(paragraph);
  }

  private showTemporaryMessage(message: string, color: string): void {
    const details = document.getElementById('details-informations');

    if (!details) {
      return;
    }

    const oldMessage = document.getElementById('collect-limit');

    if (oldMessage) {
      oldMessage.remove();
    }

    const paragraph = document.createElement('p');
    paragraph.id = 'collect-limit';
    paragraph.style.color = color;
    paragraph.textContent = message;

    details.appendChild(paragraph);
  }

  

  private disposeObject(object: THREE.Object3D): void {
    const mesh = object as any;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material: THREE.Material) => material.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
  }

  private clearThreeObjects(): void {
    if (this.renderer3D) {
      this.renderer3D.domElement.removeEventListener('click', this.onCanvasClick);
    }

    for (const cabbage of this.cabbageObjects) {
      this.scene?.remove(cabbage);
      this.disposeObject(cabbage);
    }

    if (this.goatObject) {
      this.scene?.remove(this.goatObject);
      this.disposeObject(this.goatObject);
      this.goatObject = undefined;
    }

    this.cabbageObjects = [];
    this.selectedCabbageObjects = [];
  }

  

  private getRulesHtml(): string {
    return `<p>Dans ce jeu, deux camps s'affrontent : <span style='color: ${this.goat_color}'>la chèvre</span> et <span style='color: ${this.collector_color}'>le collecteur de choux</span>.</p>
      <p>Le but de <span style='color: ${this.goat_color}'>la chèvre</span> est de manger un des choux présent sur le plateau de jeu.</p>
      <p>Le but du <span style='color: ${this.collector_color}'>collecteur de choux</span> est de récolter tous les choux présent sur le plateau de jeu avant que la chèvre ne puisse en manger un.</p>
      <br/>
      <p>Le jeu se déroule au tout par tour. Après que <span style='color: ${this.goat_color}'>la chèvre</span> est placée sur le point de départ, <span style='color: ${this.collector_color}'>le collecteur de choux</span> commence à récolter les choux.</p>
      <p><span style='color: ${this.goat_color}'>La chèvre</span> peut se déplacer d'un sommet par tour en suivant les arêtes.</p>
      <p><span style='color: ${this.collector_color}'>Le collecteur de choux</span> peut récolter, par tour, un nombre de choux égal à sa capacité de récolte.</p>`;
  }


  displayRules(): void {
    Swal.fire({
      icon: 'info',
      html: this.getRulesHtml()
    });
  }

  

  get board_conf(): string {
    if (this._board_configuration === undefined) {
      return 'unknown';
    }

    return this._board_configuration;
  }

  get board_params(): number[] {
    return this._board_params;
  }

  get opponent_type(): string {
    if (this._opponent_type === undefined) {
      return 'unknown';
    }

    return this._opponent_type;
  }

  get player_side(): string {
    return this._player_side;
  }

  get graph(): Graph | undefined {
    return this._graph;
  }

  get harvest_capacity(): number {
    return this._harvest_capacity;
  }

  get selected_level(): string {
    return this._selected_level;
  }

  get turn_count(): number {
    return this._turn_count;
  }

  get cabbage_count(): number {
    return this.cabbage_positions.length;
  }

  

  set board_conf(conf: string) {
    this._board_configuration = conf;
  }

  set board_params(params: number[]) {
    this._board_params = params;
  }

  set opponent_type(type: string) {
    this._opponent_type = type;
  }

  set player_side(side: string) {
    this._player_side = side;
  }

  set graph(graph: Graph | undefined) {
    this._graph = graph;
  }

  set harvest_capacity(capacity: number) {
    this._harvest_capacity = capacity;
  }

  set selected_level(level: string) {
    this._selected_level = level;
  }

  setReplayCallback(callback: () => void): void {
    this.replayCallback = callback;
  }

  reset(): void {
    this.clearThreeObjects();

    this.goat_win = false;
    this.goat_turn = false;
    this.goat_has_moved = false;
    this.goat_token = undefined;

    this.goat_position = {
      index: -1,
      x: -1,
      y: -1,
      z: -1
    };

    this.previous_goat_position = undefined;

    this.cabbage_positions = [];
    this.cabbageObjects = [];
    this.selectedCabbageObjects = [];
    this._turn_count = 0;
  }
}