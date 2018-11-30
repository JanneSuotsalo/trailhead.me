'use strict';

const flagReasonTypeIDs = {
  Copyright: 1,
  Inappropriate: 2,
  Other: 3,
};
const flagReasons = Object.keys(flagReasonTypeIDs);

// Create the base html for report
const content = document.querySelector('content');
content.innerHTML = `
<div class = "wrapperReport">
  
    <div class = "modal" id="report">
     <h2> Report </h2>
     <select class = "selector">
            <option value = "reportReason" > Report reason </option>
      </select>
      <div class="reportBox">
       <textarea class="reportTextarea" rows="4" cols="50" maxlength="256" placeholder="Type your report reason here... "></textarea>
      </div>
      <div id="error" style="display: none;"></div>
      <div class="sink">
        <button class="reportButton" type='submit' value='Submit'>Send</button>
      </div>
    </div>
  
</div>`;

const select = document.querySelector('select');
// Create selection bar for flag reasons
flagReasons.forEach(element => {
  let option = document.createElement('option');
  option.setAttribute('value', element);
  option.innerText = element;
  select.appendChild(option);
});

const button = document.querySelector('.reportButton');
const textArea = document.querySelector('textarea');
const errorMsg = document.getElementById('error');
const currentUrl = window.location.href;

// Gets the value from the selector
const selectedValue = () => {
  let selector = document.querySelector('.selector').selectedIndex;
  return Number(selector);
};

// Send the report
button.addEventListener('click', evt => {
  if (selectedValue() !== 0) {
    if (textArea.value.trim().length !== 0) {
      fetch(currentUrl, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textArea.value,
          reasonTypeID: selectedValue(),
        }),
      })
        .then(data => data.json())
        .then(json => {
          console.log(json);
        });
      textArea.value = '';
    } else {
      // Give error msg if textbox is empty
      errorMsg.style.display = 'block';
      errorMsg.innerText = 'Text box can not be empty';
    }
  } else {
    // Give error msg if no report reason is selected
    errorMsg.style.display = 'block';
    errorMsg.innerText = 'Choose a report reason';
  }
});
