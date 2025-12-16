import { Component, OnInit, inject, signal, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { Project, CreateProjectRequest } from '../../core/models/project.models';
import { TaskResponse } from '../../core/models/task.models'; 
import { LoaderService } from '../../core/services/loader.service';
import { ToastService } from '../../core/services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styles: [`
    /* Custom scrollbar for task list */
    .task-scroll-area {
      max-height: 70vh;
      overflow-y: auto;
      scrollbar-width: thin;
    }
  `]
})
export class Dashboard implements OnInit {

  // Injections
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  loader = inject(LoaderService);
  toast = inject(ToastService);
  platformId = inject(PLATFORM_ID);

  // Data
  projects = signal<Project[]>([]);
  activeTasks = signal<TaskResponse[]>([]); // New Signal for tasks
  isLoading = signal(true);

  // NEW PROJECT FORM DATA
  newProjectObj: CreateProjectRequest = {
    name: '',
    description: '',
    startDate: '',
    status: 'Active'
  };

  // Modal Reference
  @ViewChild('newProjectModal') modalRef!: ElementRef;
  private modalInstance: any;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProjects();
      this.loadActiveTasks(); // Load tasks on init
    }
  }

  loadProjects() {
    this.isLoading.set(true);
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  // --- NEW LOGIC: LOAD ACTIVE TASKS ---
  loadActiveTasks() {
    this.projectService.getTasks().subscribe({
      next: (allTasks) => {
        const user = this.authService.currentUser();
        if (!user) return;

        let filteredTasks = [];

        // 1. Role-Based Filtering
        if (user.role === 'Admin') {
          // Admins see everything
          filteredTasks = allTasks;
        } else if (user.role === 'Manager') {
          // Managers see tasks they created
          filteredTasks = allTasks.filter(t => t.creatorId === user.userId);
        } else {
          // Members see tasks assigned to them
          filteredTasks = allTasks.filter(t => t.assignedUserId === user.userId);
        }

        // 2. Status Filtering (Only Active)
        // We exclude 'Done' or 'Completed'
        filteredTasks = filteredTasks.filter(t => t.status !== 'Done' && t.status !== 'Completed');

        // 3. Sort by Due Date (Sooest first)
        filteredTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        this.activeTasks.set(filteredTasks);
      },
      error: (err) => console.error("Failed to load tasks", err)
    });
  }

  // Helper for Priority Colors
  getPriorityClass(priority: string) {
    switch (priority) {
      case 'High': return 'text-danger fw-bold';
      case 'Medium': return 'text-warning fw-bold';
      case 'Low': return 'text-success fw-bold';
      default: return 'text-secondary';
    }
  }

  // --- NEW PROJECT ACTIONS ---

  openNewProjectModal() {
    const modalElement = this.modalRef.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  onSaveProject() {
    if (!this.newProjectObj.name || !this.newProjectObj.startDate) {
      this.toast.show("Please fill in required fields.", 'error');
      return;
    }

    this.loader.show();
    this.projectService.createProject(this.newProjectObj).subscribe({
      next: (res) => {
        this.loader.hide();
        this.modalInstance.hide();
        this.toast.show("Project created successfully!");
        this.resetForm();
        this.loadProjects(); 
      },
      error: (err) => {
        this.loader.hide();
        const msg = err.error?.message || "Failed to create project.";
        this.toast.show(msg, 'error');
      }
    });
  }

  resetForm() {
    this.newProjectObj = {
      name: '',
      description: '',
      startDate: '',
      status: 'Active'
    };
  }

  canCreateProject(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Manager';
  }
}