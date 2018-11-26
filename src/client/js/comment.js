'use strict';

const button = document.getElementById('commentButton');
const textArea = document.getElementById('commentTextarea');

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

// Delete a comment
const deleteComment = document.getElementsByClassName('deleteComment');

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
    console.log(json);
  });
