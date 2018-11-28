'use strict';

const button = document.getElementById('commentButton');
const textArea = document.getElementById('commentTextarea');
let commentList = document.getElementById('commentList');
let comment = '';

// Fetch the the list of comments and creates the html as a function
const listOfComments = () => {
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
      // Build the html of comment list
      json.list.forEach(element => {
        console.log(element);

        let div = document.createElement('div');
        let img = document.createElement('img');
        let p = document.createElement('p');
        let pDelete = document.createElement('p');
        let span = document.createElement('span');
        let pText = document.createElement('p');
        let spanTime = document.createElement('span');
        let br = document.createElement('br');
        let br2 = document.createElement('br');
        let divLine = document.createElement('div');
        let divComment = document.createElement('div');

        div.setAttribute('id', 'flex');

        img.setAttribute('src', 'https://i.imgur.com/MQcuk3n.jpg');
        img.setAttribute('alt', 'Profile pic');
        img.setAttribute('id', 'profilePic');

        p.setAttribute('id', 'username');
        p.innerText = element.displayName;

        pDelete.setAttribute('id', 'deleteComment');
        span.setAttribute('class', 'mdi mdi-close-circle-outline');

        pText.setAttribute('id', 'commentText');
        pText.innerText = element.text;

        spanTime.setAttribute('id', 'time');
        spanTime.innerText = element.createdAt;

        divLine.setAttribute('class', 'line');

        div.appendChild(img);
        div.appendChild(p);

        divComment.setAttribute('class', 'comment');

        divComment.appendChild(div);
        divComment.appendChild(pText);
        divComment.appendChild(spanTime);
        divComment.appendChild(br);
        divComment.appendChild(divLine);
        divComment.appendChild(br2);
        commentList.appendChild(divComment);

        // Create delete icon if the comment is made by the user
        if (window.user.username === element.userName) {
          pDelete.appendChild(span);
          div.appendChild(pDelete);

          // If the delete icon is pressed, gives confirmation popup and deletes the comment
          span.addEventListener('click', evt => {
            if (confirm('Are you sure you want to delete the comment?')) {
              fetch('../comment/' + element.commentID, {
                method: 'delete',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
              })
                .then(data => data.json())
                .then(json => {});
              divComment.parentNode.removeChild(divComment);
            } else {
            }
          });
        }
      });
    });
};
listOfComments();

// Create a new comment
button.addEventListener('click', evt => {
  commentList.innerHTML = '';
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
      listOfComments();
    });
  textArea.value = '';
});
