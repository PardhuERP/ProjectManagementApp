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


function updateUnitLabels() {
  const unit = document.getElementById("unit").value;

  document.getElementById("length").placeholder =
    `Room Length (${unit})`;

  document.getElementById("width").placeholder =
    `Room Width (${unit})`;

  document.getElementById("tileLength").placeholder =
    `Tile Length (${unit})`;

  document.getElementById("tileWidth").placeholder =
    `Tile Width (${unit})`;
}

function toggleCustomTile() {
  const custom =
    document.getElementById("tileSize").value === "custom";

  document.getElementById("customTileFields").style.display =
    custom ? "block" : "none";
}

function calculate() {
  const room = document.getElementById("room").value.trim();
  const roomType = document.getElementById("roomType").value;
  const unit = document.getElementById("unit").value;

  const length = Number(document.getElementById("length").value);
  const width = Number(document.getElementById("width").value);

  const tileSize = document.getElementById("tileSize").value;
  const wastage = Number(document.getElementById("wastage").value);

  if (!room || !roomType) {
    alert("Enter room name and select room type.");
    return;
  }

  if (!(length > 0) || !(width > 0)) {
    alert("Enter valid room length and width.");
    return;
  }

  let tileLength, tileWidth;

  if (tileSize === "custom") {
    tileLength = Number(document.getElementById("tileLength").value);
    tileWidth = Number(document.getElementById("tileWidth").value);
  } else {
    [tileLength, tileWidth] = tileSize.split("x").map(Number);
  }

  if (!(tileLength > 0) || !(tileWidth > 0)) {
    alert("Enter valid tile dimensions.");
    return;
  }

  // Convert room and tile measurements to feet.
  const factor = unit === "mm" ? 1 / 304.8 : 1;

  const roomLengthFt = length * factor;
  const roomWidthFt = width * factor;
  const tileLengthFt = tileLength * factor;
  const tileWidthFt = tileWidth * factor;

  const roomArea = roomLengthFt * roomWidthFt;
  const tileArea = tileLengthFt * tileWidthFt;

  const exactTiles = roomArea / tileArea;
  const baseTiles = Math.ceil(exactTiles);
  const extraTiles = Math.ceil(baseTiles * wastage / 100);
  const totalTiles = baseTiles + extraTiles;

  const displayUnit = "sq ft";

  const result = document.getElementById("result");

  result.innerHTML = `
    <h3>📊 Calculation Result</h3>

    <p><b>Room:</b> ${escapeHTML(room)}</p>
    <p><b>Room Type:</b> ${escapeHTML(roomType)}</p>

    <p><b>Room Dimensions:</b>
      ${length} × ${width} ${unit}
    </p>

    <p><b>Room Area:</b>
      ${roomArea.toFixed(2)} ${displayUnit}
    </p>

    <p><b>Tile Size:</b>
      ${tileLength} × ${tileWidth} ${unit}
    </p>

    <p><b>Area per Tile:</b>
      ${tileArea.toFixed(2)} ${displayUnit}
    </p>

    <p><b>Tiles before wastage:</b> ${baseTiles}</p>
    <p><b>Extra Tiles (${wastage}%):</b> ${extraTiles}</p>

    <h3>Total Tiles Required: ${totalTiles}</h3>

    <small>
      Estimate based on area. Actual cutting, tile layout,
      grout gaps and breakage may change the final quantity.
    </small>
  `;

  // Retain the calculation for your Save Room function.
  window.lastRoomCalculation = {
    room,
    roomType,
    unit,
    length,
    width,
    roomAreaSqFt: roomArea,
    tileLength,
    tileWidth,
    tileAreaSqFt: tileArea,
    baseTiles,
    wastagePercent: wastage,
    extraTiles,
    totalTiles
  };
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
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

function plywoodCalculator(){

let area=prompt(
"Enter total plywood area (sqft)"
);

area=parseFloat(area);

let sheets=
Math.ceil(
(area/32)*1.10
);

let fevicol=
Math.ceil(sheets*1);

let nails=
Math.ceil(sheets*.5);

alert(

"🪵 Plywood Estimate\n\n"+

"Area: "+area+" sqft\n\n"+

"Plywood Sheets: "+
sheets+

"\n\nFevicol: "+
fevicol+
" Kg"+

"\n\nNails: "+
nails+
" Kg"

);

}
