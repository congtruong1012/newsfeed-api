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

app.get("/user", function (req, res) {
  res.json({
    data: users,
    code: 200,
  });
});

app.get("/user/:id", function (req, res) {
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
    { expiresIn: 60 * 5 }
  );
  return res.json({
    data: { id, ...rest, token },
    code: 200,
  });
});

app.get("/user/:id/post", function (req, res) {
  const { id } = req.params;
  const list = posts.filter((item) => item.pn100 === id);
  res.json({
    data: list,
    code: 200,
  });
});

app.get("/post/:id", function (req, res) {
  const { id } = req.params;
  const post = posts.find((item) => item.id === id);
  if (!post) {
    return res.json({
      data: null,
      code: 204,
    });
  }
  res.json({
    data: post,
    code: 200,
  });
});

const PORT = process.env.PORT || 3000

app.listen(3000, () => {
  console.log("localhost is running");
});
