import { Component, OnInit, inject, signal, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import Swal from 'sweetalert2';

import { ProjectService } from '../../core/services/project.service';
import { AdminService } from '../../core/services/admin.service'; 
import { AuthService } from '../../core/services/auth.service';   
import { UserResponse } from '../../core/models/user.models';
import { Project, EditProjectRequest } from '../../core/models/project.models';
import { TaskResponse, CreateTaskRequest } from '../../core/models/task.models';
import { TagResponse } from '../../core/models/tags.models';
import { LoaderService } from '../../core/services/loader.service';
import { ToastService } from '../../core/services/toast.service';
import { CommentResponse } from '../../core/models/task.models';

declare var bootstrap: any;

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe], 
  templateUrl: './project-details.html'
})
export class ProjectDetails implements OnInit {
  
  // Services
  route = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  adminService = inject(AdminService);
  authService = inject(AuthService); 
  loader = inject(LoaderService);
  toast = inject(ToastService);
  router = inject(Router);

  // For Edit Project form
  editProjectObj: EditProjectRequest = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ''
  };
  // For New Task form
  newTaskObj: CreateTaskRequest = {
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    status: 'To Do',
    projectId: 0,
    assignedUserId: '',
    tagIds: []
  };

  // Tasks filteration
  filteredTasks = signal<TaskResponse[]>([]); 
  
  filterConfig = {
    status: '',
    priority: '',
    assignedUserId: '',
    tag: '',
    startDate: '',
    endDate: ''
  };


  selectedTask: TaskResponse | null = null;
  availableTags = signal<TagResponse[]>([]);
  taskComments = signal<CommentResponse[]>([]);
  newCommentText = '';

  tempTagIds: number[] = []; // Stores IDs while editing
  @ViewChild('manageTagsModal') manageTagsModalRef!: ElementRef;
  private manageTagsModalInstance: any;
  
  @ViewChild('taskDetailModal') taskDetailModalRef!: ElementRef;
  private taskDetailModalInstance: any;

  // ViewChild fetches html element and ElementRef lets us do things with it
  @ViewChild('editProjectModal') editModalRef!: ElementRef;
  private editModalInstance: any;

  @ViewChild('addTaskModal') addTaskModalRef!: ElementRef;
  private addTaskModalInstance: any;

  // State
  project = signal<Project | null>(null);
  projectTasks = signal<TaskResponse[]>([]);

  isEditingTask = signal(false);
  editTaskData: any = {};
  
  // ADD MEMBER STATE
  allUsers: UserResponse[] = []; // The full raw list
  filteredUsers = signal<UserResponse[]>([]); // The list displayed in modal
  searchQuery = signal(''); // What user typed
  selectedUserId = signal<string | null>(null); // Who they clicked on

  // Modal Ref
  @ViewChild('addMemberModal') memberModalRef!: ElementRef;
  private memberModalInstance: any;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(Number(id));
      this.loadTasks(Number(id));
      this.loadTags();
    }
  }

  loadProject(id: number) {
    this.projectService.getProject(id).subscribe({
      next: (data) => this.project.set(data),
      error: (err) => console.error(err)
    });
  }

  loadTasks(projectId: number) {
    this.projectService.getTasks().subscribe({
      next: (allTasks) => {
        // A. Filter global list down to THIS project
        const projectSpecificTasks = allTasks.filter(t => t.projectId === projectId);
        
        // B. Set the Master List (Source of Truth)
        this.projectTasks.set(projectSpecificTasks);
        
        // C. Initialize the Display List (Apply default/empty filters)
        this.applyFilters(); 
      },
      error: (err) => console.error("Failed to load tasks", err)
    });
  }

  // Helper for Priority Colors
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'text-danger bg-danger-subtle';
      case 'Medium': return 'text-warning bg-warning-subtle';
      case 'Low': return 'text-success bg-success-subtle';
      default: return 'text-secondary bg-light';
    }
  }
  
  // Helper for Status Colors
  getStatusBadge(status: string): string {
      switch (status) {
          case 'Done': return 'bg-success';
          case 'In Progress': return 'bg-primary';
          default: return 'bg-secondary';
      }
  }

  // --- ADD MEMBER LOGIC ---

  openAddMemberModal() {
    const p = this.project();
    if (this.authService.currentUser()?.userId !== this.project()?.creatorId) {
      this.toast.show("You do not have permission to add a member to this project.", "error");
      return;
    }
    this.searchQuery.set('');
    this.selectedUserId.set(null);
    
    this.loader.show();
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.loader.hide();
        
        // CHANGE THIS LINE: Use .username instead of .email
        // We assume username holds the email address
        const currentUserEmail = this.authService.currentUser()?.username; 
        
        const currentMembers = this.project()?.members.map(m => m.email) || [];

        this.allUsers = users.filter(u => 
          u.email !== 'admin@project.com' &&      
          u.email !== currentUserEmail &&         // Compare API email vs Local username
          !currentMembers.includes(u.email)       
        );

        this.filteredUsers.set(this.allUsers);

        const el = this.memberModalRef.nativeElement;
        this.memberModalInstance = new bootstrap.Modal(el);
        this.memberModalInstance.show();
      },
      error: (err) => {
        this.loader.hide();
        this.toast.show("Could not load users.", 'error');
      }
    });
  }

  // Live Search Logic
  onSearch() {
    const query = this.searchQuery().toLowerCase();
    
    if (!query) {
      this.filteredUsers.set(this.allUsers);
    } else {
      const filtered = this.allUsers.filter(u => 
        u.firstName.toLowerCase().includes(query) || 
        u.lastName.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
      this.filteredUsers.set(filtered);
    }
  }

  // Select a user from the list
  selectUser(id: string) {
    // Toggle selection
    if (this.selectedUserId() === id) {
      this.selectedUserId.set(null); // Deselect
    } else {
      this.selectedUserId.set(id);
    }
  }

  // Submit Logic
  onAddMember() {
    const userId = this.selectedUserId();
    const projectId = this.project()?.id;

    if (!userId || !projectId) return;

    // 1. FIND THE FULL USER OBJECT
    // We search the 'allUsers' array (which we fetched for the modal)
    // to get the missing details (First Name, Email, etc.)
    const selectedUser = this.allUsers.find(u => u.id === userId);

    if (!selectedUser) {
      this.toast.show("Error: User details missing.", 'error');
      return;
    }

    this.loader.show();
    
    // 2. PASS THE FULL OBJECT
    this.projectService.addMember(projectId, selectedUser).subscribe({
      next: () => {
        this.loader.hide();
        this.memberModalInstance.hide();
        this.toast.show("Member added successfully!");
        this.loadProject(projectId); // Refresh list
      },
      error: (err) => {
        this.loader.hide();
        const msg = err.error?.message || "Failed to add member.";
        this.toast.show(msg, 'error');
      }
    });
  }


  // Edit Project handlers
  openEditModal() {
    const p = this.project();
    if (!p) return;

    // PRE-FILL FORM
    // We strictly copy values so we don't edit the live page directly
    this.editProjectObj = {
      name: p.name,
      description: p.description,
      // Format Date: "2023-01-01T00:00:00" -> "2023-01-01" for HTML Input
      startDate: p.startDate.split('T')[0], 
      endDate: p.endDate ? p.endDate.split('T')[0] : null, 
      status: p.status
    };

    // Open Bootstrap Modal
    const el = this.editModalRef.nativeElement;
    this.editModalInstance = new bootstrap.Modal(el);
    this.editModalInstance.show();
  }

  onUpdateProject() {
    const p = this.project();
    if (!p) return;

    this.loader.show();
    
    // Call API - Backend decides if this is allowed
    this.projectService.updateProject(p.id, this.editProjectObj).subscribe({
      next: () => {
        this.loader.hide();
        this.editModalInstance.hide();
        this.toast.show("Project updated successfully!");
        this.loadProject(p.id); // Refresh Page Data
      },
      error: (err) => {
        this.loader.hide();
        // If Backend says 403 Forbidden, this toast shows it.
        const msg = err.error?.message || "You do not have permission to edit this project.";
        this.toast.show(msg, 'error');
      }
    });
  }

  // Delete Project
  onDeleteProject() {
    const p = this.project();
    if (!p) return;

    Swal.fire({
      title: `Delete "${p.name}"?`,
      text: "This project and all its tasks will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // Danger Red
      cancelButtonColor: '#6c757d',  // Secondary Gray
      confirmButtonText: 'Yes, delete project!'
    }).then((result) => {
      
      if (result.isConfirmed) {
        // --- PROCEED ---
        this.loader.show();

        this.projectService.deleteProject(p.id).subscribe({
          next: () => {
            this.loader.hide();
            
            // Show Success Alert
            Swal.fire({
              title: 'Deleted!',
              text: 'The project has been deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });

            // Redirect to Dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.loader.hide();
            const msg = err.error?.message || "Failed to delete project.";
            
            // You can use Toast here, or a Swal Error
            Swal.fire('Error', msg, 'error');
          }
        });
      }
    });
  }
  // Create New Task handlers
  openAddTaskModal() {
    const p = this.project();
    if (!p) return;
    if (this.authService.currentUser()?.userId !== p.creatorId) {
      this.toast.show("You do not have permission to add a task to this project.", "error");
      return;
    }


    // Reset Form
    this.newTaskObj = {
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '', // HTML Date inputs need empty string, not null
      status: 'To Do',
      projectId: p.id, // Auto-link to current project
      assignedUserId: '', // Reset assignment
      tagIds: []
    };

    // Open Modal
    const el = this.addTaskModalRef.nativeElement;
    this.addTaskModalInstance = new bootstrap.Modal(el);
    this.addTaskModalInstance.show();
  }

  onSaveTask() {
    // Basic Validation
    if (!this.newTaskObj.title || !this.newTaskObj.assignedUserId || !this.newTaskObj.dueDate) {
      this.toast.show("Please fill in Title, Due Date, and Assign a Member.", 'error');
      return;
    }

    this.loader.show();
    this.projectService.createTask(this.newTaskObj).subscribe({
      next: () => {
        this.loader.hide();
        this.addTaskModalInstance.hide();
        this.toast.show("Task created successfully!");
        
        // Refresh Tasks List (Wait a tiny bit or just call load)
        if (this.project()) {
          this.loadTasks(this.project()!.id);
        }
      },
      error: (err) => {
        this.loader.hide();
        const msg = err.error?.message || "Failed to create task.";
        this.toast.show(msg, 'error');
      }
    });
  }

  // Open Task
  openTaskDetail(task: TaskResponse) {
    this.selectedTask = task;
    this.isEditingTask.set(false); 

    // Reset State
    this.taskComments.set([]); 
    this.newCommentText = '';
    
    // Load fresh comments
    this.loadComments(task.id);

    const el = this.taskDetailModalRef.nativeElement;
    this.taskDetailModalInstance = new bootstrap.Modal(el);
    this.taskDetailModalInstance.show();
  }

  // Tags handlers
  loadTags() {
    this.projectService.getAllTags().subscribe({
      next: (tags) => this.availableTags.set(tags),
      error: () => console.error("Could not load tags") // Silent fail is ok here
    });
  }

  // 3. TOGGLE TAG SELECTION (For the UI)
  toggleTagSelection(tagId: number) {
    const currentTags = this.newTaskObj.tagIds || [];
    
    if (currentTags.includes(tagId)) {
      // If already selected, remove it
      this.newTaskObj.tagIds = currentTags.filter(id => id !== tagId);
    } else {
      // If not selected, add it
      this.newTaskObj.tagIds = [...currentTags, tagId];
    }
  }

  // Helper to check if a tag is selected (for styling)
  isTagSelected(tagId: number): boolean {
    return this.newTaskObj.tagIds?.includes(tagId) ?? false;
  }

  loadComments(taskId: number) {
    this.projectService.getComments(taskId).subscribe({
      next: (data) => this.taskComments.set(data),
      error: () => this.toast.show('Failed to load comments.', 'error')
    });
  }

  // 3. ADD COMMENT
  onAddComment() {
    if (!this.selectedTask || !this.newCommentText.trim()) return;

    const taskId = this.selectedTask.id;
    
    this.projectService.addComment(taskId, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = ''; // Clear input
        this.loadComments(taskId); // Refresh list
        this.toast.show('Comment posted.');
      },
      error: (err) => this.toast.show('Failed to post comment.', 'error')
    });
  }

  // 4. DELETE COMMENT
  onDeleteComment(commentId: number) {
    if (!this.selectedTask) return;
    
    if (confirm('Delete this comment?')) {
      this.projectService.deleteComment(this.selectedTask.id, commentId).subscribe({
        next: () => {
          this.loadComments(this.selectedTask!.id);
          this.toast.show('Comment deleted.');
        },
        error: () => this.toast.show('Could not delete comment.', 'error')
      });
    }
  }

  isCommentAuthor(comment: CommentResponse): boolean {
    const user = this.authService.currentUser();
    
    // 1. Safety Check
    if (!user || !user.userId) return false;

    // 2. DEBUGGING (Check your Console to see why it fails)
    // console.log(`Me: ${user.userId}, Author: ${comment.authorId}`);

    // 3. Case-Insensitive Check (Fixes GUID mismatches)
    const isAuthor = user.userId.toLowerCase() === comment.authorId.toLowerCase();
    const isAdmin = user.role === 'Admin';

    return isAuthor || isAdmin;
  }


  //Tags Handlers
  openManageTagsModal() {
    if (!this.selectedTask) return;

    // We need to convert the Task's tag NAMES (["Bug", "Urgent"]) 
    // back into IDs ([1, 5]) so we can select them in the UI.
    const currentTagNames = this.selectedTask.tags || [];
    
    this.tempTagIds = this.availableTags()
      .filter(tag => currentTagNames.includes(tag.name))
      .map(tag => tag.id);

    // Open Modal
    const el = this.manageTagsModalRef.nativeElement;
    this.manageTagsModalInstance = new bootstrap.Modal(el);
    this.manageTagsModalInstance.show();
  }

  // 3. TOGGLE LOGIC (For the Manage Modal)
  toggleManageTagSelection(tagId: number) {
    if (this.tempTagIds.includes(tagId)) {
      // Remove (Delete)
      this.tempTagIds = this.tempTagIds.filter(id => id !== tagId);
    } else {
      // Add
      this.tempTagIds = [...this.tempTagIds, tagId];
    }
  }

  isManageTagSelected(tagId: number): boolean {
    return this.tempTagIds.includes(tagId);
  }

  // 4. SAVE CHANGES
  onSaveTags() {
    if (!this.selectedTask) return;
    
    // We must reconstruct the whole object because your Backend PUT replaces everything
    const updatePayload = {
      title: this.selectedTask.title,
      description: this.selectedTask.description,
      priority: this.selectedTask.priority,
      dueDate: this.selectedTask.dueDate,
      status: this.selectedTask.status,
      tagIds: this.tempTagIds // <--- The new list of tags
    };

    this.loader.show();
    this.projectService.updateTask(this.selectedTask.id, updatePayload).subscribe({
      next: () => {
        this.loader.hide();
        this.manageTagsModalInstance.hide();
        this.toast.show('Tags updated successfully');
        
        // Refresh the task details to show new tags
        this.loadTaskDetails(this.selectedTask!.id);
        // Also refresh the main list in background
        this.loadTasks(this.project()!.id);
      },
      error: (err) => {
        this.loader.hide();
        this.toast.show('Failed to update tags', 'error');
      }
    });
  }

  // Helper to refresh single task data after update
  loadTaskDetails(taskId: number) {
    this.projectService.getTaskById(taskId).subscribe(updatedTask => { // You might need to add getTaskById to service
      this.selectedTask = updatedTask;
    });
  }

  // Edit Task

  // 3. ENABLE EDIT MODE
  startEditTask() {
    if (!this.selectedTask) return;

    // Copy current values to form object
    this.editTaskData = {
      title: this.selectedTask.title,
      description: this.selectedTask.description,
      priority: this.selectedTask.priority,
      status: this.selectedTask.status,
      // Format date for HTML input (YYYY-MM-DD)
      dueDate: this.selectedTask.dueDate.split('T')[0] 
    };

    this.isEditingTask.set(true);
  }

  // 4. CANCEL EDIT
  cancelEditTask() {
    this.isEditingTask.set(false);
  }

  // 5. SAVE CHANGES
  onSaveChanges() {
    if (!this.selectedTask) return;

    // 1. Prepare Payload (Existing logic)
    const currentTagNames = this.selectedTask.tags || [];
    const currentTagIds = this.availableTags()
      .filter(t => currentTagNames.includes(t.name))
      .map(t => t.id);

    const updatePayload = {
      title: this.editTaskData.title,
      description: this.editTaskData.description,
      priority: this.editTaskData.priority,
      dueDate: this.editTaskData.dueDate,
      status: this.editTaskData.status,
      tagIds: currentTagIds
    };

    this.loader.show();

    // 2. Call API
    this.projectService.updateTask(this.selectedTask.id, updatePayload).subscribe({
      next: () => {
        this.loader.hide();
        this.toast.show('Task updated successfully');

        // --- FIX STARTS HERE ---
        
        // A. Manually update the local view object immediately
        if (this.selectedTask) {
          this.selectedTask.title = this.editTaskData.title;
          this.selectedTask.description = this.editTaskData.description;
          this.selectedTask.priority = this.editTaskData.priority;
          this.selectedTask.status = this.editTaskData.status;
          this.selectedTask.dueDate = this.editTaskData.dueDate; 
        }

        // B. Switch back to View Mode
        this.isEditingTask.set(false);

        // C. Refresh the background list (so the card on the dashboard updates too)
        this.loadTasks(this.project()!.id);
        
        // --- FIX ENDS HERE ---
      },
      error: (err) => {
        this.loader.hide();
        this.toast.show('Failed to update task', 'error');
      }
    });
  }

  onDeleteTask() {
    if (!this.selectedTask) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // Bootstrap Danger Red
      cancelButtonColor: '#6c757d',  // Bootstrap Secondary Gray
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      
      if (result.isConfirmed) {
        // --- PROCEED WITH DELETION ---
        this.loader.show();
        
        this.projectService.deleteTask(this.selectedTask!.id).subscribe({
          next: () => {
            this.loader.hide();
            
            // Show a pretty success message
            Swal.fire({
              title: 'Deleted!',
              text: 'The task has been deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });

            // Close modal & Refresh list
            this.taskDetailModalInstance.hide();
            this.loadTasks(this.project()!.id);
          },
          error: (err) => {
            this.loader.hide();
            if (err.status === 403) {
              this.toast.show('Permission denied.', 'error');
            } else {
              this.toast.show('Failed to delete task.', 'error');
            }
          }
        });
      }
    });
  }

  // Member only task status change
  // Helper method
  canMemberUpdateStatus(): boolean {
    const user = this.authService.currentUser();
    if (!user || !this.selectedTask) return false;

    const isAssignedToMe = this.selectedTask.assignedUserId === user.userId;
    const isMember = user.role === 'Member';

    return isMember && isAssignedToMe;
  }

  onMemberStatusChange(event: any) {
    if (!this.selectedTask) return;
    
    const newStatus = event.target.value;
    
    // Optimistic UI Update (Change color immediately)
    const oldStatus = this.selectedTask.status;
    this.selectedTask.status = newStatus; 

    this.projectService.updateTaskStatusMember(this.selectedTask.id, newStatus).subscribe({
      next: () => {
        this.toast.show(`Status updated to ${newStatus}`);
        // Refresh background list to keep dashboard in sync
        this.loadTasks(this.project()!.id);
      },
      error: (err) => {
        // Revert on failure
        this.selectedTask!.status = oldStatus; 
        this.toast.show('Failed to update status', 'error');
      }
    });
  }


  // Remove member from project
  canManageMembers(): boolean {
    const user = this.authService.currentUser();
    const project = this.project();
    if (!user || !project) return false;

    // I can manage if I am Admin OR I created this project
    return user.role === 'Admin' || project.creatorName === user.username; 
    // Note: Better to compare IDs if available (project.creatorId === user.userId)
    // If you don't have creatorId in the frontend model, use the name or add ID to the DTO.
  }

  // 2. ACTION: Remove Member
  onRemoveMember(member: any) {
    const projectId = this.project()?.id;
    if (!projectId) return;

    Swal.fire({
      title: `Remove ${member.firstName}?`,
      text: "They will be removed from the project team.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, remove them'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loader.show();
        
        this.projectService.removeMember(projectId, member.userId).subscribe({
          next: () => {
            this.loader.hide();
            this.toast.show('Member removed successfully.');
            // Reload project to update list
            this.loadProject(projectId);
          },
          error: (err) => {
            this.loader.hide();
            // Show the specific error from backend (Active Tasks warning)
            const msg = err.error || "Failed to remove member.";
            Swal.fire('Cannot Remove', msg, 'error');
          }
        });
      }
    });
  }

  // Tasks filter
  applyFilters() {
    // Always start filtering from the full project list
    let result = this.projectTasks(); 

    const { status, priority, assignedUserId, tag, startDate, endDate } = this.filterConfig;

    // A. Status
    if (status) {
      result = result.filter(t => t.status === status);
    }

    // B. Priority
    if (priority) {
      result = result.filter(t => t.priority === priority);
    }

    // C. Assigned User
    if (assignedUserId) {
      result = result.filter(t => t.assignedUserId === assignedUserId);
    }

    // D. Tags
    if (tag) {
      result = result.filter(t => t.tags && t.tags.includes(tag));
    }

    // E. Date Range
    if (startDate) {
      result = result.filter(t => new Date(t.dueDate) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the full end day
      result = result.filter(t => new Date(t.dueDate) <= end);
    }

    // Update the UI signal
    this.filteredTasks.set(result);
  }

  // 4. RESET FILTERS
  clearFilters() {
    this.filterConfig = {
      status: '',
      priority: '',
      assignedUserId: '',
      tag: '',
      startDate: '',
      endDate: ''
    };
    this.applyFilters(); // Reset list to show all
  }

}