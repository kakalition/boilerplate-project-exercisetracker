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
  console.log('user', userMap.values);
  res.json(userMap.values)
});

app.post('/api/users', (req, res) => {
  const username = req.body['username']
  const _id = Date.now();

  const user = {
    username: username,
    _id: _id,
  }

  userMap.set(`${_id}`, user);

  res.json(user)
});

app.post('/api/users/:id/exercises', (req, res) => {
  const _id = req.params['id']
  const description = req.body['description']
  const duration = parseInt(req.body['duration'])
  const date = req.body['date'] ?? (new Date).toDateString()

  const log = {
    description: description,
    duration: duration,
    date: date,
  }

  const logs = userLogMap.get(`${_id}`) ?? [];
  logs.push(log);

  userLogMap.set(`${_id}`, logs);

  log._id = _id;
  log.username = userMap.get(`${_id}`).username;

  res.json(log)
});

app.get('/api/users/:id/logs', (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  const id = req.params['id'];

  const user = userMap.get(`${id}`)

  let logs = userLogMap.get(`${id}`)
  if (from) {
    logs = logs.filter((e) => e.date >= from);
  }

  if (to) {
    logs = logs.filter((e) => e.date <= to);
  }

  if (limit) {
    logs = logs.slice(0, limit);
  }

  user.count = logs.length;
  user.log = logs;

  res.json(user);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
