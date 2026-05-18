const API="https://script.google.com/macros/s/AKfycbypgdv1t-xNbeykrN6GFdAMz-N8e5hSh4fgZ7W93X-mOn5f1yljanPwHPFzBBE38A/exec";

function materials(){

window.open(
API+"?action=materialStatus"
)

}

function dailyReport(){

window.open(
API+"?action=pdfReport"
)

}

function whatsapp(){

window.open(
API+"?action=whatsappReport"
)

}

function openRooms(){

alert(
"Room calculator coming next"
)

}
