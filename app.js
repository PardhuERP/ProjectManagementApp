
const API = "https://script.google.com/macros/s/AKfycbypgdv1t-xNbeykrN6GFdAMz-N8e5hSh4fgZ7W93X-mOn5f1yljanPwHPFzBBE38A/exec";

// =====================================
// MATERIAL STATUS
// =====================================
async function materials() {
  try {
    const response = await fetch(API + "?action=materialStatus");

    if (!response.ok) {
      throw new Error("Unable to load material status.");
    }

    const data = await response.json();

    let html = "📦 Material Status\n\n";

    if (!Array.isArray(data) || data.length === 0) {
      alert("No material records found.");
      return;
    }

    data.forEach(item => {
      html +=
        item.material +
        "\nBalance: " + item.balance +
        "\nStatus: " + item.status +
        "\n\n";
    });

    alert(html);
  } catch (error) {
    console.error(error);
    alert("Error loading material status. Please try again.");
  }
}

// =====================================
// DAILY PDF REPORT
// =====================================
function dailyReport() {
  window.open(API + "?action=pdfReport", "_blank");
}

// =====================================
// WHATSAPP REPORT
// =====================================
async function whatsapp() {
  try {
    const response = await fetch(API + "?action=whatsappReport");

    if (!response.ok) {
      throw new Error("Unable to generate WhatsApp report.");
    }

    const message = await response.text();
    alert(message);
  } catch (error) {
    console.error(error);
    alert("Error generating WhatsApp report.");
  }
}

// =====================================
// OPEN ROOMS
// =====================================
async function openRooms() {
  const result = document.getElementById("result");

  if (result) {
    result.innerHTML = "";
  }
}

// =====================================
// UPDATE MEASUREMENT LABELS
// Room unit and tile unit are separate.
// Preset tile sizes are always in feet.
// =====================================
function updateUnitLabels() {
  const unitElement = document.getElementById("unit");
  const unit = unitElement ? unitElement.value : "ft";

  const lengthElement = document.getElementById("length");
  const widthElement = document.getElementById("width");

  if (lengthElement) {
    lengthElement.placeholder = `Room Length (${unit})`;
  }

  if (widthElement) {
    widthElement.placeholder = `Room Width (${unit})`;
  }

  const tileSizeElement = document.getElementById("tileSize");
  const isCustom = tileSizeElement &&
    tileSizeElement.value === "custom";

  const tileUnitElement = document.getElementById("tileUnit");
  const tileUnit = tileUnitElement ? tileUnitElement.value : "ft";

  const tileLengthElement = document.getElementById("tileLength");
  const tileWidthElement = document.getElementById("tileWidth");

  if (tileLengthElement) {
    tileLengthElement.placeholder =
      `Tile Length (${isCustom ? tileUnit : "ft"})`;
  }

  if (tileWidthElement) {
    tileWidthElement.placeholder =
      `Tile Width (${isCustom ? tileUnit : "ft"})`;
  }
}

// =====================================
// SHOW / HIDE CUSTOM TILE DIMENSIONS
// =====================================
function toggleCustomTile() {
  const tileSizeElement = document.getElementById("tileSize");
  const customFields = document.getElementById("customTileFields");

  if (!tileSizeElement || !customFields) return;

  customFields.style.display =
    tileSizeElement.value === "custom" ? "block" : "none";

  updateUnitLabels();
}

// =====================================
// ROOM AND TILE CALCULATOR
// =====================================
function calculate() {
  const room = document.getElementById("room").value.trim();
  const roomType = document.getElementById("roomType").value;
  const unit = document.getElementById("unit").value;

  const length = Number(document.getElementById("length").value);
  const width = Number(document.getElementById("width").value);

  const tileSize = document.getElementById("tileSize").value;
  const wastage = Number(document.getElementById("wastage").value);

  const tilesPerBoxElement =
    document.getElementById("tilesPerBox");

  const tilesPerBox = tilesPerBoxElement
    ? Number(tilesPerBoxElement.value)
    : 1;

  if (!room || !roomType) {
    alert("Enter room name and select room type.");
    return;
  }

  if (!(length > 0) || !(width > 0)) {
    alert("Enter valid room length and width.");
    return;
  }

  if (!Number.isFinite(wastage) || wastage < 0) {
    alert("Select a valid wastage percentage.");
    return;
  }

  if (!Number.isInteger(tilesPerBox) || tilesPerBox < 1) {
    alert("Select a valid tiles-per-box quantity.");
    return;
  }

  let tileLength;
  let tileWidth;
  let tileUnit = "ft";

  if (tileSize === "custom") {
    tileLength = Number(
      document.getElementById("tileLength").value
    );

    tileWidth = Number(
      document.getElementById("tileWidth").value
    );

    const tileUnitElement =
      document.getElementById("tileUnit");

    tileUnit = tileUnitElement
      ? tileUnitElement.value
      : "ft";
  } else {
    // Examples: 2x2, 2x4, 3x5, 4x2.
    // Preset dimensions are always in feet.
    [tileLength, tileWidth] =
      tileSize.split("x").map(Number);
  }

  if (
    !Number.isFinite(tileLength) ||
    !Number.isFinite(tileWidth) ||
    tileLength <= 0 ||
    tileWidth <= 0
  ) {
    alert("Enter valid tile dimensions.");
    return;
  }

  // Convert room measurements to feet.
  const roomFactor = unit === "mm" ? 1 / 304.8 : 1;

  // Convert tile measurements to feet.
  const tileFactor = tileUnit === "mm" ? 1 / 304.8 : 1;

  const roomLengthFt = length * roomFactor;
  const roomWidthFt = width * roomFactor;

  const tileLengthFt = tileLength * tileFactor;
  const tileWidthFt = tileWidth * tileFactor;

  const roomArea = roomLengthFt * roomWidthFt;
  const tileArea = tileLengthFt * tileWidthFt;

  // Tile quantity by area.
  const baseTiles = Math.ceil(roomArea / tileArea);

  // Add wastage tiles.
  const wastageTiles = Math.ceil(
    baseTiles * wastage / 100
  );

  const totalTiles = baseTiles + wastageTiles;

  // Calculate complete boxes.
  const boxesRequired = Math.ceil(
    totalTiles / tilesPerBox
  );

  const totalTilesInBoxes = boxesRequired * tilesPerBox;
  const extraBoxTiles = totalTilesInBoxes - totalTiles;

  const result = document.getElementById("result");

  result.innerHTML = `
    <h3>📊 Calculation Result</h3>

    <p><b>Room:</b> ${escapeHTML(room)}</p>
    <p><b>Room Type:</b> ${escapeHTML(roomType)}</p>

    <p><b>Room Dimensions:</b>
      ${length} × ${width} ${escapeHTML(unit)}
    </p>

    <p><b>Room Area:</b>
      ${roomArea.toFixed(2)} sq ft
    </p>

    <p><b>Tile Size:</b>
      ${tileLength} × ${tileWidth} ${escapeHTML(tileUnit)}
    </p>

    <p><b>Area per Tile:</b>
      ${tileArea.toFixed(2)} sq ft
    </p>

    <p><b>Tiles before wastage:</b> ${baseTiles}</p>
    <p><b>Wastage (${wastage}%):</b> ${wastageTiles}</p>

    <hr>

    <h3>🧱 Tile Requirement</h3>

    <p><b>Total Tiles Required:</b> ${totalTiles}</p>
    <p><b>T. Tile / Box Qty:</b> ${tilesPerBox}</p>
    <p><b>Total Boxes Required:</b> ${boxesRequired}</p>
    <p><b>Total Tiles in Boxes:</b> ${totalTilesInBoxes}</p>
    <p><b>Extra Tiles from Full Boxes:</b> ${extraBoxTiles}</p>

    <small>
      Estimate is based on floor area. Cutting patterns,
      layout and breakage may affect actual quantities.
    </small>
  `;

  // Store values for use by Save Room.
  window.lastRoomCalculation = {
    room,
    roomType,
    unit,
    length,
    width,
    roomAreaSqFt: roomArea,
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
    extraBoxTiles
  };
}

// =====================================
// SAFE HTML TEXT
// =====================================
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// =====================================
// SAVE ROOM TO GOOGLE SHEETS
// =====================================
async function saveRoom() {
  const calculation = window.lastRoomCalculation;

  if (!calculation) {
    alert("Please calculate the room before saving.");
    return;
  }

  const params = new URLSearchParams({
    action: "addRoom",
    project: "PRJ001",
    room: calculation.room,
    type: calculation.roomType,
    length: String(calculation.roomLengthFt ??
      (calculation.unit === "mm"
        ? calculation.length / 304.8
        : calculation.length)),
    width: String(calculation.roomWidthFt ??
      (calculation.unit === "mm"
        ? calculation.width / 304.8
        : calculation.width)),
    height: "10"
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

// =====================================
// PLYWOOD CALCULATOR
// =====================================
function plywoodCalculator() {
  let area = prompt("Enter total plywood area (sq ft)");

  if (area === null) return;

  area = Number(area);

  if (!Number.isFinite(area) || area <= 0) {
    alert("Please enter a valid area in square feet.");
    return;
  }

  // Standard 8x4 ft sheet = 32 sq ft.
  const sheets = Math.ceil((area / 32) * 1.10);
  const fevicol = Math.ceil(sheets * 1);
  const nails = Math.ceil(sheets * 0.5);

  alert(
    "🪵 Plywood Estimate\n\n" +
    "Area: " + area.toFixed(2) + " sq ft\n\n" +
    "Plywood Sheets (including 10% allowance): " +
    sheets + "\n\n" +
    "Fevicol: " + fevicol + " Kg\n\n" +
    "Nails: " + nails + " Kg"
  );
}
