import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileTechnicien } from './profile';

describe('ProfileTechnicien', () => {
  let component: ProfileTechnicien;
  let fixture: ComponentFixture<ProfileTechnicien>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileTechnicien],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileTechnicien);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
