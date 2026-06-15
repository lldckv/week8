import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
  if (req.path.length > 1 && !req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    return res.redirect(308, req.path + '/' + query);
  }
  next();
});

const userSchema = new mongoose.Schema({
  login: String,
  password: String
});

app.post('/insert/', async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  const url = req.body.URL || req.body.url;

  if (!url) {
  return res.status(400).send('URL parameter is required');
  }

  let connection;
  try {
    connection = mongoose.createConnection(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await connection.asPromise();

    const User = connection.model('users', userSchema, 'users');
    await User.create({ login, password });

    res.type('text/plain').send('OK');
  } catch (e) {
    res.status(500).type('text/plain').send(String(e));
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.listen(process.env.PORT);