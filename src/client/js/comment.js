'use strict';

const button = document.getElementById('commentButton');
const textArea = document.getElementById('commentTextarea');
let commentList = document.getElementById('commentList');
let comment = '';

// Create comment list

// Fetch the the list of comments
fetch('list', {
  method: 'post',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
})
  .then(data => data.json())
  .then(json => {
    const showList = html => {
      commentList.innerHTML = html;
    };

    json.list.forEach(element => {
      console.log(element);

      // Create a delete comment icon
      const commentDelete = () => {
        if (window.user.username === element.userName) {
          return '<p id="deleteComment"><span class="mdi mdi-close-circle-outline"></span></p>';
        } else {
          return '';
        }
      };
      // Build the html of comment list
      comment +=
        '<div id ="flex">' +
        '<img src="https://i.imgur.com/MQcuk3n.jpg" alt="Profile pic" id="profilePic">' +
        '<p id="username">' +
        element.displayName +
        '</p>' +
        commentDelete() +
        '</div>' +
        '<p id="commentText">' +
        element.text +
        '</p>' +
        '<span id="time">' +
        element.createdAt +
        '</span>' +
        '<br>' +
        '<div class="line"></div>' +
        '<br>';
    });
    showList(comment);
  });

// Create a new comment
button.addEventListener('click', evt => {
  fetch('../comment', {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: textArea.value }),
  })
    .then(data => data.json())
    .then(json => {
      console.log(json);
    });
  textArea.value = '';
});
