class usersManager {
    constructor() {
        this.users = [];
    }
    async fetchUsers() {
        try {
            const response = await fetch('/users');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.users = await response.json();
            console.log('✓ Usuários carregados:', this.users);
        } catch (error) {
            console.error('✗ Erro ao carregar usuários:', error);
        }
    }

    async addusers(userData) {
        try {
            console.log('→ Enviando usuário:', userData);
            const response = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao adicionar');
            }
            const newUser = await response.json();
            console.log('✓ Usuário criado:', newUser);
            await this.fetchUsers();
            return true;
        } catch (error) {
            console.error('✗ Erro ao adicionar usuário:', error);
            return false;
        }
    }
}
//testes na area abaixo


//testes na area acima
class TaskManager {
    constructor() {
        this.tasks = [];
    }

    async fetchTasks() {
        try {
            const response = await fetch('/tasks');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.tasks = await response.json();
            console.log('✓ Tarefas carregadas:', this.tasks); // Verifique se o ID está presente
            this.renderTasks();
        } catch (error) {
            console.error('✗ Erro ao carregar tarefas:', error);
            this.showError('Erro ao carregar tarefas');
        }
    }

    async addTask(taskData) {
        try {
            // Adicionando user_id ao taskData
            const userId = 1; // Usuário padrão
            const dataToSend = { ...taskData, user_id: userId };

            console.log('→ Enviando tarefa:', dataToSend);
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao adicionar');
            }
            
            const newTask = await response.json();
            console.log('✓ Tarefa criada:', newTask);
            await this.fetchTasks();
            return true;
        } catch (error) {
            console.error('✗ Erro ao adicionar tarefa:', error);
            this.showError('Erro: ' + error.message);
            return false;
        }
    }

    async toggleTask(id) {
        if (!id) {
            console.error('✗ ID da tarefa não é válido');
            this.showError('ID da tarefa não é válido');
            return;
        }

        try {
            console.log(`→ Toggling task with ID: ${id}`);
            const response = await fetch(`/tasks/${id}/toggle`, { method: 'PUT' });
            if (response.ok) {
                console.log('✓ Tarefa atualizada com sucesso');
                await this.fetchTasks();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao atualizar tarefa');
            }
        } catch (error) {
            console.error('✗ Erro ao atualizar tarefa:', error);
            this.showError('Erro ao atualizar tarefa');
        }
    }

    async deleteTask(id) {
        if (!id) {
            console.error('✗ ID da tarefa não é válido');
            this.showError('ID da tarefa não é válido');
            return;
        }

        try {
            console.log(`→ Deletando task with ID: ${id}`);
            const response = await fetch(`/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) {
                console.log('✓ Tarefa deletada com sucesso');
                await this.fetchTasks();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao deletar tarefa');
            }
        } catch (error) {
            console.error('✗ Erro ao excluir tarefa:', error);
            this.showError('Erro ao excluir tarefa');
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        if (!this.tasks || this.tasks.length === 0) {
            taskList.innerHTML = '<p class="empty-message">Nenhuma tarefa. Adicione uma acima!</p>';
            return;
        }

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        console.log('Criando elemento para a tarefa com ID:', task.id); // Adicione este log
        const div = document.createElement('div');
        div.className = `task-item priority-${task.prioridade} ${task.feita ? 'done' : ''}`;
        
        const date = task.prazo ? new Date(task.prazo).toLocaleDateString('pt-BR') : 'Sem prazo';
        const priorityText = this.getPriorityText(task.prioridade);

        div.innerHTML = `
            <h3>${this.escapeHtml(task.titulo)}</h3>
            <p>${this.escapeHtml(task.descricao || 'Sem descrição')}</p>
            <p><strong>Prazo:</strong> ${date}</p>
            <p><strong>Prioridade:</strong> ${priorityText}</p>
            <p><strong>Status:</strong> ${task.feita ? '✓ Concluída' : '⏳ Pendente'}</p>
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
        const priorities = { 1: 'Alta', 2: 'Média', 3: 'Baixa' };
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
        setTimeout(() => errorDiv.remove(), 4000);
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

const taskManager = new TaskManager();

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    
    taskManager.fetchTasks();

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('titulo').value;
        const descricao = document.getElementById('descricao').value;
        const prioridade = document.getElementById('prioridade').value;
        const prazo = document.getElementById('prazo').value;

        const taskData = { titulo, descricao, prioridade, prazo };

        if (await taskManager.addTask(taskData)) {
            taskForm.reset();
        }
    });
});



