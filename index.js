const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const data = require("./db.json");
const app = express();

const { users, posts } = data;

app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("Hello World");
});

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.json({ code: 401, data: null });
    }
    jwt.verify(token, "secret", (err, user) => {
      if (err) res.json({ code: 401, data: null });
      req.user = user;
      next();
    });
  } catch (err) {
    res.json({ data: null, code: 500 });
  }
};

app.get("/user", auth, function (req, res) {
  res.json({
    data: users,
    code: 200,
  });
});

app.get("/user/:id", auth, function (req, res) {
  const { id } = req.params;
  const user = users.find((item) => item.id === id);
  if (!user) {
    return res.json({
      data: null,
      code: 204,
    });
  }
  const { password, ...rest } = user;
  res.json({
    data: { ...rest },
    code: 200,
  });
});

app.post("/login", function (req, res) {
  const { username, password } = req.body;
  const user = users.find(
    (item) => item.username === username && item.password === password
  );
  if (!user) {
    return res.json({
      data: null,
      code: 204,
    });
  }
  const { id, password: pass, ...rest } = user;
  const token = jwt.sign(
    {
      id,
    },
    "secret",
    { expiresIn: 60 * 60 }
  );
  return res.json({
    data: { id, ...rest, token },
    code: 200,
  });
});

app.get("/user/:id/post", auth, function (req, res) {
  const { id } = req.params;
  const list = posts.filter((item) => item.pn100 === id);
  res.json({
    data: list,
    code: 200,
  });
});

app.get("/post/:id", auth, function (req, res) {
  const { id } = req.params;
  const post = posts.find((item) => item.id === id);
  if (!post) {
    return res.json({
      data: null,
      code: 204,
    });
  }
  if (post.pn100 === req.user.id)
    return res.json({
      data: post,
      code: 200,
    });
  return res.json({
    data: null,
    code: 403,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`localhost:${PORT} is running....`);
});
