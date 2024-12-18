const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./db');
const User = require('./models/User');
const Todo = require('./models/Todo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

app.use(cors()); // Abilita CORS per tutte le origini

app.use(express.json());


app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await User.create({ username, password: hashedPassword });
        res.status(201).json(user);
    } catch (error) {
        console.error(error); // Stampa l'errore nel terminale
        res.status(400).json({ error: 'User already exists or invalid input' });
    }
});

// User Login
app.post('/login', async (req, res) => {

    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username },  process.env.SECRET_KEY, { expiresIn: '1h' }); // Use a secure key in production
        res.json({ user, token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Estrae il token dall'header

    if (!token) {
        return res.status(401).json({ message: 'Accesso negato. Token mancante!' });
    }

    try {
        // Verifica il token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Aggiunge i dati decodificati alla richiesta
        next(); // Passa al prossimo middleware o alla rotta
    } catch (err) {
        res.status(403).json({ message: 'Token non valido!' });
    }
};


// CRUD operations for Todos
app.post('/todos', authenticateToken, async (req, res) => {
    const { title } = req.body;
    const { userId } = req.body;
    
    try {
        const todo = await Todo.create({ title, userId });
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ error });
    }
});

app.get('/todos/:id', authenticateToken, async (req, res) => {
    try {
        const todos = await Todo.findAll({ where: { userId: req.params.id } }); // Aggiunto .id
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/todos/:id/:idTodo', authenticateToken, async (req, res) => {
    try {
        const { id, idTodo } = req.params;
        const result = await Todo.destroy({
            where: { id: idTodo, userId: id }
        });

        if (result === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Sync database and start server
sequelize.sync().then(() => {
    app.listen(3000, () => console.log('Server running on port 3000'));
});
