const express = require('express');
var morgan = require('morgan')

const app = express();

app.use(express.static('dist'))
app.use(express.json());
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    req.body ? JSON.stringify(req.body) : '',
  ].join(' ')
}));

const persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
];

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const person = persons.find(p => p.id === id);
    if (person) {
        res.json(person);
    } else {
        res.status(404).send('Person not found');
    }
});

app.get('/api/info', (req, res) => {
    const info = `Phonebook has info for ${persons.length} people`;
    const date = new Date();
    res.send(`${info}<br><br>${date}`);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = persons.findIndex(p => p.id === id);
    if (index !== -1) {
        persons.splice(index, 1);
        res.status(204).end();
    } else {
        res.status(404).send('Person not found');
    }
});

app.post('/api/persons', (req, res) => {
    const {name, number} = req.body;
    if (!name || !number) {
        return res.status(400).send({'error': 'name and number are required'});
    }
    if (persons.some(p => p.name === name)) {
        return res.status(400).send({'error': 'name must be unique'});
    }
    const id = Math.floor(Math.random() * 999999);
    const newPerson = { id, name, number };
    persons.push(newPerson);
    res.status(201).json(newPerson);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})