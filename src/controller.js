"use strict";
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { Post, User } = require("./model");
// おまじない
const SALT_ROUNDS = 10;
// Passportを設定します。
async function setupPassport(User) {
  // ユーザの認証
  passport.use(
    new LocalStrategy(
      {
        usernameField: "userName",
        passwordField: "password",
      },
      async (username, password, done) => {
        // ユーザが存在するか探す（ユーザ名は一意）
        const user = await User.findOne({ where: { username: username } });
        if (user === null) {
          // ユーザが存在しなかった
          return done(null, false);
        }
        // 入力されたパスワードが本来のパスワードと同じか
        const passwordMatched = await bcrypt.compare(password, user.password);
        if (passwordMatched !== true) {
          // パスワード不一致
          return done(null, false);
        }
        return done(null, user);
      },
    ),
  );
  // ユーザidをセッションに保存
  passport.serializeUser((user, cb) => {
    process.nextTick(() => {
      return cb(null, user.id);
    });
  });
  // セッションからユーザ情報を復元
  passport.deserializeUser(async (id, cb) => {
    const user = await User.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
    });
    return cb(null, user);
  });
}
const controller = {
  // GET /
  async get(req, res) {
    if (req.isAuthenticated() === true) {
      // 認証済みであればすべての投稿を取得（新しい方から順）
      const result = await Post.findAll({
        include: {
          model: User,
          attributes: ["username"],
        },
        order: [["createdAt", "DESC"]],
      });
      // 投稿内容をJSONで送信可能な形式に変換
      const posts = result.map((e) => e.get({ plain: true }));
      // 認証済みであればトップページを表示
      res.render("index.njk", { posts });
    } else {
      // そうでなければサインインページへ遷移
      res.redirect("/sign-in");
    }
  },
  // GET /sign-up
  getSignUp(req, res) {
    // サインアップページを表示
    res.render("sign_up.njk");
  },
  // POST /sign-up
  async postSignUp(req, res) {
    const userName = req.body.userName; // ユーザ名
    const password = req.body.password; // パスワード
    if (password !== req.body.passwordAgain) {
      // 確認用パスワードと違
      // サインアップページへ遷移
      res.redirect("/sign-up");
      return;
    }
    // パスワードをハッシュ化する
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    // 新規ユーザの作成
    try {
      await User.create({
        username: userName, // ユーザ名
        password: hashedPassword, // ハッシュ化したパスワード
      });
    } catch (error) {
      // 作成できなかった
      console.error(`error: ${error}`);
      // サインアップページへ遷移
      res.redirect("/sign-up");
      return;
    }
    // サインインページへ遷移
    res.redirect("/sign-in");
  },
  // GET /sign-in
  getSignIn(req, res) {
    // サインインページを表示
    res.render("sign_in.njk");
  },
  // POST /sign-in
  postSignIn(req, res) {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "sign-in",
    })(req, res);
  },
  // POST /sign-out
  postSignOut(req, res) {
    req.logout(() => {
      res.redirect("/sign-in");
    });
  },
  // GET /posts
  async getPosts(req, res) {
    if (req.isAuthenticated() === true) {
      // 認証済みであればすべての投稿を取得（新しい方から順）
      const result = await Post.findAll({
        include: {
          model: User,
          attributes: ["username"],
        },
        order: [["createdAt", "DESC"]],
      });
      // 投稿内容をJSONで送信可能な形式に変換
      const posts = result.map((e) => e.get({ plain: true }));
      res.status(200); // OK
      res.json(posts); // 投稿一式をJSONで返す
    } else {
      res.status(401);
    }
  },
  // POST /posts
  async postPosts(req, res) {
    if (req.isAuthenticated() === true) {
      // 認証済みであれば投稿の新規作成
      try {
        await Post.create({
          content: req.body.content,
          UserId: req.user.id,
        });
      } catch (error) {
        console.error(`error: ${error}`);
      }
      // トップページへ遷移
      res.redirect("/");
    } else {
      // そうでなければサインインページへ遷移
      res.redirect("/sign-in");
    }
  },
};
module.exports = { setupPassport, controller };
