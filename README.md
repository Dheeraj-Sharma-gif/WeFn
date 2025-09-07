# Finance Dashboard with Custom Widgets

A Next.js + MongoDB + Prisma application that allows users to build their own finance dashboard.  
Users can connect to any financial API, parse responses into charts/tables/cards, and have them persist across sessions.  
The dashboard also supports polling APIs at custom intervals to keep data live.


---

## 🚀 Features

### 🔐 Authentication
- Register & login with JWT-based auth.  
- A user can stay logged in on up to 3 devices/sessions at once.  
- To log in again, one session must be logged out.  



### 🖼️ Custom Widgets
- Add widgets by providing an API URL (finance, stock, crypto, forex, etc).  
- Test APIs before adding them.  
- Supported display modes:  
  - Card  
  - Table  
  - Pie Chart  
  - Line Chart  
  - Bar Chart  


### 🔄 Polling
- Widgets can auto-refresh at configurable intervals (e.g., every 20s).  

### 💾 Persistent Layout
- Widgets and their layouts are stored in MongoDB using Prisma.  
- Drag & drop to rearrange widgets (saved automatically).  


### 📊 Smart Parsing
- Automatic detection of API type:  
  - Time Series (e.g., stock OHLC data)  
  - Technical Indicators  
  - Exchange Rates  
  - Sector Performance  
  - Raw JSON fallback  

## 🗄️ Tech Stack
- **Frontend:** Next.js 13 (App Router) + TailwindCSS + React Grid Layout  
- **Backend:** Next.js API routes + Prisma ORM  
- **Database:** MongoDB Atlas (or local MongoDB)  
- **Auth:** JWT tokens with session limits  
- **State Management:** Redux 
---

# 🔎 Parsing Approach & Scalability

- **Detection First**  
  - Use `detectType(json)` to identify data shape.  
  - Looks for AlphaVantage patterns: "Time Series", "Technical Analysis", "Exchange Rate", "Sector".  
  - Falls back to `raw` if no match → ensures any API can still be stored and visualized.  

- **Parser Functions per Type**  
  - `parseTimeseries`: Extracts OHLCV into chart-ready format.  
  - `parseIndicator`: Normalizes technical indicator values.  
  - `parseExchangeRate`: Standardizes forex response to unified schema.  
  - `parseSector`: Converts sector performance into key/value pairs.  
  - `parseRaw`: Default passthrough for unknown APIs.  

- **Why Scalable**  
  - **Modular Parsers** → Adding support for new APIs = just write a new parser and add to switch case.  
  - **Consistent Interface** → All parsers return a uniform array of objects → easy to feed into charts/tables.  
  - **Fallback Safety** → `parseRaw` ensures *no API completely breaks the dashboard*.  
  - **User-Driven Config** → Users pick `xField`, `yField`, `valueField` → works even with unexpected API structures.  
  - **Local Caching** → API results cached in `localStorage` → reduces API quota usage (important for AlphaVantage).  

- **Extending Beyond AlphaVantage**  
  - Same detection strategy can be adapted: check for unique keys in JSON → route to custom parser.  
  - Example: CoinGecko, Yahoo Finance → add `detectType` conditions + new parser functions.  
  - This keeps the system **plug-and-play** without changing frontend logic.  

- **Future Proofing**  
  - Add schema registry: parsers could be dynamically registered at runtime.  
  - Support user-defined parsers (upload JS/JSON rules).  
  - Store metadata in DB for analytics & validation.  

---
## ⚙️ Setup

### 1. Clone repo & install dependencies
```sh
cd folder
npm install
```

### 2. Create .env file 
```sh
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/finance"
JWT_SECRET='secretsuperkey'
```

### 3. Generate prisma client 
```sh
npx prisma generate
```

### 4. Run dev server 
```sh
npm run dev
```

---
## Future Improvements

- OAuth login (Google/GitHub)
- Export/Import widget layouts
- Notifications on API errors
- More visualization types (Candlestick, Heatmap)


