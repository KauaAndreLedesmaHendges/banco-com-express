// Classes para gerenciamento de estado
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentUser = null;
    }

    setUser(user) {
        this.currentUser = user;
        this.updateUI();
    }

    async fetchTasks() {
        try {
            const response = await fetch('/tasks');
            this.tasks = await response.json();
            this.renderTasks();
        } catch (error) {
            this.showError('Erro ao carregar tarefas');
        }
    }

    async addTask(taskData) {
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            if (response.ok) {
                await this.fetchTasks();
                return true;
            }
            return false;
        } catch (error) {
            this.showError('Erro ao adicionar tarefa');
            return false;
        }
    }

    async toggleTask(id) {
        try {
            const response = await fetch(`/tasks/${id}/toggle`, { method: 'PUT' });
            if (response.ok) {
                await this.fetchTasks();
            }
        } catch (error) {
            this.showError('Erro ao atualizar tarefa');
        }
    }

    async deleteTask(id) {
        try {
            const response = await fetch(`/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await this.fetchTasks();
            }
        } catch (error) {
            this.showError('Erro ao excluir tarefa');
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item priority-${task.prioridade} ${task.feita ? 'done' : ''}`;
        
        const date = new Date(task.prazo).toLocaleDateString();
        const priorityText = this.getPriorityText(task.prioridade);

        div.innerHTML = `
            <h3>${this.escapeHtml(task.titulo)}</h3>
            <p>${this.escapeHtml(task.descricao)}</p>
            <p>Prazo: ${date}</p>
            <p>Prioridade: ${priorityText}</p>
            <div class="task-actions">
                <button onclick="taskManager.toggleTask(${task.id})" class="toggle-btn">
                    ${task.feita ? 'Desfazer' : 'Concluir'}
                </button>
                <button onclick="taskManager.confirmDelete(${task.id})" class="delete-btn">
                    Excluir
                </button>
            </div>
        `;
        return div;
    }

    getPriorityText(priority) {
        const priorities = {
            1: 'Alta',
            2: 'Média',
            3: 'Baixa'
        };
        return priorities[priority] || 'Não definida';
    }

    confirmDelete(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.deleteTask(id);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    updateUI() {
        const authForm = document.getElementById('authForm');
        const taskArea = document.getElementById('taskArea');
        
        if (this.currentUser) {
            authForm.style.display = 'none';
            taskArea.style.display = 'block';
            this.fetchTasks();
        } else {
            authForm.style.display = 'block';
            taskArea.style.display = 'none';
        }
    }
}

// Instância global
const taskManager = new TaskManager();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('userForm');
    const taskForm = document.getElementById('taskForm');

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(authForm);
        const userData = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            senha: formData.get('senha')
        };

        try {
            const response = await fetch('/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            
            if (data.user) {
                taskManager.setUser(data.user);
                authForm.reset();
            } else {
                taskManager.showError(data.error || 'Erro na autenticação');
            }
        } catch (error) {
            taskManager.showError('Erro ao conectar ao servidor');
        }
    });

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(taskForm);
        const taskData = {
            titulo: formData.get('titulo'),
            descricao: formData.get('descricao'),
            prioridade: formData.get('prioridade'),
            prazo: formData.get('prazo')
        };

        if (await taskManager.addTask(taskData)) {
            taskForm.reset();
        }
    });
});