import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesSignalements } from './mes-signalements';

describe('MesSignalements', () => {
  let component: MesSignalements;
  let fixture: ComponentFixture<MesSignalements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesSignalements],
    }).compileComponents();

    fixture = TestBed.createComponent(MesSignalements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
