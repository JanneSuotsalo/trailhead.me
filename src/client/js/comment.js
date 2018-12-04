'use strict';

const content = document.querySelector('.commentContent');
let comment = '';

let divWrapper = document.createElement('div');
divWrapper.setAttribute('class', 'wrapperComment');
let divComments = document.createElement('div');
divComments.setAttribute('id', 'comments');
content.appendChild(divWrapper);
divWrapper.appendChild(divComments);
const currentPath = window.location.pathname;

// Create the commentBox and basic html for the comment list

// Create comment box only if the user is logged in
// prettier-ignore
if (window.user) {
  // Creates the comment box
  divComments.innerHTML += 
  `<div>
   <div class="flex">
      <div ${window.user.image ? `style="background-image: url(/file/${window.user.image}/m)"`: ''} class="profilePic"></div>
      <div class="commentBox">
      <textarea class="commentTextarea" rows="4" cols="50" maxlength="256" placeholder="Type your comment here... "></textarea>
      </div>
   </div>
   <div id="error" style="display: none"></div>
      <button class="commentButton" type='submit' value='Submit'>Send</button>
   </div>`;
} else {
  divComments.innerHTML += `<span class="message"><span class="mdi mdi-information-outline"> 
  <a class="loginLink" href="../login?to=${currentPath}">Login</a> to comment a post 
  </span>
  </span>`
}
divComments.innerHTML += `<br>
 <br>
 <div class="line2"></div>
 <br>
 <div class="commentList">
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
        console.log('element', element);

        let div = document.createElement('div');
        let img = document.createElement('div');
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

        // Profile picture
        if (element.fileID) {
          img.style.backgroundImage = 'url(/file/' + element.fileID + '/m)';
        }
        img.setAttribute('class', 'profilePic');

        // Username and link to user's page
        aUsername.setAttribute('class', 'username');
        aUsername.innerText = element.displayName;
        aUsername.setAttribute('href', '../' + element.userName);

        // Comment deletion button
        pDelete.setAttribute('class', 'deleteComment');
        span.setAttribute('class', 'mdi mdi-close-circle-outline');

        pText.setAttribute('class', 'commentText');
        pText.innerText = element.text;

        // Time formatting
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
        if (window.user && window.user.username === element.userName) {
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

const errorMsg = document.getElementById('error');

// Check if user is logged in
if (window.user) {
  // Create a new comment
  button.addEventListener('click', evt => {
    // Checks if the text box is empty
    if (textArea.value.trim().length > 0) {
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
      errorMsg.innerText = '';
      errorMsg.style.display = 'none';
    } else {
      errorMsg.style.display = 'block';
      errorMsg.innerText = 'Comment can not be empty.';
    }
  });
}
