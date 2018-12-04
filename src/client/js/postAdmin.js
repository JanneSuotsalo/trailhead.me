'use strict';

if (window.user) {
  const content = document.querySelector('content');
  const div = document.createElement('div');
  content.appendChild(div);
  div.setAttribute('class', 'toolbar');

  // Get the current url
  let currentUrl = '' + window.location.href;
  if (currentUrl.endsWith('/')) {
    currentUrl = currentUrl.slice(0, -1);
  }

  // prettier-ignore
  div.innerHTML += `
<div class="tools">
    <a href="${currentUrl}/flag">
        <div class="button-small"> 
            <span class="mdi mdi-flag-variant">
            </span> 
            Report
        </div>
    <a>
</div>
`;
}
