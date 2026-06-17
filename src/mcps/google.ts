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
        name: "format_google_sheet",
        description: "Apply professional formatting to a Google Sheet (freezes top row, makes headers bold with background color, and optionally hides gridlines)",
        inputSchema: {
          type: "object",
          properties: {
            spreadsheetId: { type: "string" },
            sheetId: { type: "number", description: "The numeric ID of the sheet (default: 0 for the first sheet)" },
            hideGridlines: { type: "boolean", description: "Set to true for Dashboards to hide the default gridlines" },
            headerColorHex: { type: "string", description: "Hex color for header background, e.g. '#2c3e50'." },
            headerTextColorHex: { type: "string", description: "Hex color for header text, e.g. '#ffffff'." },
          },
          required: ["spreadsheetId"],
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

    if (request.params.name === "format_google_sheet") {
      const args = request.params.arguments as any;
      const sId = args.sheetId || 0;
      
      const requests: any[] = [];

      // Formatting the header
      if (args.headerColorHex) {
        requests.push({
          repeatCell: {
            range: { sheetId: sId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: hexToRgb(args.headerColorHex),
                textFormat: { 
                  foregroundColor: hexToRgb(args.headerTextColorHex || "#ffffff"), 
                  bold: true 
                }
              }
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)"
          }
        });
        
        // Freeze top row
        requests.push({
          updateSheetProperties: {
            properties: {
              sheetId: sId,
              gridProperties: { frozenRowCount: 1 }
            },
            fields: "gridProperties.frozenRowCount"
          }
        });
      }

      // Hide gridlines
      if (args.hideGridlines) {
        requests.push({
          updateSheetProperties: {
            properties: {
              sheetId: sId,
              gridProperties: { hideGridlines: true }
            },
            fields: "gridProperties.hideGridlines"
          }
        });
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: { requests }
        });
      }

      return {
        content: [{ type: "text", text: `Spreadsheet formatted successfully!` }],
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
