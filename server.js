const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const jwt = require('jsonwebtoken');
const queryString = require('query-string');
require('dotenv').config();
server.use(jsonServer.bodyParser);

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === '' || password === '')
    return res.status(400).json({ data: null, error: 'Bad Request' });
  if (username !== 'congtruong' || password !== '4297f44b13955235245b2497399d7a93') {
    return res.status(401).json({ data: null, error: 'Unauthorized' });
  }
  console.log('process.env.SECRET', process.env.SECRET);
  const payload = { id: username };
  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: 60 * 60 });
  console.log({ data: token, error: '' });
  return res.jsonp({ data: token, error: '' });
});

server.use((req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') next();
  const authorization = req.headers['authorization'];
  if (!authorization) return res.status(401).json({ data: null, error: 'Unauthorized' });
  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(403).json({ data: null, error: 'Forbidden' });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    if (decoded) next();
  } catch (err) {
    return res.status(401).send({ data: null, error: 'Invalid Token' });
  }
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
    req.body.updateAt = Date.now();
  }
  if (['PATCH', 'PUT'].includes(req.method)) req.body.updateAt = Date.now();
  // Continue to JSON Server router
  next();
});

router.render = (req, res) => {
  const headers = res.getHeaders();
  const _totalRow = headers['x-total-count'];
  if (req.method === 'GET' && _totalRow > 0) {
    const { _limit, _page } = queryString.parse(req._parsedUrl.query);
    console.log(+_totalRow, req.query);
    return res.jsonp({
      data: res.locals.data,
      pagination: {
        _page: +_page,
        _totalPage: +_totalRow / +_limit,
      },
    });
  }
  return res.jsonp({ data: res.locals.data });
};

const PORT = process.env.PORT || 5000;

// Use default router
server.use(router);
server.listen(PORT, () => {
  console.log('JSON Server is running');
});
