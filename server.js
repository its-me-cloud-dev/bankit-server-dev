const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const accountRouter = require("./routes/account");
const invitationRouter = require("./routes/invitation");
const transactionRouter = require("./routes/transaction");
const groupaccountRouter = require("./routes/group-account");
const profileRouter = require("./routes/profile"); // 추가된 라우트
const setupDB = require("./db_setup");
const session = require("express-session");
const authMiddleware = require("./middlewares/auth"); // auth middleware 추가

const path = require("path");
const cors = require("cors");

const http = require("http");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 5400000,
      secure: false,
    },
  })
);
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

// DB 초기화 완료 후 서버 가동
setupDB()
  .then(({ mysqldb, saltDB }) => {
    app.set("mysqldb", mysqldb);
    app.set("saltDB", saltDB);
    app.use("/signup", signupRouter); // destroySession middleware 적용
    app.use("/login", loginRouter); // destroySession middleware 적용
    app.use("/account", authMiddleware, accountRouter); // authMiddleware 적용
    app.use("/invitation", authMiddleware, invitationRouter); // authMiddleware 적용
    app.use("/group-account", authMiddleware, groupaccountRouter); // authMiddleware 적용
    app.use("/transaction", authMiddleware, transactionRouter); // authMiddleware 적용
    app.use("/profile", authMiddleware, profileRouter); // authMiddleware 적용
    http.createServer(app).listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to setup database connection:", err);
  });
