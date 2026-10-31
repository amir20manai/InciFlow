import { ComponentFixture, TestBed } from '@angular/core/testing';

import {  NotificationTechnicien } from './notification';

describe('NotificationTechnicien', () => {
  let component: NotificationTechnicien;
  let fixture: ComponentFixture<NotificationTechnicien>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationTechnicien],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationTechnicien);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
