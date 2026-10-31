import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentDetailTechnicien } from './incident-detail-technicien';

describe('IncidentDetailTechnicien', () => {
  let component: IncidentDetailTechnicien;
  let fixture: ComponentFixture<IncidentDetailTechnicien>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentDetailTechnicien],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentDetailTechnicien);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
