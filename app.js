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


async function openRooms(){

document
.getElementById("result")
.innerHTML="";

}


async function calculate(){

let unit=
document.getElementById(
"unit"
).value;

let length=parseFloat(
document.getElementById(
"length"
).value
);

let width=parseFloat(
document.getElementById(
"width"
).value
);

if(unit=="mm"){

length=length/304.8;

width=width/304.8;

}

let r=await fetch(

API+

"?action=calculate"+

"&length="+length+

"&width="+width+

"&height=10"

);

let d=await r.json();

document.getElementById(
"result"
).innerHTML=`

<div class="card">

<h3>📐 Results</h3>

<p><b>Area:</b>
${Number(d.area).toFixed(2)}
sqft</p>

<p><b>Tiles:</b>
${d.tiles}</p>

<p><b>Skirting:</b>
${d.skirting}
sqft</p>

<p><b>Skirting Tiles:</b>
${Math.ceil((d.skirting/4)+1)}</p>

<p><b>Total Tiles:</b>
${d.tiles+
Math.ceil((d.skirting/4)+1)}</p>

<p><b>Adhesive:</b>
${d.adhesive}
Bags</p>

<p><b>Grout:</b>
${d.grout}</p>

<hr>

<p><b>False Ceiling:</b>
${d.falseCeiling}
sqft</p>

<p><b>Gypsum Boards:</b>
${d.gypsum}</p>

<p><b>Paint:</b>
${d.paint}
Liters</p>

<p><b>POP Bags:</b>
${d.pop}</p>

</div>

`;

}



async function saveRoom(){

let room=
document.getElementById(
"room"
).value;


let roomType=
document.getElementById(
"roomType"
).value;


let unit=
document.getElementById(
"unit"
).value;


let length=parseFloat(
document.getElementById(
"length"
).value
);


let width=parseFloat(
document.getElementById(
"width"
).value
);


if(unit=="mm"){

length=
length/304.8;

width=
width/304.8;

}


let url=

API+

"?action=addRoom"+

"&project=PRJ001"+

"&room="+room+

"&type="+roomType+

"&length="+length+

"&width="+width+

"&height=10";


let r=
await fetch(url);

let txt=
await r.text();

alert(txt);

}
