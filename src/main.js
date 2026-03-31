// [LOG: 20260331_1645] - Use Environment Variable for API URL
const API_URL = import.meta.env.VITE_API_URL
//  || 'http://localhost:5000/todos';
// DOM Elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const clearAllBtn = document.getElementById('clear-all-btn');

// State
let todos = [];

// [LOG: 20260331_1440] - Initialize App
async function init() {
    console.log('초기화 시작...');
    await fetchTodos();
    setupEventListeners();
}

// [LOG: 20260331_1440] - Fetch Todos from Backend
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('서버 데이터를 가져오는데 실패했습니다.');
        todos = await response.json();
        render();
    } catch (err) {
        console.error('실패:', err.message);
        alert('데이터를 가져오지 못했습니다. 백엔드가 실행 중인지 확인하세요.');
    }
}

// [LOG: 20260331_1440] - Add a new Todo
async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(), // Number 타입
        text: text,
        isComplete: false
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTodo)
        });

        if (!response.ok) throw new Error('추가에 실패했습니다.');

        todoInput.value = '';
        await fetchTodos();
    } catch (err) {
        console.error('실패:', err.message);
    }
}

// [LOG: 20260331_1441] - Delete a Todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('삭제에 실패했습니다.');
        await fetchTodos();
    } catch (err) {
        console.error('실패:', err.message);
    }
}

// [LOG: 20260331_1441] - Update a Todo (Toggle or edit text)
async function updateTodo(id, updates) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH', // 프로젝트 백엔드 라우터에서 PATCH 사용 중
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('수정에 실패했습니다.');
        await fetchTodos();
    } catch (err) {
        console.error('실패:', err.message);
    }
}

// [LOG: 20260331_1441] - Clear all Todos
async function clearAll() {
    if (!confirm('정말 모든 할일을 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('전체 삭제에 실패했습니다.');
        await fetchTodos();
    } catch (err) {
        console.error('실패:', err.message);
    }
}

// [LOG: 20260331_1442] - Render DOM
function render() {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = todo.id;

        li.innerHTML = `
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <button class="action-btn edit">수정</button>
                <button class="action-btn delete">삭제</button>
            </div>
        `;

        // Delete button event
        li.querySelector('.delete').addEventListener('click', () => deleteTodo(todo.id));

        // Edit button event
        li.querySelector('.edit').addEventListener('click', () => enterEditMode(li, todo));

        todoList.appendChild(li);
    });

    todoCount.textContent = `${todos.length} tasks remaining`;
}

// [LOG: 20260331_1442] - Enter Edit Mode
function enterEditMode(li, todo) {
    if (li.classList.contains('editing')) return;

    li.classList.add('editing');
    const textSpan = li.querySelector('.todo-text');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = todo.text;

    li.insertBefore(input, li.firstChild);
    input.focus();

    // Handle saving
    const saveEdit = async () => {
        const newText = input.value.trim();
        if (newText && newText !== todo.text) {
            await updateTodo(todo.id, { text: newText });
        } else {
            li.classList.remove('editing');
            input.remove();
        }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
    });
}

// [LOG: 20260331_1443] - Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    clearAllBtn.addEventListener('click', clearAll);
}

// Start
init();
