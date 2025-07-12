import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-diagram-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diagram-panel.component.html',
  styleUrls: ['./diagram-panel.component.css']
})
export class DiagramPanelComponent implements OnChanges {
  @Input() diagramUrl: string | null = null;
  @Input() plantumlCode: string | null = null;
  @Input() errorMessage: string | null = null;
  @Input() isLoading: boolean = false;

  @ViewChild('diagramImage') diagramImage!: ElementRef<HTMLImageElement>;

  isDragging = false;
  private startX = 0;
  private startY = 0;
  private translateX = 0;
  private translateY = 0;
  private scale = 1;

  private debounceTimer: any;
  private lastCodeSnapshot: string | null = null;


  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diagramUrl'] && changes['diagramUrl'].currentValue) {
        this.errorMessage = null;
        this.resetTransform();
        this.lastCodeSnapshot = this.plantumlCode;
    }
  }

  onPlantUmlCodeChange(newCode: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.plantumlCode !== this.lastCodeSnapshot) {
        this.lastCodeSnapshot = this.plantumlCode;
        this.updateDiagram();
      }
    }, 3000);
  }

  updateDiagram(): void {
    if (!this.plantumlCode) {
      this.errorMessage = "Cannot update an empty diagram.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.updatePlantUMLCode(this.plantumlCode).subscribe({
      next: (response) => {
        this.plantumlCode = response.plantuml_code;
        this.diagramUrl = this.apiService.getDiagramFullUrl(response.diagram_url);
        this.lastCodeSnapshot = response.plantuml_code;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Failed to update diagram: ${err.message || 'Unknown error'}`;
        console.error('Error updating diagram:', err);
        this.isLoading = false;
      }
    });
  }

  imageLoaded() {
    // Parent component handles loading state
  }

  imageError() {
    this.errorMessage = "Failed to load the diagram image. Check the backend and PlantUML setup.";
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.diagramUrl || this.isLoading) return;
    event.preventDefault();

    const zoomIntensity = 0.1;
    const direction = event.deltaY > 0 ? -1 : 1;
    const newScale = this.scale + direction * zoomIntensity;

    this.scale = Math.max(0.1, newScale);
    this.updateTransform();
  }

  onMouseDown(event: MouseEvent) {
    if (!this.diagramUrl || this.isLoading) return;
    event.preventDefault();
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
    if (this.diagramImage) {
      this.diagramImage.nativeElement.style.cursor = 'grabbing';
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      event.preventDefault();
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
      this.updateTransform();
    }
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
       if (this.diagramImage) {
        this.diagramImage.nativeElement.style.cursor = 'grab';
       }
    }
  }

  private updateTransform() {
    if (this.diagramImage) {
      this.diagramImage.nativeElement.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
  }

  private resetTransform() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    if (this.diagramImage) {
        this.updateTransform();
    }
  }
}
