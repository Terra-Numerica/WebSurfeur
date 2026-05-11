import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationMenuComponent } from './configuration-menu.component';


describe('ConfigurationMenuComponent', () => {
  let component: ConfigurationMenuComponent;
  let fixture: ComponentFixture<ConfigurationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
