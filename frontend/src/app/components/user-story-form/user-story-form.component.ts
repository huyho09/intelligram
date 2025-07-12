import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-story-form',
  templateUrl: './user-story-form.component.html',
  styleUrls: ['./user-story-form.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule] // Import FormsModule here
})
export class UserStoryFormComponent {
  role: string = '';
  want: string = '';
  soThat: string = '';
  criteria: string = '';
  workflowSteps: string = '';
  markdownOutput: string = '';
  diagramUrl: string = '';

  constructor(private apiService: ApiService) {}

  async submitForm() {
    const markdownData = `
A. User Story

[AS A] ${this.role}

[I WANT] ${this.want}

[SO THAT] ${this.soThat}

B. Acceptance Criteria

${this.criteria}

C. Workflow Steps

${this.workflowSteps}
    `;

    try {
      const result = await this.apiService.generateDiagram(markdownData);
      this.markdownOutput = result.markdown_output;
      this.diagramUrl = `http://127.0.0.1:5000${result.diagram_url}`;
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
