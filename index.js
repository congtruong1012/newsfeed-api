const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const data = require("./db.json");
const app = express();

const { users, posts } = data;

app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser("access_token"));

app.get("/", function (req, res) {
  const { access_token = "" } = req.cookies;
  // console.log(access_token);
  if (!access_token)
    return res.status(401).json({ data: req.cookies, access_token, code: 401 });
  jwt.verify(access_token, "secret", (err, user) => {
    if (err) res.status(401).json({ code: 401, data: null });
    const { id } = user;
    const infoUser = users.find((item) => item.id === id);
    return res
      .status(200)
      .json({ data: { ...infoUser, isLogin: true }, code: 200 });
  });
});

const auth = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ code: 401, data: null });
    }
    jwt.verify(token, "secret", (err, user) => {
      if (err) res.status(401).json({ code: 401, data: null });
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ data: null, code: 500 });
  }
};

app.get("/user", auth, function (req, res) {
  res.status(200).json({
    data: users,
    code: 200,
  });
});

app.get("/user/:id", auth, function (req, res) {
  const { id } = req.params;
  const user = users.find((item) => item.id === id);
  if (!user) {
    return res.status(200).json({
      data: null,
      code: 204,
    });
  }
  const { password, ...rest } = user;
  res.status(200).json({
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
    return res.status(200).json({
      data: null,
      code: 204,
    });
  }
  const payload = { id: user.id };
  const token = jwt.sign(payload, "secret", { expiresIn: 60 * 60 });
  res.cookie("access_token", token, {
    maxAge: 5 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: true,
    // signed: true,
  });
  return res.status(200).json({
    data: { token, isLogin: true },
    code: 200,
  });
});

app.get("/logout", (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({
      data: { isLogin: false },
      code: 200,
    });
});

app.get("/user/:id/post", auth, function (req, res) {
  const { id } = req.params;
  const list = posts.filter((item) => item.pn100 === id);
  res.status(200).json({
    data: list,
    code: 200,
  });
});

app.get("/post/:id", auth, function (req, res) {
  const { id } = req.params;
  const post = posts.find((item) => item.id === id);
  if (!post) {
    return res.status(200).json({
      data: null,
      code: 204,
    });
  }
  if (post.pn100 === req.user.id)
    return res.status(200).json({
      data: post,
      code: 200,
    });
  return res.status(403).json({
    data: null,
    code: 403,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`localhost:${PORT} is running....`);
});
