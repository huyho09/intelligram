import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ChatMessage } from '../../services/api.service';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.css']
})
export class ChatPanelComponent implements AfterViewChecked {
  @Output() newDiagram = new EventEmitter<{ url: string, code: string }>();
  @Output() chatError = new EventEmitter<string>();
  @Output() closeChat = new EventEmitter<void>();
  @Output() loading = new EventEmitter<boolean>();

  @ViewChild('chatWindow') private messageContainer!: ElementRef;

  messages: ChatMessage[] = [
      { role: 'assistant', content: "Hello! How can I help you visualize your ideas today? Describe what you want to diagram." }
  ];
  userInput: string = '';
  isLoading: boolean = false;
  private needsScroll: boolean = false;

  constructor(private apiService: ApiService) {}

  ngAfterViewChecked() {
    if (this.needsScroll) {
        this.scrollToBottom();
        this.needsScroll = false;
    }
  }

  handleEnterKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
        keyboardEvent.preventDefault();
        this.sendMessage();
    }
  }

  sendMessage() {
    const trimmedInput = this.userInput.trim();
    if (!trimmedInput) {
      return;
    }

    this.loading.emit(true);
    this.isLoading = true;

    this.messages.push({ role: 'user', content: trimmedInput });
    this.userInput = '';
    this.chatError.emit('');
    this.needsScroll = true;

    this.apiService.sendChat(this.messages).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messages.push({ role: 'assistant', content: response.ai_response });
        if (response.diagram_url && response.plantuml_code) {
          this.newDiagram.emit({
              url: this.apiService.getDiagramFullUrl(response.diagram_url),
              code: response.plantuml_code
          });
        }
        this.needsScroll = true;
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = `Failed to get response: ${err.message || 'Server error'}`;
        this.messages.push({ role: 'assistant', content: `Sorry, I encountered an error: ${errorMessage}` });
        this.chatError.emit(errorMessage);
        this.needsScroll = true;
      }
    });
  }

  private scrollToBottom(): void {
      try {
          this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      } catch(err) {
          console.error("Could not scroll to bottom:", err);
      }
  }

  minimize() {
    this.closeChat.emit();
  }
}
