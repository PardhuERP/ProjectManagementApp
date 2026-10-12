
const API = "https://script.google.com/macros/s/AKfycbypgdv1t-xNbeykrN6GFdAMz-N8e5hSh4fgZ7W93X-mOn5f1yljanPwHPFzBBE38A/exec";

// ============================================
// COMMON HELPERS
// ============================================
function getValue(id, fallback = 0) {
  const element = document.getElementById(id);
  if (!element || element.value === "") return fallback;
  const value = Number(element.value);
  return Number.isFinite(value) ? value : fallback;
}

function isChecked(id, fallback = false) {
  const element = document.getElementById(id);
  return element ? element.checked : fallback;
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

function roundUp(value) {
  return Math.ceil(value);
}

// ============================================
// MATERIAL STATUS
// ============================================
async function materials() {
  try {
    const response = await fetch(API + "?action=materialStatus");
    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      alert("No material records found.");
      return;
    }

    let message = "📦 MATERIAL STATUS\n\n";

    data.forEach(item => {
      message +=
        item.material +
        "\nBalance: " + item.balance +
        "\nStatus: " + item.status +
        "\n\n";
    });

    alert(message);
  } catch (error) {
    console.error(error);
    alert("Unable to load material status.");
  }
}

// ============================================
// DAILY PDF REPORT
// ============================================
function dailyReport() {
  window.open(API + "?action=pdfReport", "_blank");
}

// ============================================
// WHATSAPP REPORT
// ============================================
async function whatsapp() {
  try {
    const response = await fetch(API + "?action=whatsappReport");
    if (!response.ok) throw new Error("Request failed");

    const message = await response.text();
    alert(message);
  } catch (error) {
    console.error(error);
    alert("Unable to generate WhatsApp report.");
  }
}

// ============================================
// OPEN ROOMS
// ============================================
function openRooms() {
  const result = document.getElementById("result");
  if (result) result.innerHTML = "";
}

// ============================================
// UPDATE MEASUREMENT LABELS
// Room dimensions follow room unit.
// Preset tile sizes always use feet.
// ============================================
function updateUnitLabels() {
  const unit = document.getElementById("unit")?.value || "ft";
  const tileSize = document.getElementById("tileSize")?.value;
  const tileUnit = document.getElementById("tileUnit")?.value || "ft";

  const length = document.getElementById("length");
  const width = document.getElementById("width");
  const tileLength = document.getElementById("tileLength");
  const tileWidth = document.getElementById("tileWidth");

  if (length) length.placeholder = `Room Length (${unit})`;
  if (width) width.placeholder = `Room Width (${unit})`;

  const actualTileUnit = tileSize === "custom" ? tileUnit : "ft";

  if (tileLength) tileLength.placeholder = `Tile Length (${actualTileUnit})`;
  if (tileWidth) tileWidth.placeholder = `Tile Width (${actualTileUnit})`;
}

// ============================================
// CUSTOM TILE FIELDS
// ============================================
function toggleCustomTile() {
  const tileSize = document.getElementById("tileSize");
  const fields = document.getElementById("customTileFields");

  if (!tileSize || !fields) return;

  fields.style.display =
    tileSize.value === "custom" ? "block" : "none";

  updateUnitLabels();
}

// ============================================
// ROOM + TILE + INTERIOR MATERIAL CALCULATOR
// ============================================
function calculate() {
  const room = document.getElementById("room")?.value.trim() || "";
  const roomType = document.getElementById("roomType")?.value || "";
  const unit = document.getElementById("unit")?.value || "ft";

  const length = getValue("length");
  const width = getValue("width");

  const tileSize = document.getElementById("tileSize")?.value || "2x2";
  const wastage = getValue("wastage", 5);
  const tilesPerBox = getValue("tilesPerBox", 4);

  if (!room || !roomType) {
    alert("Enter room name and select room type.");
    return;
  }

  if (length <= 0 || width <= 0) {
    alert("Enter valid room length and width.");
    return;
  }

  if (wastage < 0 || !Number.isFinite(wastage)) {
    alert("Enter valid tile wastage percentage.");
    return;
  }

  if (!Number.isInteger(tilesPerBox) || tilesPerBox < 1) {
    alert("Select a valid tiles-per-box quantity.");
    return;
  }

  // Tile dimensions
  let tileLength;
  let tileWidth;
  let tileUnit = "ft";

  if (tileSize === "custom") {
    tileLength = getValue("tileLength");
    tileWidth = getValue("tileWidth");
    tileUnit = document.getElementById("tileUnit")?.value || "ft";
  } else {
    [tileLength, tileWidth] = tileSize.split("x").map(Number);
  }

  if (tileLength <= 0 || tileWidth <= 0) {
    alert("Enter valid tile dimensions.");
    return;
  }

  // Convert all measurements to feet.
  const roomFactor = unit === "mm" ? 1 / 304.8 : 1;
  const tileFactor = tileUnit === "mm" ? 1 / 304.8 : 1;

  const roomLengthFt = length * roomFactor;
  const roomWidthFt = width * roomFactor;
  const tileLengthFt = tileLength * tileFactor;
  const tileWidthFt = tileWidth * tileFactor;

  const roomArea = roomLengthFt * roomWidthFt;
  const tileArea = tileLengthFt * tileWidthFt;
  const perimeter = 2 * (roomLengthFt + roomWidthFt);

  // Tile quantity by area.
  const baseTiles = roundUp(roomArea / tileArea);
  const wastageTiles = roundUp(baseTiles * wastage / 100);
  const totalTiles = baseTiles + wastageTiles;

  // Box quantity.
  const boxesRequired = roundUp(totalTiles / tilesPerBox);
  const totalTilesInBoxes = boxesRequired * tilesPerBox;
  const extraBoxTiles = totalTilesInBoxes - totalTiles;

  // Room height and wall area.
  const roomHeight = getValue("roomHeight", 10);
  const wallArea = perimeter * roomHeight;
  const ceilingArea = roomArea;

  // Adhesive / chemical bags.
  const adhesiveCoverage = getValue("adhesiveCoverage", 50);
  const adhesiveBags = isChecked("useAdhesive", true) && adhesiveCoverage > 0
    ? roundUp(roomArea / adhesiveCoverage)
    : 0;

  // Sand bed: optional 1-inch depth.
  const sandCubicFeet = isChecked("useSand")
    ? roomArea / 12
    : 0;
  const sandCubicMetres = sandCubicFeet / 35.3147;

  // Feviquick packets.
  const feviquickCoverage = getValue("feviquickCoverage", 100);
  const feviquickPackets =
    isChecked("useFeviquick") && feviquickCoverage > 0
      ? roundUp(roomArea / feviquickCoverage)
      : 0;

  // Spacer packets.
  const spacerCoverage = getValue("spacerCoverage", 100);
  const spacerPackets =
    isChecked("useSpacers") && spacerCoverage > 0
      ? roundUp(totalTiles / spacerCoverage)
      : 0;

  // Grout estimate using user-entered coverage per kg.
  const groutCoverage = getValue("groutCoverage", 10);
  const groutKg =
    isChecked("useGrout", true) && groutCoverage > 0
      ? roundUp(roomArea / groutCoverage)
      : 0;

  // Paint: full wall area multiplied by coats.
  const paintCoverage = getValue("paintCoverage", 100);
  const paintCoats = getValue("paintCoats", 2);
  const paintLitres =
    isChecked("usePaint") && paintCoverage > 0 && paintCoats > 0
      ? Math.ceil(wallArea * paintCoats / paintCoverage)
      : 0;

  // False ceiling area.
  const falseCeilingArea = isChecked("useFalseCeiling")
    ? ceilingArea
    : 0;
  const falseCeilingWastage = isChecked("useFalseCeiling")
    ? getValue("ceilingWastage", 5)
    : 0;
  const falseCeilingTotal = falseCeilingArea > 0
    ? falseCeilingArea * (1 + falseCeilingWastage / 100)
    : 0;

  // Wall putty bags.
  const puttyCoverage = getValue("puttyCoverage", 100);
  const puttyBags =
    isChecked("usePutty") && puttyCoverage > 0
      ? roundUp(wallArea / puttyCoverage)
      : 0;

  // Skirting length, optional.
  const skirtingHeightInches = getValue("skirtingHeight", 4);
  const skirtingLength = isChecked("useSkirting")
    ? perimeter
    : 0;
  const skirtingArea = skirtingLength * (skirtingHeightInches / 12);

  // Display results.
  const result = document.getElementById("result");
  if (!result) {
    alert("Result container #result was not found in HTML.");
    return;
  }

  result.innerHTML = `
    <h3>📊 Room Calculation</h3>

    <p><b>Room:</b> ${escapeHTML(room)}</p>
    <p><b>Room Type:</b> ${escapeHTML(roomType)}</p>
    <p><b>Room Dimensions:</b> ${length} × ${width} ${escapeHTML(unit)}</p>
    <p><b>Room Area:</b> ${roomArea.toFixed(2)} sq ft</p>
    <p><b>Wall Area (estimated):</b> ${wallArea.toFixed(2)} sq ft</p>
    <p><b>Ceiling Area:</b> ${ceilingArea.toFixed(2)} sq ft</p>

    <hr>
    <h3>🧱 Floor Tiles</h3>

    <p><b>Tile Size:</b> ${tileLength} × ${tileWidth} ${escapeHTML(tileUnit)}</p>
    <p><b>Area per Tile:</b> ${tileArea.toFixed(2)} sq ft</p>
    <p><b>Tiles before wastage:</b> ${baseTiles}</p>
    <p><b>Wastage (${wastage}%):</b> ${wastageTiles}</p>
    <h3>Total Tiles Required: ${totalTiles}</h3>
    <p><b>T. Tile / Box Qty:</b> ${tilesPerBox}</p>
    <h3>Total Boxes Required: ${boxesRequired}</h3>
    <p><b>Total Tiles in Boxes:</b> ${totalTilesInBoxes}</p>
    <p><b>Extra Tiles from Full Boxes:</b> ${extraBoxTiles}</p>

    <hr>
    <h3>🧰 Additional Materials</h3>

    ${isChecked("useAdhesive", true)
      ? `<p><b>Tile Adhesive / Chemical:</b> ${adhesiveBags} bags</p>`
      : ""}

    ${isChecked("useSand")
      ? `<p><b>Sand Bed (1 inch):</b> ${sandCubicFeet.toFixed(2)} cu ft (${sandCubicMetres.toFixed(3)} m³)</p>`
      : ""}

    ${isChecked("useFeviquick")
      ? `<p><b>Feviquick:</b> ${feviquickPackets} packets (estimated)</p>`
      : ""}

    ${isChecked("useSpacers")
      ? `<p><b>Tile Spacers:</b> ${spacerPackets} packets (estimated)</p>`
      : ""}

    ${isChecked("useGrout", true)
      ? `<p><b>Grout:</b> ${groutKg} kg (estimated)</p>`
      : ""}

    ${isChecked("usePaint")
      ? `<p><b>Paint:</b> ${paintLitres} litres (${paintCoats} coats, walls only)</p>`
      : ""}

    ${isChecked("useFalseCeiling")
      ? `<p><b>False Ceiling:</b> ${falseCeilingTotal.toFixed(2)} sq ft including ${falseCeilingWastage}% allowance</p>`
      : ""}

    ${isChecked("usePutty")
      ? `<p><b>Wall Putty:</b> ${puttyBags} bags (estimated)</p>`
      : ""}

    ${isChecked("useSkirting")
      ? `<p><b>Skirting Length:</b> ${skirtingLength.toFixed(2)} ft</p>
         <p><b>Skirting Area:</b> ${skirtingArea.toFixed(2)} sq ft</p>`
      : ""}

    <small>
      Material quantities are estimates. Confirm product coverage,
      package sizes, door/window deductions and site conditions before ordering.
    </small>
  `;

  // Save calculation for Save Room and future integrations.
  window.lastRoomCalculation = {
    room,
    roomType,
    unit,
    length,
    width,
    roomLengthFt,
    roomWidthFt,
    roomAreaSqFt: roomArea,
    wallAreaSqFt: wallArea,
    ceilingAreaSqFt: ceilingArea,
    tileLength,
    tileWidth,
    tileUnit,
    tileAreaSqFt: tileArea,
    baseTiles,
    wastagePercent: wastage,
    wastageTiles,
    totalTiles,
    tilesPerBox,
    boxesRequired,
    totalTilesInBoxes,
    extraBoxTiles,
    roomHeightFt: roomHeight,
    adhesiveBags,
    sandCubicFeet,
    sandCubicMetres,
    feviquickPackets,
    spacerPackets,
    groutKg,
    paintLitres,
    paintCoats,
    falseCeilingAreaSqFt: falseCeilingTotal,
    puttyBags,
    skirtingLengthFt: skirtingLength,
    skirtingAreaSqFt: skirtingArea
  };
}

// ============================================
// SAVE ROOM TO GOOGLE SHEETS
// Existing endpoint saves room dimensions only.
// Additional material fields require backend support.
// ============================================
async function saveRoom() {
  const calculation = window.lastRoomCalculation;

  if (!calculation) {
    alert("Calculate the room before saving.");
    return;
  }

  const params = new URLSearchParams({
    action: "addRoom",
    project: "PRJ001",
    room: calculation.room,
    type: calculation.roomType,
    length: String(calculation.roomLengthFt),
    width: String(calculation.roomWidthFt),
    height: String(calculation.roomHeightFt)
  });

  try {
    const response = await fetch(API + "?" + params.toString());
    const message = await response.text();
    alert(message);
  } catch (error) {
    console.error(error);
    alert("Error saving room. Please try again.");
  }
}

// ============================================
// PLYWOOD CALCULATOR
// ============================================
function plywoodCalculator() {
  const answer = prompt("Enter total plywood area (sq ft)");

  if (answer === null) return;

  const area = Number(answer);

  if (!Number.isFinite(area) || area <= 0) {
    alert("Enter a valid area in square feet.");
    return;
  }

  const sheets = Math.ceil((area / 32) * 1.10);
  const fevicol = Math.ceil(sheets);
  const nails = Math.ceil(sheets * 0.5);

  alert(
    "🪵 Plywood Estimate\n\n" +
    "Area: " + area.toFixed(2) + " sq ft\n\n" +
    "Plywood Sheets (including 10% allowance): " + sheets +
    "\n\nFevicol: " + fevicol + " Kg" +
    "\n\nNails: " + nails + " Kg"
  );
}
