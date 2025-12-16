export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: string; // 'To Do', 'In Progress', 'Done'
  priority: string; // 'Low', 'Medium', 'High'
  dueDate: string;
  projectId: number;
  projectName: string;
  assignedUserId: string;
  assignedUserName: string;
  creatorId: string;
  tags: string[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Done';
  projectId: number;
  assignedUserId: string;
  tagIds: number[];
}

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  taskId: number;
}