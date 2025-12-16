import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService, ActivityLog } from '../../core/services/audit.service';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-logs.html'
})
export class ActivityLogs implements OnInit {
  auditService = inject(AuditService);
  
  logs = signal<ActivityLog[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading.set(true);
    this.auditService.getLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // --- HELPER: Parse JSON to show what changed ---
  getChanges(log: ActivityLog): string[] {
    const changes: string[] = [];

    // 1. If Created, show what was created
    if (log.action === 'Added') {
      return ['Item Created'];
    }

    // 2. If Deleted
    if (log.action === 'Deleted') {
      return ['Item Deleted'];
    }

    // 3. If Modified, compare Old vs New
    if (log.oldValues && log.newValues) {
      try {
        const oldObj = JSON.parse(log.oldValues);
        const newObj = JSON.parse(log.newValues);

        // Loop through keys in the new object
        for (const key in newObj) {
          const oldVal = oldObj[key];
          const newVal = newObj[key];

          // Format dates to be readable (optional)
          const formattedOld = this.formatVal(oldVal);
          const formattedNew = this.formatVal(newVal);

          changes.push(`${key}: ${formattedOld} → ${formattedNew}`);
        }
      } catch (e) {
        return ['Error parsing details'];
      }
    }

    return changes;
  }

  // Helper to make values readable
  private formatVal(val: any): string {
    if (val === null || val === undefined) return 'null';
    // If it looks like a date, format it
    if (typeof val === 'string' && val.includes('T') && val.length > 10) {
      return val.split('T')[0]; // Just show YYYY-MM-DD
    }
    return val.toString();
  }

  getActionColor(action: string) {
    switch (action) {
      case 'Added': return 'text-success bg-success-subtle border-success';
      case 'Deleted': return 'text-danger bg-danger-subtle border-danger';
      case 'Modified': return 'text-primary bg-primary-subtle border-primary';
      default: return 'text-secondary bg-light border-secondary';
    }
  }
}