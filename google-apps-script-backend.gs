const SPREADSHEET_ID = "";
const SHEET_NAME = "BukvoMonstryCloud";
const HEADERS = [
  "playerId",
  "playerName",
  "updatedAt",
  "bestScore",
  "levelsCompleted",
  "correctAnswers",
  "mistakes",
  "battleLevel",
  "raceLevel",
  "lettersCorrect",
  "numbersCorrect",
  "achievementsJson"
];

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || "").trim();

    if (action === "getProgress") {
      return respond_(handleGetProgress_(e), e);
    }

    if (action === "saveProgress") {
      return respond_(handleSaveProgress_(e), e);
    }

    if (action === "bootstrap") {
      return respond_({
        ok: true,
        app: "BukvoMonstry Cloud",
        sheetName: SHEET_NAME
      }, e);
    }

    return respond_({
      ok: false,
      error: "unknown_action"
    }, e);
  } catch (error) {
    return respond_({
      ok: false,
      error: error && error.message ? error.message : String(error)
    }, e);
  }
}

function handleGetProgress_(e) {
  const playerId = normalizePlayerId_((e.parameter && e.parameter.playerId) || "");
  if (!playerId) {
    throw new Error("playerId is required");
  }

  const sheet = getSheet_();
  const rowInfo = findRowByPlayerId_(sheet, playerId);
  if (!rowInfo) {
    return {
      ok: true,
      found: false
    };
  }

  const record = rowToRecord_(rowInfo.values);
  return {
    ok: true,
    found: true,
    playerName: record.playerName,
    updatedAt: record.updatedAt,
    progress: recordToProgress_(record)
  };
}

function handleSaveProgress_(e) {
  const playerId = normalizePlayerId_((e.parameter && e.parameter.playerId) || "");
  const playerName = String((e.parameter && e.parameter.playerName) || "Игрок").trim() || "Игрок";
  if (!playerId) {
    throw new Error("playerId is required");
  }

  const incomingRecord = {
    playerId: playerId,
    playerName: playerName,
    updatedAt: String((e.parameter && e.parameter.updatedAt) || new Date().toISOString()),
    bestScore: toNumber_((e.parameter && e.parameter.bestScore) || 0),
    levelsCompleted: toNumber_((e.parameter && e.parameter.levelsCompleted) || 0),
    correctAnswers: toNumber_((e.parameter && e.parameter.correctAnswers) || 0),
    mistakes: toNumber_((e.parameter && e.parameter.mistakes) || 0),
    battleLevel: toNumber_((e.parameter && e.parameter.battleLevel) || 1),
    raceLevel: toNumber_((e.parameter && e.parameter.raceLevel) || 1),
    lettersCorrect: toNumber_((e.parameter && e.parameter.lettersCorrect) || 0),
    numbersCorrect: toNumber_((e.parameter && e.parameter.numbersCorrect) || 0),
    achievementsJson: normalizeAchievementsJson_((e.parameter && e.parameter.achievementsJson) || "[]")
  };

  const sheet = getSheet_();
  const rowInfo = findRowByPlayerId_(sheet, playerId);

  if (!rowInfo) {
    sheet.appendRow(recordToRow_(incomingRecord));
    return {
      ok: true,
      saved: true,
      updatedAt: incomingRecord.updatedAt,
      progress: recordToProgress_(incomingRecord)
    };
  }

  const storedRecord = rowToRecord_(rowInfo.values);
  const incomingTime = toTimestamp_(incomingRecord.updatedAt);
  const storedTime = toTimestamp_(storedRecord.updatedAt);

  if (incomingTime >= storedTime) {
    sheet.getRange(rowInfo.rowIndex, 1, 1, HEADERS.length).setValues([recordToRow_(incomingRecord)]);
    return {
      ok: true,
      saved: true,
      updatedAt: incomingRecord.updatedAt,
      progress: recordToProgress_(incomingRecord)
    };
  }

  return {
    ok: true,
    saved: false,
    skipped: true,
    updatedAt: storedRecord.updatedAt,
    progress: recordToProgress_(storedRecord)
  };
}

function getSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("Open the script from the target Google Sheet or set SPREADSHEET_ID.");
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = HEADERS.some(function(header, index) {
    return currentHeaders[index] !== header;
  });

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function findRowByPlayerId_(sheet, playerId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  for (var index = 0; index < values.length; index += 1) {
    if (normalizePlayerId_(values[index][0]) === playerId) {
      return {
        rowIndex: index + 2,
        values: values[index]
      };
    }
  }

  return null;
}

function rowToRecord_(row) {
  return {
    playerId: normalizePlayerId_(row[0]),
    playerName: String(row[1] || "Игрок"),
    updatedAt: String(row[2] || ""),
    bestScore: toNumber_(row[3]),
    levelsCompleted: toNumber_(row[4]),
    correctAnswers: toNumber_(row[5]),
    mistakes: toNumber_(row[6]),
    battleLevel: toNumber_(row[7]) || 1,
    raceLevel: toNumber_(row[8]) || 1,
    lettersCorrect: toNumber_(row[9]),
    numbersCorrect: toNumber_(row[10]),
    achievementsJson: normalizeAchievementsJson_(row[11] || "[]")
  };
}

function recordToProgress_(record) {
  return {
    bestScore: record.bestScore,
    levelsCompleted: record.levelsCompleted,
    correctAnswers: record.correctAnswers,
    mistakes: record.mistakes,
    battleLevel: record.battleLevel,
    raceLevel: record.raceLevel,
    updatedAt: record.updatedAt,
    achievements: JSON.parse(record.achievementsJson),
    categoryCorrect: {
      letters: record.lettersCorrect,
      numbers: record.numbersCorrect
    }
  };
}

function recordToRow_(record) {
  return [
    record.playerId,
    record.playerName,
    record.updatedAt,
    record.bestScore,
    record.levelsCompleted,
    record.correctAnswers,
    record.mistakes,
    record.battleLevel,
    record.raceLevel,
    record.lettersCorrect,
    record.numbersCorrect,
    record.achievementsJson
  ];
}

function respond_(payload, e) {
  const text = JSON.stringify(payload);
  const prefix = String((e && e.parameter && e.parameter.prefix) || "").trim();

  if (prefix) {
    return ContentService
      .createTextOutput(prefix + "(" + text + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizePlayerId_(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 12);
}

function normalizeAchievementsJson_(value) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return JSON.stringify(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    return "[]";
  }
}

function toNumber_(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toTimestamp_(value) {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}
