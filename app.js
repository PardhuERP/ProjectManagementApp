const API="https://script.google.com/macros/s/AKfycbypgdv1t-xNbeykrN6GFdAMz-N8e5hSh4fgZ7W93X-mOn5f1yljanPwHPFzBBE38A/exec";

async function materials(){

let r=await fetch(
API+"?action=materialStatus"
);

let data=await r.json();

let html="📦 Material Status\n\n";

data.forEach(x=>{

html+=
x.material+
"\nBalance: "+
x.balance+
"\nStatus: "+
x.status+

"\n\n";

});

alert(html);

}

function dailyReport(){

window.open(
API+"?action=pdfReport"
);

}

async function whatsapp(){

let r=await fetch(
API+"?action=whatsappReport"
);

let txt=
await r.text();

alert(txt);

}

function openRooms(){

alert(
"Room calculator next"
);

}
