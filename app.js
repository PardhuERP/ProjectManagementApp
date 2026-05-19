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

length=
length/304.8;

width=
width/304.8;

}

let r=await fetch(

API+

"?action=calculate"+

"&length="+length+

"&width="+width+

"&height=10"

);

let d=await r.json();

document
.getElementById(
"result"
).innerHTML=`

<h3>Results</h3>

Area: ${d.area} sqft

<br><br>

Tiles: ${d.tiles}

<br><br>

<b>Skirting:</b>
${d.skirting} sqft

<br><br>

<b>Skirting Tiles:</b>
${Math.ceil((d.skirting/4)+1)}

<br><br>

<b>Total Tiles:</b>
${d.tiles + Math.ceil((d.skirting/4)+1)}

<br><br>

Adhesive: ${d.adhesive} Bags

<br><br>

Grout: ${d.grout}

`;

}

document
.getElementById(
"result"
).innerHTML=`

<h3>📐 Results</h3>

<b>Area:</b> ${Number(d.area).toFixed(2)} sqft

<br><br>

<b>Tiles:</b> ${d.tiles}

<br><br>

<b>Skirting:</b> ${d.skirting} sqft

<br><br>

<b>Skirting Tiles:</b> ${Math.ceil((d.skirting/4)+1)}

<br><br>

<b>Total Tiles:</b> ${d.tiles + Math.ceil((d.skirting/4)+1)}

<br><br>

<b>Adhesive:</b> ${d.adhesive} Bags

<br><br>

<b>Grout:</b> ${d.grout}

`;
