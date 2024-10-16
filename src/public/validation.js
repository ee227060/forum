"use strict";
const button = document.getElementById("submitButton");
const warning = document.getElementById("warning");
const content = document.getElementById("content");
function isEmptyString(content) {
  const pattern = /^\s*$/;
  return pattern.test(content);
}
function exceedsLength(content) {
  const pattern = /^.{141,}$/;
  return pattern.test(content);
  /* 141などのマジックナンバーが出現するのはお行儀が悪いので改
良すること */
}
button.addEventListener("click", (event) => {
  if (isEmptyString(content.value) === true) {
    event.preventDefault();
    warning.innerText = "空白文字のみの投稿は禁止されています";
    return;
  }
  if (exceedsLength(content.value) === true) {
    event.preventDefault();
    warning.innerText = "140字を超えた投稿は禁止されています";
    return;
  }
  warning.innerText = "";
});
