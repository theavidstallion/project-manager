import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLogs } from './activity-logs';

describe('ActivityLogs', () => {
  let component: ActivityLogs;
  let fixture: ComponentFixture<ActivityLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityLogs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
