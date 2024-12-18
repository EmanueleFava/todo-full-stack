document.addEventListener("DOMContentLoaded", ()=>{
    const userLogged = JSON.parse(localStorage.getItem("userLogged"));
    if (!userLogged) {
        renderForm();
    } else {
        renderTodo();
    }
});


async function loadTodos() {
    const token = localStorage.getItem('token');
    const userLogged = JSON.parse(localStorage.getItem("userLogged"));
    const userId = userLogged.user.id;

    if (!token) {
        alert('You need to log in first!');
        return;
    }

    const response = await fetch(`http://localhost:3000/todos/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        alert('Failed to load todos');
        return;
    }

    const todos = await response.json();
    const todoListElement = document.getElementById('todoList');
    todoListElement.innerHTML = '';

    if (todos.length === 0) {
        const message = document.createElement('li');
        message.textContent = 'We, No todos available';
        todoListElement.appendChild(message);
    } else {
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.title;

            // Creazione del bottone per eliminare il todo
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            // deleteButton.style.marginLeft = 'auto';
            deleteButton.style.float = 'right';
            deleteButton.style.marginTop = '-8px';

            // Gestore del click per eliminare il todo
            deleteButton.addEventListener('click', async () => {
                console.log(`Attempting to delete todo with idTodo: ${todo.id}, userId: ${userId}`);
            
                const deleteResponse = await fetch(`http://localhost:3000/todos/${userId}/${todo.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            
                if (deleteResponse.ok) {
                    alert('Todo deleted successfully');
                    loadTodos(); // Ricarica la lista dopo l'eliminazione
                } else {
                    const errorData = await deleteResponse.json();
                    console.error('Failed to delete todo:', errorData);
                    alert(`Failed to delete todo: ${errorData.error || deleteResponse.statusText}`);
                }
            });

            li.appendChild(deleteButton);
            todoListElement.appendChild(li);
        });
    }
}


function renderForm(){
    const body = document.querySelector("body");
    body.innerHTML = `<div id="auth">
    <h2>Register</h2>
    <form id="registerForm">
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Register</button>
    </form>
    <h2>Login</h2>
    <form id="loginForm">
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
    </form>
    </div>`;

    
    document.getElementById('registerForm').onsubmit = async (e) => {
        e.preventDefault();
        const username = e.target[0].value;
        const password = e.target[1].value;

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Registration successful!');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    };

    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const username = e.target[0].value;
        const password = e.target[1].value;
    
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        if (response.ok) {
            const data = await response.json();
            alert("Login accepted");
            // console.log(`token: ${data.token}`);
            // console.log(data);
            localStorage.setItem('token', data.token);
            const dataString = JSON.stringify(data)
            localStorage.setItem('userLogged', dataString);
            renderTodo();
            loadTodos();
        } else alert('Login failed!');
    };
}

function renderTodo(){
    const userLogged = JSON.parse(localStorage.getItem("userLogged"));
    const username = userLogged.user.username;
    loadTodos();
    const body = document.querySelector("body");
    body.innerHTML = `<div id="todoSection">
    <h2>${username} todo's</h2>
    <form id="todoForm">
        <input type="text" placeholder="New Todo" required />
        <button type="submit">Add Todo</button>
    </form>
    <ul id="todoList"></ul>
    <button id="logoutButton">Logout</button> <!-- Bottone Logout -->
    </div>`;

    // Logout button functionality
    document.getElementById('logoutButton').onclick = () => {
        localStorage.removeItem('token'); // Rimuove il token
        localStorage.removeItem('userLogged'); // Rimuove l'utente loggato
        alert('You have logged out!');
        renderForm(); // Torna al form di login/registrazione
    };
    
    document.getElementById('todoForm').onsubmit = async (e) => {
        e.preventDefault();
        const title = e.target[0].value;
        const token = localStorage.getItem('token');
        const userLogged = JSON.parse(localStorage.getItem("userLogged"));
        const userId = userLogged.user.id;
        console.log(token);

        await fetch('http://localhost:3000/todos', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` ,
            },
            body: JSON.stringify({ title, userId }),
        });

        loadTodos();
    };

}




