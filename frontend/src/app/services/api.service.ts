import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiResponse {
  ai_response: string;
  diagram_url: string;
  plantuml_code: string;
  error?: string; // Optional error field
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Ensure this URL matches your Flask backend address
  private apiUrl = "https://intelligram-ss3c.onrender.com/chat"//"http://127.0.0.1:5000/chat";
  private baseApiUrl = "https://intelligram-ss3c.onrender.com"//"http://127.0.0.1:5000"; // For diagram URLs

  constructor(private http: HttpClient) {}

  /**
   * Sends chat history to the backend and gets a response.
   * @param history The list of chat messages.
   * @returns An Observable of the API response.
   */
  sendChat(history: ChatMessage[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, { history }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Constructs the full URL for a diagram.
   * @param diagramPath The relative path from the API response.
   * @returns The full, absolute URL to the diagram image.
   */
  getDiagramFullUrl(diagramPath: string): string {
      // Add a timestamp to prevent browser caching issues
      const timestamp = new Date().getTime();
      return `${this.baseApiUrl}${diagramPath}?v=${timestamp}`;
  }

    /**
   * Sends the updated PlantUML code to the backend.
   * @param code The PlantUML code string.
   * @returns An Observable of the API response.
   */
  updatePlantUMLCode(code: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseApiUrl}/update_diagram`, { code }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Basic error handler for HTTP requests.
   * @param error The HttpErrorResponse.
   * @returns An Observable that throws an error.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errorMessage = `Server returned code ${error.status}, error message is: ${error.error?.error || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
