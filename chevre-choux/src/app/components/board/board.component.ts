import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game/game.service';
import { GraphService } from 'src/app/services/graph/graph.service';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  @ViewChild('visualiser', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer3D!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId!: number;

  constructor(private router: Router,
              private gameService: GameService,
              private graphService: GraphService,
              private renderer: Renderer2) { }

  ngOnInit(): void {
    this.renderer.setStyle(this.canvasContainer?.nativeElement, 'visibility', 'hidden');
    this.gameService.reset();
    this.initThreeScene();
    this.graphService.drawGraph(this.scene);
    this.animate();
    setTimeout(() => {
      this.gameService.startGame(this.scene, this.camera, this.renderer3D);
      this.renderer.setStyle(this.canvasContainer?.nativeElement, 'visibility', 'visible');
      this.gameService.setReplayCallback(this.replay.bind(this));
    }, 3000);
  }

  private initThreeScene(): void {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f6fa);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 5, 15);

    this.renderer3D = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer3D.setSize(width, height);
    this.renderer3D.setPixelRatio(window.devicePixelRatio);

    this.canvasContainer.nativeElement.appendChild(this.renderer3D.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer3D.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -10);
    this.scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(100, 100, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = -15;
    this.scene.add(gridHelper);
  }

  private animate(): void{
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    if (this.controls) {
      this.controls.update();
    }
    this.renderer3D.render(this.scene, this.camera);
  }

  replay(): void {
    const details = document.getElementById('details-informations');
    if (details) {
      details.style.color = 'black';
      details.textContent = 'Chargement du plateau de jeu...';
    }
    this.clearScene();
    setTimeout(() => {
      this.ngOnInit();
    }, 5);
  }

  private clearScene(): void{
    this.renderer.setStyle(this.canvasContainer?.nativeElement, 'visibility', 'hidden');
    cancelAnimationFrame(this.animationFrameId);
    if(this.renderer3D) {
      if (this.canvasContainer.nativeElement.contains(this.renderer3D.domElement)) {
        this.canvasContainer.nativeElement.removeChild(this.renderer3D.domElement);
      }
      this.renderer3D.dispose();
    }

    if(this.scene) {
      this.scene.clear();
    }
  }

  goBackToMenu(): void {
    this.router.navigate(['/configuration']);
  }

  validateTurn(): void {
    this.gameService.validateTurn();
  }

  cancelMove(): void {
    this.gameService.cancelMove();
  }

  getTurnCount(): number {
    return this.gameService.turn_count;
  }

  getCabbageCount(): number {
    return this.gameService.cabbage_count;
  }

}
