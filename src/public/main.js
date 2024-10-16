"use strict";
// 記事を取得する間隔
const GET_INTERVAL = 5000;
// ウェブサーバのURL
const REQUEST_URL = "http://localhost:3000/posts";
$(function () {
  // 5秒ごとにgetPosts関数を呼び出す
  setInterval(getPosts, GET_INTERVAL);
});
// 投稿一覧取得を行う関数
function getPosts() {
  $.ajax({
    type: "GET",
    url: REQUEST_URL,
    success: showResponse,
  });
}
// レスポンスをページに反映する関数
function showResponse(response) {
  const timeline = $("timeline");
  timeline.html("");
  response.forEach((post) => {
    const meta =
      post.User.username +
      " " +
      post.createdAt.slice(0, 10).replaceAll("-", "/") +
      " " +
      post.createdAt.slice(11, 16);
    timeline.append(`<div class="border border-radius"><p>$
{meta}</p><p>${post.content}</p></div>`);
  });
}
