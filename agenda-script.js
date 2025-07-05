
// Check authentication
if (!localStorage.getItem('grpilates_auth')) {
    window.location.href = 'index.html';
}

// Data storage
let alunas = JSON.parse(localStorage.getItem('grpilates_alunas')) || [];
let agendamentos = JSON.parse(localStorage.getItem('grpilates_agendamentos')) || [];

// Current week
let currentWeek = new Date();

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    generateAgenda();
    updateAlunasGrid()
    populateAlunaSelects();
});

// Logout function
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('grpilates_auth');
        window.location.href = 'index.html';
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    clearForms();
}

function clearForms() {
    document.getElementById('alunaForm').reset();
    document.getElementById('agendamentoForm').reset();
}

// Tab functions
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    // Update content based on tab
    if (tabName === 'agenda') {
        generateAgenda();
    } else if (tabName === 'alunas') {
        updateAlunasGrid();
    }
}

// Dashboard functions
function updateDashboard() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Total alunas
    document.getElementById('totalAlunas').textContent = alunas.length;
    
    // Aulas hoje
    const aulasHoje = agendamentos.filter(ag => ag.data === todayStr).length;
    document.getElementById('aulasHoje').textContent = aulasHoje;
    
    // Próxima aula
    const agendamentosHoje = agendamentos
        .filter(ag => ag.data === todayStr)
        .sort((a, b) => a.hora.localeCompare(b.hora));
    
    const agora = today.getHours() * 100 + today.getMinutes();
    const proximaAula = agendamentosHoje.find(ag => {
        const horaAula = parseInt(ag.hora.replace(':', ''));
        return horaAula > agora;
    });
    
    document.getElementById('proximaAula').textContent = proximaAula ? proximaAula.hora : '--:--';
}

// Aluna functions
document.getElementById('alunaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const novaAluna = {
        id: Date.now(),
        nome: document.getElementById('nomeAluna').value,
        telefone: document.getElementById('telefoneAluna').value,
        email: document.getElementById('emailAluna').value,
        observacoes: document.getElementById('observacoes').value,
        dataCadastro: new Date().toISOString().split('T')[0]
    };
    
    alunas.push(novaAluna);
    localStorage.setItem('grpilates_alunas', JSON.stringify(alunas));
    
    closeModal('alunaModal');
    updateAlunasGrid();
    updateDashboard();
    populateAlunaSelects();
    
    showMessage('Aluna cadastrada com sucesso!', 'success');
});

function updateAlunasGrid() {
    const grid = document.getElementById('alunasGrid');
    grid.innerHTML = '';
    
    alunas.forEach(aluna => {
        const card = document.createElement('div');
        card.className = 'aluna-card';
        card.innerHTML = `
            <div class="aluna-header">
                <div class="aluna-avatar">
                    ${aluna.nome.charAt(0).toUpperCase()}
                </div>
                <div class="aluna-info">
                    <h4>${aluna.nome}</h4>
                    <p>${aluna.telefone}</p>
                </div>
            </div>
            <div class="aluna-stats">
                <div class="stat">
                    <div class="stat-label">Total Aulas</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Este Mês</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Esta Semana</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function searchAlunas() {
    const searchTerm = document.getElementById('searchAlunas').value.toLowerCase();
    const cards = document.querySelectorAll('.aluna-card');
    
    cards.forEach(card => {
        const nome = card.querySelector('h4').textContent.toLowerCase();
        const telefone = card.querySelector('p').textContent.toLowerCase();
        
        if (nome.includes(searchTerm) || telefone.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Agendamento functions
document.getElementById('agendamentoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const novoAgendamento = {
        id: Date.now(),
        alunaId: parseInt(document.getElementById('alunaAgendamento').value),
        data: document.getElementById('dataAgendamento').value,
        hora: document.getElementById('horaAgendamento').value,
        tipo: document.getElementById('tipoAula').value,
        status: 'agendado'
    };
    
    agendamentos.push(novoAgendamento);
    localStorage.setItem('grpilates_agendamentos', JSON.stringify(agendamentos));
    
    closeModal('agendamentoModal');
    generateAgenda();
    updateDashboard();
    
    showMessage('Agendamento criado com sucesso!', 'success');
});

function populateAlunaSelects() {
    const selects = ['alunaAgendamento', 'alunaSelect'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        
        // Clear existing options (except first)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        alunas.forEach(aluna => {
            const option = document.createElement('option');
            option.value = aluna.id;
            option.textContent = aluna.nome;
            select.appendChild(option);
        });
        
        select.value = currentValue;
    });
}

// Agenda functions
function generateAgenda() {
    const grid = document.getElementById('agendaGrid');
    grid.innerHTML = '';
    
    // Get week dates
    const weekDates = getWeekDates(currentWeek);
    updateWeekTitle(weekDates);
    
    // Hours
    const hours = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
                   '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    
    // Days
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    // Create header
    const emptyHeader = document.createElement('div');
    emptyHeader.className = 'time-slot';
    grid.appendChild(emptyHeader);
    
    days.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `${day}<br><small>${weekDates[index].getDate()}/${weekDates[index].getMonth() + 1}</small>`;
        grid.appendChild(dayHeader);
    });
    
    // Create time slots and cells
    hours.forEach(hour => {
        // Time slot
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = hour;
        grid.appendChild(timeSlot);
        
        // Day cells
        weekDates.forEach(date => {
            const cell = document.createElement('div');
            cell.className = 'agenda-cell';
            
            const dateStr = date.toISOString().split('T')[0];
            const agendamento = agendamentos.find(ag => 
                ag.data === dateStr && ag.hora === hour
            );
            
            if (agendamento) {
                const aluna = alunas.find(a => a.id === agendamento.alunaId);
                const item = document.createElement('div');
                item.className = `agenda-item ${agendamento.tipo.toLowerCase()}`;
                item.textContent = aluna ? aluna.nome.split(' ')[0] : 'Aluna';
                item.onclick = () => editAgendamento(agendamento);
                cell.appendChild(item);
            }
            
            grid.appendChild(cell);
        });
    });
}

function getWeekDates(date) {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
    }
    
    return week;
}

function updateWeekTitle(weekDates) {
    const start = weekDates[0];
    const end = weekDates[6];
    const title = `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
    document.getElementById('weekTitle').textContent = title;
}

function previousWeek() {
    currentWeek.setDate(currentWeek.getDate() - 7);
    generateAgenda();
}

function nextWeek() {
    currentWeek.setDate(currentWeek.getDate() + 7);
    generateAgenda();
}

function editAgendamento(agendamento) {
    const aluna = alunas.find(a => a.id === agendamento.alunaId);
    
    document.getElementById('editAgendamentoId').value = agendamento.id;
    document.getElementById('editAlunaName').value = aluna ? aluna.nome : 'Aluna não encontrada';
    document.getElementById('editDataAgendamento').value = agendamento.data;
    document.getElementById('editHoraAgendamento').value = agendamento.hora;
    document.getElementById('editTipoAula').value = agendamento.tipo;
    
    showModal('editAgendamentoModal');
}

document.getElementById('editAgendamentoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editAgendamentoId').value);
    const index = agendamentos.findIndex(ag => ag.id === id);
    
    if (index !== -1) {
        agendamentos[index].data = document.getElementById('editDataAgendamento').value;
        agendamentos[index].hora = document.getElementById('editHoraAgendamento').value;
        agendamentos[index].tipo = document.getElementById('editTipoAula').value;
        
        localStorage.setItem('grpilates_agendamentos', JSON.stringify(agendamentos));
        closeModal('editAgendamentoModal');
        generateAgenda();
        updateDashboard();
        
        showMessage('Agendamento atualizado com sucesso!', 'success');
    }
});

function deleteAgendamento() {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        const id = parseInt(document.getElementById('editAgendamentoId').value);
        agendamentos = agendamentos.filter(ag => ag.id !== id);
        localStorage.setItem('grpilates_agendamentos', JSON.stringify(agendamentos));
        
        closeModal('editAgendamentoModal');
        generateAgenda();
        updateDashboard();
        
        showMessage('Agendamento excluído com sucesso!', 'success');
    }
}


// WhatsApp functions
function enviarLembrete() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const agendamentosTomorrow = agendamentos.filter(ag => ag.data === tomorrowStr);
    
    if (agendamentosTomorrow.length === 0) {
        alert('Não há aulas agendadas para amanhã.');
        return;
    }
    
    agendamentosTomorrow.forEach(agendamento => {
        const aluna = alunas.find(a => a.id === agendamento.alunaId);
        if (aluna) {
            const telefone = aluna.telefone.replace(/\D/g, '');
            const data = new Date(agendamento.data).toLocaleDateString('pt-BR');
            const mensagem = `Olá ${aluna.nome}! Lembrete: você tem aula de Pilates agendada para ${data} às ${agendamento.hora}. Nos vemos lá! 😊 - GR Pilates e Fisioterapia`;
            
            const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
            window.open(url, '_blank');
        }
    });
}

// Utility functions
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Set minimum date for agendamentos
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataAgendamento').min = today;
    document.getElementById('editDataAgendamento').min = today;
});
