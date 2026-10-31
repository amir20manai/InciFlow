import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouveauSignalement } from './nouveau-signalement';

describe('NouveauSignalement', () => {
  let component: NouveauSignalement;
  let fixture: ComponentFixture<NouveauSignalement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouveauSignalement],
    }).compileComponents();

    fixture = TestBed.createComponent(NouveauSignalement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
