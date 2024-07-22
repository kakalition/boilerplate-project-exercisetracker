const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded())

const userMap = new Map();
const userLogMap = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  const result = Array.from(userMap.values())
  res.json(result)
});

app.post('/api/users', (req, res) => {
  const username = req.body['username']
  const _id = Date.now();

  const user = {
    username: username,
    _id: _id.toString(),
  }

  userMap.set(`${_id}`, user);

  res.json(user)
});

app.post('/api/users/:id/exercises', (req, res) => {
  const _id = req.params['id']
  const description = req.body['description']
  const duration = parseInt(req.body['duration'])
  const date = new Date(req.body['date'] ? Date.parse(req.body['date']) : Date.now()).toDateString()

  const log = {
    description: description,
    duration: duration,
    date: date,
  }

  const logs = userLogMap.get(`${_id}`) ?? [];
  logs.push(log);

  userLogMap.set(`${_id}`, logs);

  const output = {
    username: userMap.get(`${_id}`).username,
    ...log,
    _id: _id
  }

  res.json(output)
});

app.get('/api/users/:id/logs', (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  console.log(req.query)

  const id = req.params['id'];

  const user = userMap.get(`${id}`)

  let logs = userLogMap.get(`${id}`)
  if (from) {
    logs = logs.filter((e) => Date.parse(e.date) >= Date.parse(from));
  }

  if (to) {
    logs = logs.filter((e) => Date.parse(e.date) <= Date.parse(to));
  }

  if (limit) {
    logs = logs.slice(0, limit);
  }

  user.count = logs.length;
  user.log = logs;

  console.log(user)

  res.json(user);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
