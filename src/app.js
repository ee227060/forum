"use strict";
const cookieParser = require("cookie-parser");
const express = require("express");
const nunjucks = require("nunjucks");
const session = require("express-session");
const passport = require("passport");
const { Post, User, setupDatabase } = require("./model");
const { setupPassport, controller } = require("./controller");
// Cookieの有効期間
const COOKIE_MAX_AGE = 30 * 1000;
// Cookieの基本オプション
const COOKIE_BASE_OPTIONS = {
  httpOnly: true, // JavaScriptからアクセス不可
  path: "/", // パス
  secure: false, // HTTPでも使用可
};
// ポート番号
const PORT = 3000;
// おまじない
const SESSION_SECRET = "foo";
// Nunjucksを設定します。
function setupNunjucks(app) {
  const env = nunjucks.configure("views", {
    autoescape: true, // 自動でエスケープ
    express: app, // Expressインスタンス
  });
  // createdAtの整形方法を定義
  env.addFilter("formatDate", (value) => {
    const date = value.toISOString();
    return date.slice(0, 10).replaceAll("-", "/") + " " + date.slice(11.16);
  });
}
// Expressを設定します。
async function setupExpress() {
  const app = express(); // Expressインスタンスの生成
  app.use(cookieParser()); // Cookieを使用可能に
  app.use(express.static("src/public", { index: false })); // publicデ
  app.use(express.urlencoded({ extended: true })); // formからのリクエ
  app.use(passport.initialize()); // passportの初期化
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        ...COOKIE_BASE_OPTIONS,
        maxAge: COOKIE_MAX_AGE,
      },
    }),
  );
  app.use(passport.session()); // passportでsessionを使用
  // GET /
  app.get("/", controller.get);
  // GET /sign-up
  app.get("/sign-up", controller.getSignUp);
  // POST /sign-up
  app.post("/sign-up", controller.postSignUp);
  // GET /sign-in
  app.get("/sign-in", controller.getSignIn);
  // POST /sign-in
  app.post("/sign-in", controller.postSignIn);
  // POST /sign-out
  app.post("/sign-out", controller.postSignOut);
  // GET /posts
  app.get("/posts", controller.getPosts);
  // POST /posts
  app.post("/posts", controller.postPosts);
  // Expressのインスタンスを返す
  return app;
}
// main関数
async function main() {
  // データベースを初期化してモデルを取得
  await setupDatabase(Post, User);
  await setupPassport(User);
  // Expressを取得してインスタンスを取得
  const app = await setupExpress();
  setupNunjucks(app);
  // リスン開始
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
}
// main関数を起動
main().catch(console.error);
