import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentDetailEmployee } from './incident-detail-employee';

describe('IncidentDetailEmployee', () => {
  let component: IncidentDetailEmployee;
  let fixture: ComponentFixture<IncidentDetailEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentDetailEmployee],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentDetailEmployee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
