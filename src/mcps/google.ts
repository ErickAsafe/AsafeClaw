import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";

const server = new Server(
  {
    name: "sandeclaw-google-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configure Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN || null,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });
const gmail = google.gmail({ version: "v1", auth: oauth2Client });
const drive = google.drive({ version: "v3", auth: oauth2Client });
const sheets = google.sheets({ version: "v4", auth: oauth2Client });

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_calendar_events",
        description: "List upcoming events from Google Calendar",
        inputSchema: {
          type: "object",
          properties: {
            maxResults: { type: "number", description: "Max events to return", default: 10 },
          },
        },
      },
      {
        name: "create_calendar_event",
        description: "Create a new event in Google Calendar",
        inputSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            description: { type: "string" },
            startTime: { type: "string", description: "ISO string, e.g. 2026-06-16T15:00:00-03:00" },
            endTime: { type: "string", description: "ISO string, e.g. 2026-06-16T16:00:00-03:00" },
          },
          required: ["summary", "startTime", "endTime"],
        },
      },
      {
        name: "search_gmail",
        description: "Search emails in Gmail",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Gmail search query (e.g. 'is:unread')" },
            maxResults: { type: "number", default: 5 },
          },
          required: ["query"],
        },
      },
      {
        name: "search_drive",
        description: "Search files in Google Drive",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Drive search query" },
          },
          required: ["query"],
        },
      },
      {
        name: "create_drive_file",
        description: "Create a new text file in Google Drive",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the file (e.g. Teste.txt)" },
            content: { type: "string", description: "Text content of the file" },
          },
          required: ["name", "content"],
        },
      },
      {
        name: "create_google_sheet",
        description: "Create a new Google Sheet",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the new spreadsheet" },
          },
          required: ["title"],
        },
      },
      {
        name: "append_to_google_sheet",
        description: "Append rows to a Google Sheet",
        inputSchema: {
          type: "object",
          properties: {
            spreadsheetId: { type: "string", description: "The ID of the spreadsheet" },
            range: { type: "string", description: "The A1 notation of a range to search for a logical table of data. Values are appended after the last row of the table. e.g. 'Sheet1!A:B'" },
            values: { type: "array", items: { type: "array", items: { type: "string" } }, description: "2D array of values to append, e.g. [['Row1Col1', 'Row1Col2']]" },
          },
          required: ["spreadsheetId", "range", "values"],
        },
      },
      {
        name: "add_google_sheet_tab",
        description: "Add a new tab (sheet) to an existing Google Spreadsheet",
        inputSchema: {
          type: "object",
          properties: {
            spreadsheetId: { type: "string" },
            title: { type: "string", description: "Name of the new tab, e.g. 'Dashboard'" },
          },
          required: ["spreadsheetId", "title"],
        },
      },
      {
        name: "render_dashboard_widgets",
        description: "Render a complete dashboard UI using a Declarative Widget Engine. Builds Scorecards, Titles, Table Headers, Charts, and Colored Dropdowns in a single API call.",
        inputSchema: {
          type: "object",
          properties: {
            spreadsheetId: { type: "string" },
            sheetId: { type: "number", description: "Default 0" },
            theme: { type: "string", enum: ["emerald", "ocean", "midnight", "sunset"] },
            layout: { type: "string", enum: ["STANDARD", "COMPACT", "WIDE"], description: "Default is STANDARD" },
            header: {
              type: "object",
              properties: { title: { type: "string" }, subtitle: { type: "string" } },
              required: ["title"]
            },
            filters: {
              type: "array",
              items: { type: "string", enum: ["DATE_RANGE"] },
              description: "Optional interactive filters"
            },
            scorecards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  value: { type: "string" },
                  formulaRange: { type: "string" }
                },
                required: ["title"]
              }
            },
            charts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  chartType: { type: "string", enum: ["BAR", "LINE", "PIE"] },
                  dataSheetId: { type: "number" },
                  dataStartRow: { type: "number" },
                  dataEndRow: { type: "number" },
                  dataStartCol: { type: "number" },
                  dataEndCol: { type: "number" }
                },
                required: ["title", "chartType"]
              }
            },
            tables: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startRow: { type: "number", description: "0-indexed row where table data starts (Header)" },
                  endRow: { type: "number" },
                  startCol: { type: "number" },
                  endCol: { type: "number" },
                  statusColumnIndex: { type: "number", description: "0-indexed column within the sheet for dropdowns" },
                  statusOptions: { type: "array", items: { type: "string" } }
                },
                required: ["startRow", "endRow", "startCol", "endCol"]
              }
            }
          },
          required: ["spreadsheetId", "theme", "header"],
        },
      }
    ],
  };
});

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#000000");
  return result ? {
    red: parseInt(result[1], 16) / 255,
    green: parseInt(result[2], 16) / 255,
    blue: parseInt(result[3], 16) / 255
  } : { red: 0.2, green: 0.2, blue: 0.2 };
}

const THEMES: Record<string, any> = {
  emerald: { primary: "#059669", secondary: "#ecfdf5", text: "#064e3b", danger: "#fee2e2", dangerText: "#991b1b", warning: "#fef3c7", warningText: "#92400e", success: "#d1fae5", successText: "#065f46", border: "#d1d5db" },
  ocean: { primary: "#2563eb", secondary: "#eff6ff", text: "#1e3a8a", danger: "#fee2e2", dangerText: "#991b1b", warning: "#fef3c7", warningText: "#92400e", success: "#d1fae5", successText: "#065f46", border: "#d1d5db" },
  midnight: { primary: "#1e293b", secondary: "#f8fafc", text: "#0f172a", danger: "#fee2e2", dangerText: "#991b1b", warning: "#fef3c7", warningText: "#92400e", success: "#d1fae5", successText: "#065f46", border: "#d1d5db" },
  sunset: { primary: "#ea580c", secondary: "#fff7ed", text: "#7c2d12", danger: "#fee2e2", dangerText: "#991b1b", warning: "#fef3c7", warningText: "#92400e", success: "#d1fae5", successText: "#065f46", border: "#d1d5db" }
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "list_calendar_events") {
      const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: request.params.arguments?.maxResults as number || 10,
        singleEvents: true,
        orderBy: "startTime",
      });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data.items, null, 2) }],
      };
    }

    if (request.params.name === "create_calendar_event") {
      const args = request.params.arguments as any;
      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: args.summary,
          description: args.description,
          start: { dateTime: args.startTime },
          end: { dateTime: args.endTime },
        },
      });
      return {
        content: [{ type: "text", text: `Event created: ${res.data.htmlLink}` }],
      };
    }

    if (request.params.name === "search_gmail") {
      const args = request.params.arguments as any;
      const res = await gmail.users.messages.list({
        userId: "me",
        q: args.query,
        maxResults: args.maxResults || 5,
      });
      
      const messages = res.data.messages || [];
      const fullMessages = await Promise.all(
        messages.map(async (m) => {
          const msg = await gmail.users.messages.get({ userId: "me", id: m.id! });
          const subjectHeader = msg.data.payload?.headers?.find((h: any) => h.name === 'Subject');
          const fromHeader = msg.data.payload?.headers?.find((h: any) => h.name === 'From');
          return {
            id: m.id,
            snippet: msg.data.snippet,
            subject: subjectHeader?.value,
            from: fromHeader?.value
          };
        })
      );
      
      return {
        content: [{ type: "text", text: JSON.stringify(fullMessages, null, 2) }],
      };
    }
    
    if (request.params.name === "search_drive") {
      const args = request.params.arguments as any;
      
      // Se a query não contiver os operadores nativos do Drive, assume que é uma busca simples por nome
      let finalQuery = args.query;
      if (!finalQuery.includes("contains") && !finalQuery.includes("=") && !finalQuery.includes(" in ")) {
        finalQuery = `name contains '${finalQuery}'`;
      }

      const res = await drive.files.list({
        q: finalQuery,
        pageSize: 10,
        fields: "files(id, name, mimeType, webViewLink)",
      });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data.files, null, 2) }],
      };
    }

    if (request.params.name === "create_drive_file") {
      const args = request.params.arguments as any;
      const res = await drive.files.create({
        requestBody: {
          name: args.name,
          mimeType: "text/plain",
        },
        media: {
          mimeType: "text/plain",
          body: args.content,
        },
        fields: "id, name, webViewLink",
      });
      return {
        content: [{ type: "text", text: `File created successfully! Link: ${res.data.webViewLink}` }],
      };
    }

    if (request.params.name === "create_google_sheet") {
      const args = request.params.arguments as any;
      const res = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: args.title,
          },
        },
      });
      return {
        content: [{ type: "text", text: `Spreadsheet created successfully! ID: ${res.data.spreadsheetId}\nURL: ${res.data.spreadsheetUrl}` }],
      };
    }

    if (request.params.name === "append_to_google_sheet") {
      const args = request.params.arguments as any;
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId: args.spreadsheetId,
        range: args.range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: args.values,
        },
      });
      return {
        content: [{ type: "text", text: `Successfully appended ${res.data.updates?.updatedRows} rows and ${res.data.updates?.updatedCells} cells.` }],
      };
    }

    if (request.params.name === "add_google_sheet_tab") {
      const args = request.params.arguments as any;
      const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: args.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: args.title
                }
              }
            }
          ]
        }
      });
      return {
        content: [{ type: "text", text: `Tab '${args.title}' added successfully! Sheet ID: ${res.data.replies?.[0].addSheet?.properties?.sheetId}` }],
      };
    }

    if (request.params.name === "render_dashboard_widgets") {
      const args = request.params.arguments as any;
      const sId = args.sheetId || 0;
      const themeColors = THEMES[args.theme] || THEMES["ocean"];
      
      const requests: any[] = [];
      const valuesUpdates: any[] = [];

      // 1. Hide gridlines for the entire sheet for a clean dashboard look
      requests.push({
        updateSheetProperties: {
          properties: { sheetId: sId, gridProperties: { hideGridlines: true } },
          fields: "gridProperties.hideGridlines"
        }
      });

      // Auto-Layout Configuration (STANDARD: 8 columns wide, starting at B2)
      const START_COL = 1;
      const TOTAL_COLS = 8;
      const END_COL = START_COL + TOTAL_COLS;
      
      let currentRow = 1;

      // 1. Safeguard against old LLM context hallucinating the 'widgets' array
      if (args.widgets) {
        throw new Error("❌ ENGINE ERROR: You used the deprecated 'widgets' array syntax (startRow, endCol, etc). The Motor de Auto-Layout is active! You must use the new semantic payload syntax (header, filters, scorecards, charts, tables) as specified in the Reversa Sheets Architect SKILL.md. DO NOT SEND 'widgets'.");
      }

      // 2. Header
      if (args.header) {
        const headerRange = { sheetId: sId, startRowIndex: currentRow, endRowIndex: currentRow + 2, startColumnIndex: START_COL, endColumnIndex: END_COL };
        requests.push({ mergeCells: { range: headerRange, mergeType: "MERGE_ALL" } });
        requests.push({
          repeatCell: {
            range: headerRange,
            cell: {
              userEnteredFormat: {
                textFormat: { fontSize: 24, bold: true, foregroundColor: hexToRgb(themeColors.primary) },
                horizontalAlignment: "LEFT", verticalAlignment: "MIDDLE"
              }
            },
            fields: "userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)"
          }
        });
        const titleText = args.header.subtitle ? `${args.header.title}\n${args.header.subtitle}` : args.header.title;
        valuesUpdates.push({ range: `'${sId}'!R${currentRow+1}C${START_COL+1}`, values: [[titleText]] });
        
        requests.push({
          updateCells: {
            rows: [{ values: [{ userEnteredValue: { stringValue: titleText } }] }],
            fields: "userEnteredValue",
            start: { sheetId: sId, rowIndex: currentRow, columnIndex: START_COL }
          }
        });
        currentRow += 3;
      }

      // 3. Filters
      if (args.filters && args.filters.length > 0) {
        let filterCol = START_COL;
        for (const filter of args.filters) {
          if (filter === "DATE_RANGE") {
            const filterRange1 = { sheetId: sId, startRowIndex: currentRow, endRowIndex: currentRow + 1, startColumnIndex: filterCol, endColumnIndex: filterCol + 2 };
            const filterRange2 = { sheetId: sId, startRowIndex: currentRow, endRowIndex: currentRow + 1, startColumnIndex: filterCol + 2, endColumnIndex: filterCol + 4 };
            
            requests.push({ mergeCells: { range: filterRange1, mergeType: "MERGE_ALL" } });
            requests.push({ mergeCells: { range: filterRange2, mergeType: "MERGE_ALL" } });
            
            // Add Date Validation
            requests.push({
              setDataValidation: {
                range: filterRange1,
                rule: { condition: { type: "DATE_IS_VALID" }, showCustomUi: true, strict: false }
              }
            });
            requests.push({
              setDataValidation: {
                range: filterRange2,
                rule: { condition: { type: "DATE_IS_VALID" }, showCustomUi: true, strict: false }
              }
            });
            
            requests.push({
              updateCells: {
                rows: [{ values: [{ userEnteredValue: { stringValue: "Início:" }, userEnteredFormat: { textFormat: { bold: true } } }] }],
                fields: "userEnteredValue,userEnteredFormat(textFormat)",
                start: { sheetId: sId, rowIndex: currentRow, columnIndex: filterCol }
              }
            });
            requests.push({
              updateCells: {
                rows: [{ values: [{ userEnteredValue: { stringValue: "Fim:" }, userEnteredFormat: { textFormat: { bold: true } } }] }],
                fields: "userEnteredValue,userEnteredFormat(textFormat)",
                start: { sheetId: sId, rowIndex: currentRow, columnIndex: filterCol + 2 }
              }
            });
            
            filterCol += 4;
          }
        }
        currentRow += 2;
      }

      // 4. Scorecards
      if (args.scorecards && args.scorecards.length > 0) {
        const scorecardsCount = args.scorecards.length;
        const colsPerCard = Math.floor(TOTAL_COLS / scorecardsCount);
        let currentCardCol = START_COL;
        
        for (const card of args.scorecards) {
          const cardRange = { sheetId: sId, startRowIndex: currentRow, endRowIndex: currentRow + 3, startColumnIndex: currentCardCol, endColumnIndex: currentCardCol + colsPerCard };
          
          requests.push({ mergeCells: { range: cardRange, mergeType: "MERGE_ALL" } });
          const borderStyle = { style: "SOLID", color: hexToRgb(themeColors.border) };
          requests.push({ updateBorders: { range: cardRange, top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle } });
          requests.push({
            repeatCell: {
              range: cardRange,
              cell: { userEnteredFormat: { backgroundColor: hexToRgb(themeColors.secondary), horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE" } },
              fields: "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment)"
            }
          });

          let content = card.formulaRange ? `="${card.title}" & CHAR(10) & SUM(${card.formulaRange})` : `${card.title}\n${card.value || "0"}`;
          requests.push({
            updateCells: {
              rows: [{ values: [{
                userEnteredValue: content.startsWith("=") ? { formulaValue: content } : { stringValue: content },
                userEnteredFormat: { textFormat: { fontSize: 14, bold: true, foregroundColor: hexToRgb(themeColors.text) }, wrapStrategy: "WRAP" }
              }]}],
              fields: "userEnteredValue,userEnteredFormat(textFormat,wrapStrategy)",
              start: { sheetId: sId, rowIndex: currentRow, columnIndex: currentCardCol }
            }
          });
          
          currentCardCol += colsPerCard;
        }
        currentRow += 4;
      }

      // 5. Charts
      if (args.charts && args.charts.length > 0) {
        const chartsCount = args.charts.length;
        const colsPerChart = Math.floor(TOTAL_COLS / chartsCount);
        let currentChartCol = START_COL;
        
        for (const chart of args.charts) {
          let domainSources = [];
          if (chart.dataStartRow !== undefined && chart.dataEndRow !== undefined && chart.dataStartCol !== undefined && chart.dataEndCol !== undefined) {
             domainSources.push({
               sheetId: chart.dataSheetId || sId,
               startRowIndex: chart.dataStartRow,
               endRowIndex: chart.dataEndRow,
               startColumnIndex: chart.dataStartCol,
               endColumnIndex: chart.dataEndCol
             });
          }

          if (domainSources.length > 0) {
            requests.push({
              addChart: {
                chart: {
                  spec: {
                    title: chart.title || "Gráfico",
                    basicChart: {
                      chartType: chart.chartType || "BAR",
                      legendPosition: "BOTTOM_LEGEND",
                      domains: [{ domain: { sourceRange: { sources: domainSources } } }] 
                    }
                  },
                  position: { overlayPosition: { anchorCell: { sheetId: sId, rowIndex: currentRow, columnIndex: currentChartCol }, widthPixels: colsPerChart * 100, heightPixels: 300 } }
                }
              }
            });
          }
          currentChartCol += colsPerChart;
        }
        currentRow += 10;
      }

      // 6. Tables (Using provided grid coordinates since data is already there)
      if (args.tables && args.tables.length > 0) {
        for (const table of args.tables) {
          const headerRange = { sheetId: sId, startRowIndex: table.startRow, endRowIndex: table.startRow + 1, startColumnIndex: table.startCol, endColumnIndex: table.endCol };
          
          requests.push({
            repeatCell: {
              range: headerRange,
              cell: {
                userEnteredFormat: {
                  backgroundColor: hexToRgb(themeColors.primary),
                  textFormat: { foregroundColor: hexToRgb("#ffffff"), bold: true },
                  horizontalAlignment: "CENTER"
                }
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
            }
          });

          if (table.statusColumnIndex !== undefined && table.statusOptions && table.statusOptions.length > 0) {
            const statusRange = { sheetId: sId, startRowIndex: table.startRow + 1, endRowIndex: table.endRow, startColumnIndex: table.statusColumnIndex, endColumnIndex: table.statusColumnIndex + 1 };
            const conditionValues = table.statusOptions.map((v: string) => ({ userEnteredValue: v }));
            
            requests.push({
              setDataValidation: {
                range: statusRange,
                rule: { condition: { type: "ONE_OF_LIST", values: conditionValues }, showCustomUi: true, strict: true }
              }
            });

            table.statusOptions.forEach((opt: string) => {
              let bgColor = themeColors.secondary;
              let txtColor = themeColors.text;
              const lower = opt.toLowerCase();
              if (lower.includes("pago") || lower.includes("concluído") || lower.includes("aprovado") || lower.includes("success")) {
                bgColor = themeColors.success; txtColor = themeColors.successText;
              } else if (lower.includes("pendente") || lower.includes("andamento") || lower.includes("espera")) {
                bgColor = themeColors.warning; txtColor = themeColors.warningText;
              } else if (lower.includes("atrasado") || lower.includes("cancelado") || lower.includes("erro") || lower.includes("falha")) {
                bgColor = themeColors.danger; txtColor = themeColors.dangerText;
              }

              requests.push({
                addConditionalFormatRule: {
                  rule: {
                    ranges: [statusRange],
                    booleanRule: {
                      condition: { type: "TEXT_EQ", values: [{ userEnteredValue: opt }] },
                      format: { backgroundColor: hexToRgb(bgColor), textFormat: { foregroundColor: hexToRgb(txtColor), bold: true } }
                    }
                  },
                  index: 0
                }
              });
            });
          }
        }
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: { requests }
        });
      }

      return {
        content: [{ type: "text", text: `Dashboard Widgets rendered successfully with theme '${args.theme}'!` }],
      };
    }

    throw new Error("Tool not found");
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Custom Google MCP server running on stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
