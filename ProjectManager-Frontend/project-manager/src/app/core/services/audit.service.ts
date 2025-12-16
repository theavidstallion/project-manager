import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ActivityLog {
  id: number;
  entityName: string;
  action: string;
  userName: string;
  timestamp: string;
  oldValues: string; // JSON string
  newValues: string; // JSON string
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // e.g. "https://localhost:7000/api"

  getLogs() {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/Audit`);
  }
}