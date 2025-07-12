import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStoryFormComponent } from './user-story-form.component';

describe('UserStoryFormComponent', () => {
  let component: UserStoryFormComponent;
  let fixture: ComponentFixture<UserStoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStoryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
