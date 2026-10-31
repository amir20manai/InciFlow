import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signalements } from './signalements';

describe('Signalements', () => {
  let component: Signalements;
  let fixture: ComponentFixture<Signalements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signalements],
    }).compileComponents();

    fixture = TestBed.createComponent(Signalements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
