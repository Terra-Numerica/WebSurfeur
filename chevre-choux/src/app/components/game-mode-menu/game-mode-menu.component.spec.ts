import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameModeMenuComponent } from './game-mode-menu.component';

describe('GameModeMenuComponent', () => {
  let component: GameModeMenuComponent;
  let fixture: ComponentFixture<GameModeMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameModeMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameModeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
