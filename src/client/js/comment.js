'use strict';

const content = document.querySelector('.commentContent');
let comment = '';

// Create the commentBox and basic html for the comment list
content.innerHTML = `<div class="wrapperComment">
        <div id="comments">
            <div>
                <div class="flex">
                    <img src="https://i.ytimg.com/vi/EDzLx3hkli0/maxresdefault.jpg" class="profilePic">
                    <div class="commentBox">
                        <textarea class="commentTextarea" rows="4" cols="50" maxlength="256" placeholder="Type your comment here... "></textarea>
                    </div>
                </div>
                <button class="commentButton" type='submit' value='Submit'>Send</button>
            </div>
            <br>
            <br>
            <div class="line2"></div>
            <br>
            <div class="commentList">
            </div>
        </div>
    </div>`;

const button = document.querySelector('.commentButton');
const textArea = document.querySelector('.commentTextarea');
let commentList = document.querySelector('.commentList');

// Get the current url
const currentUrl = window.location.href;
// Fetch the the list of comments and creates the html as a function
const listOfComments = () => {
  fetch(currentUrl + '/comment/list', {
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
        let aUsername = document.createElement('a');
        let p = document.createElement('p');
        let pDelete = document.createElement('p');
        let span = document.createElement('span');
        let pText = document.createElement('p');
        let spanTime = document.createElement('span');
        let br = document.createElement('br');
        let br2 = document.createElement('br');
        let divLine = document.createElement('div');
        let divComment = document.createElement('div');

        div.setAttribute('class', 'flex');

        img.setAttribute('src', '/file/' + element.fileID + '/m');
        img.setAttribute('class', 'profilePic');

        aUsername.setAttribute('class', 'username');
        aUsername.innerText = element.displayName;
        aUsername.setAttribute('href', '../' + element.userName);

        pDelete.setAttribute('class', 'deleteComment');
        span.setAttribute('class', 'mdi mdi-close-circle-outline');

        pText.setAttribute('class', 'commentText');
        pText.innerText = element.text;

        spanTime.classList.add('time');
        spanTime.innerText = moment(element.createdAt).fromNow();
        // prettier-ignore
        spanTime.setAttribute('title', moment(element.createdAt).format('DD.MM.YYYY HH.mm'));
        spanTime.setAttribute('class', 'time');

        divLine.setAttribute('class', 'line');

        div.appendChild(img);
        p.appendChild(aUsername);
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
              fetch(currentUrl + '/comment/' + element.commentID, {
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
  fetch(currentUrl + '/comment', {
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
