'use strict';

const { flagStateIDs } = require('modules/constants');

const content = document.querySelector('content');
content.innerHTML = `<div class = wrapperReport>
<select>

</select>
<div class="reportBox">
<textarea class="reportTextarea" rows="4" cols="50" maxlength="256" placeholder="Type your report reason here... "></textarea>
</div>
<div>`;
