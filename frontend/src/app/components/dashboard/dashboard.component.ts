import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramPanelComponent } from '../diagram-panel/diagram-panel.component';
import { ChatPanelComponent } from '../chat-panel/chat-panel.component';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,FormsModule,ChatPanelComponent,DiagramPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
title = 'ChatUML';
  currentDiagramUrl: string | null = null;
  currentPlantumlCode: string | null = null;
  currentError: string | null = null;
  isChatVisible = false;
  isLoading = false;

  handleNewDiagram(data: { url: string, code: string }) {
    this.currentDiagramUrl = data.url;
    this.currentPlantumlCode = data.code;
    this.currentError = null;
    this.isLoading = false;
  }

  handleChatError(errorMessage: string) {
    this.currentError = errorMessage;
    this.isLoading = false;
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  handleLoading(loading: boolean) {
    this.isLoading = loading;
  }
}
