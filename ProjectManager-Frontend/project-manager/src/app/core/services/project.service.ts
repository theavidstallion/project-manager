import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants/constants';
import { Project, CreateProjectRequest, EditProjectRequest } from '../models/project.models';
import { TaskResponse, CreateTaskRequest } from '../models/task.models';
import { UserResponse } from '../models/user.models';
import { TagResponse } from '../models/tags.models';
import { CommentResponse } from '../models/task.models';



@Injectable({
    providedIn: 'root'
})

export class ProjectService {
    private http = inject(HttpClient);
    apiUrl = API_URL;

    getAllProjects(){
        return this.http.get<Project[]>(`${this.apiUrl}/project`);
    }

    // Add this method inside your ProjectService class
    getProject(id: number) {
        return this.http.get<Project>(`${this.apiUrl}/project/${id}`);
    }

    createProject(project: CreateProjectRequest) {
        return this.http.post(`${this.apiUrl}/Project`, project);
    }
    
    addMember(projectId: number, user: UserResponse) {
    
    // Construct the full DTO that C# expects
    const payload = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

        return this.http.post(`${this.apiUrl}/Project/${projectId}/add-member`, payload);
    }

    getTasks() {
        return this.http.get<TaskResponse[]>(`${this.apiUrl}/Task`);
    }

    updateProject(id: number, data: EditProjectRequest) {
        return this.http.put(`${this.apiUrl}/Project/${id}`, data);
    }

    // Add this method inside your ProjectService
    deleteProject(id: number) {
        return this.http.delete(`${this.apiUrl}/Project/${id}`);
    }

    createTask(task: CreateTaskRequest) {
        return this.http.post(`${this.apiUrl}/Task`, task);
    }

    getAllTags() {
        return this.http.get<TagResponse[]>(`${this.apiUrl}/Tag`);
    }

    // 1. Get Comments
    getComments(taskId: number) {
        return this.http.get<CommentResponse[]>(`${this.apiUrl}/task/${taskId}/Comments`);
    }

    // 2. Add Comment
    addComment(taskId: number, content: string) {
        return this.http.post(`${this.apiUrl}/task/${taskId}/Comments`, { content });
    }

    // 3. Delete Comment
    // Note: Even though 'id' is unique, your backend route requires 'taskId' in the URL
    deleteComment(taskId: number, commentId: number) {
        return this.http.delete(`${this.apiUrl}/task/${taskId}/Comments/${commentId}`);
    }

    updateTask(taskId: number, data: any) {
        return this.http.put(`${this.apiUrl}/Task/${taskId}`, data);
    }

    getTaskById(id: number) { 
        return this.http.get<TaskResponse>(`${this.apiUrl}/Task/{id}`); 
    }

    deleteTask(taskId: number) {
        return this.http.delete(`${this.apiUrl}/Task/${taskId}`);
    }

    updateTaskStatusMember (taskId: number, newStatus: string) {
        const payload = { newStatus: newStatus };
        return this.http.put(`${this.apiUrl}/Task/${taskId}/member/status`, payload);
    }

    removeMember(projectId: number, userId: string) {
        return this.http.delete(`${this.apiUrl}/Project/${projectId}/members/${userId}`);
    }
}