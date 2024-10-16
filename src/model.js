"use strict";
const { Sequelize, DataTypes } = require("sequelize");
// データベースのファイル名
const SEQUELIZE_STORAGE = "bbs.db";
// Sequelizeのインスタンス生成
const sequelize = new Sequelize({
  dialect: "sqlite", // バックエンドはSQLite
  storage: SEQUELIZE_STORAGE,
});
// 投稿を管理するモデルクラス
const Post = sequelize.define("Post", {
  id: {
    type: DataTypes.INTEGER, // 整数型
    autoIncrement: true, // 自動で増分
    primaryKey: true, // 主キー
  },
  content: {
    type: DataTypes.TEXT, // 長い文字列型
    allowNull: false, // null値を許容しない
  },
});
// ユーザを管理するモデルクラス
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER, // 整数型
    autoIncrement: true, // 自動で増分
    primaryKey: true, // 主キー
  },
  username: {
    type: DataTypes.STRING, // 文字列型
    allowNull: false, // null値を許容しない
    unique: true, // ユーザ名の重複を許容しない
  },
  password: {
    type: DataTypes.STRING, // 文字列型
    allowNull: false, // null値を許容しない
  },
});
// データベースを設定します。
async function setupDatabase(Post, User) {
  try {
    // データベース接続確認
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error(`Unable to connect to the database: ${error}`);
  }
  // UserとPostに1対多の関係を作成
  User.hasMany(Post, {
    foreignKey: {
      allowNull: false, // null値を許容しない
    },
  });
  // Postにユーザidを外部キーとして追加
  Post.belongsTo(User);
  // モデルをデータベースと同期
  await sequelize.sync();
}
module.exports = { Post, User, setupDatabase };
