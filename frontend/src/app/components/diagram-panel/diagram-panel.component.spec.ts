import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramPanelComponent } from './diagram-panel.component';

describe('DiagramPanelComponent', () => {
  let component: DiagramPanelComponent;
  let fixture: ComponentFixture<DiagramPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagramPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagramPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
