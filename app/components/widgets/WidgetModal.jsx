 "use client";
import { useState } from "react";
import { v4 as uuid } from "uuid";

function detectType(json) {
  const keys = Object.keys(json);
  if (keys.some(k => k.includes("Time Series"))) return "timeseries";
  if (keys.some(k => k.includes("Technical Analysis"))) return "indicator";
  if (json["Realtime Currency Exchange Rate"]) return "exchange_rate";
  if (json["Rank A: Real-Time Performance"]) return "sector";
  return "raw";
}

function parseTimeseries(json) {
  const key = Object.keys(json).find(k => k.includes("Time Series"));
  const series = json[key] || {};
  return Object.entries(series).map(([timestamp, values]) => ({
    timestamp,
    open: parseFloat(values["1. open"]),
    high: parseFloat(values["2. high"]),
    low: parseFloat(values["3. low"]),
    close: parseFloat(values["4. close"]),
    volume: values["5. volume"] ? parseInt(values["5. volume"]) : null,
  }));
}

function parseIndicator(json) {
  const key = Object.keys(json).find(k => k.includes("Technical Analysis"));
  const series = json[key] || {};
  const valueKey = Object.keys(series[Object.keys(series)[0]] || {})[0];
  return Object.entries(series).map(([timestamp, values]) => ({
    timestamp,
    value: parseFloat(values[valueKey]),
  }));
}

function parseExchangeRate(json) {
  const data = json["Realtime Currency Exchange Rate"];
  return [{
    from: data["1. From_Currency Code"],
    to: data["3. To_Currency Code"],
    rate: parseFloat(data["5. Exchange Rate"]),
    bid: parseFloat(data["8. Bid Price"]),
    ask: parseFloat(data["9. Ask Price"]),
    refreshed: data["6. Last Refreshed"],
  }];
}

function parseSector(json) {
  return Object.entries(json)
    .filter(([key]) => key.startsWith("Rank"))
    .flatMap(([periodKey, sectors]) =>
      Object.entries(sectors).map(([sector, value]) => ({
        sector,
        period: periodKey.replace("Rank ", "").replace(" Performance", ""),
        value: parseFloat(value.replace("%", "")),
      }))
    );
}

function parseRaw(json) {
  return [json];
}

export const parseResponse = function (json) {
  const type = detectType(json);
  switch (type) {
    case "timeseries": return parseTimeseries(json);
    case "indicator": return parseIndicator(json);
    case "exchange_rate": return parseExchangeRate(json);
    case "sector": return parseSector(json);
    default: return parseRaw(json);
  }
}

export default function WidgetModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [refreshSec, setRefreshSec] = useState(30);
  const [displayMode, setDisplayMode] = useState("Card");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [apiTested, setApiTested] = useState(false);

  const [xField, setXField] = useState("");
  const [yField, setYField] = useState("");
  const [valueField, setValueField] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);  
  const availableFields = parsedData ? Object.keys(parsedData[0]) : [];

  const handleAdd = () => {
     if (!name || !apiUrl || !parsedData) return;

    const widget = {
      id: uuid(),
      name,
      desc,
      apiUrl,
      refreshSec,
      displayMode,
      parsedData,
      rawData,
      config: { xField, yField, valueField, selectedFields },
    };

    onAdd(widget);
    onClose();
  }; 
  const canAdd = () => {
    if (!name || !apiUrl || !parsedData) return false;

    if (refreshSec <= 0) return false; // 👈 Add this line

    if (displayMode === "Line" || displayMode === "Bar" || displayMode === "Scatter" || displayMode === "Histogram") {
      if (!xField || !yField) return false;
    }

    if (displayMode === "Pie") {
      if (!valueField) return false;
    }

    return true;
  };



  const toggleField = (field) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

const testApi = async () => {
  if (!apiUrl) return;
  setLoading(true);
  setError("");

  try {
    // ✅ Step 0: Validate URL format
    let url;
    try {
      url = new URL(apiUrl);
    } catch {
      setError("Invalid URL format");
      setParsedData(null);
      setApiTested(false);
      setLoading(false);
      return; // stop here instead of throwing
    }

    let data;
    const cached = localStorage.getItem(apiUrl);
    if (cached) {
      data = JSON.parse(cached);
    } else {
      const res = await fetch(url.toString());

      // ✅ Step 1: Check if API actually responded
      if (!res.ok) {
        setError(`API request failed with status ${res.status}`);
        setParsedData(null);
        setApiTested(false);
        return;
      }

      data = await res.json();

      // ✅ Step 2: Check for known error messages
      if (data["Error Message"] || data["Note"] || Object.keys(data).length === 0) {
        setError("Invalid or fake API response");
        setParsedData(null);
        setApiTested(false);
        return;
      }

      localStorage.setItem(apiUrl, JSON.stringify(data));
    }

    setRawData(data);

    const parsed = parseResponse(data);
    if (!parsed || parsed.length === 0) {
      setError("Parser returned no results");
      setParsedData(null);
      setApiTested(false);
      return;
    }

    setParsedData(parsed);
    setApiTested(true);
  } catch (err) {
    console.error(err);
    setError("Unexpected error while testing API");
    setParsedData(null);
    setApiTested(false);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className=" inset-0   flex justify-center items-start pt-20 z-50">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-lg w-96 max-w-full border border-gray-200 dark:border-neutral-700 transition-colors">
        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-gray-100">Add Widget</h2>

        <input
          type="text"
          placeholder="Widget Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100"
        />

        <input
          type="text"
          placeholder="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100"
        />

        <input
          type="text"
          placeholder="API URL"
          value={apiUrl}
          onChange={e => setApiUrl(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100"
        />

        <div className="flex items-center mb-3 gap-2">
          <button
            onClick={testApi}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Testing..." : "Test API"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {apiTested && (
          <div className="mb-3">
            <h3 className="text-gray-800 dark:text-gray-200 text-sm font-semibold mb-2">
              Sample Parsed Data:
            </h3>
            <pre className="bg-gray-100 dark:bg-neutral-800 p-2 rounded-lg max-h-40 overflow-y-auto text-xs">
              {JSON.stringify(parsedData[0], null, 2)}
            </pre>
          </div>
        )}

        <input
          type="number"
          placeholder="Refresh Interval (sec)"
          value={refreshSec}
          onChange={e => {
            const val = Number(e.target.value);
            if (val > 0) setRefreshSec(val);
            else setRefreshSec(1);  
          }}
          min={1}
          className="w-full mb-3 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100"
        />


        <select
          value={displayMode}
          onChange={e => setDisplayMode(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100"
        >
          <option value="Card">Card</option>
          <option value="Table">Table</option>
          <option value="Pie">Pie Chart</option>
          <option value="Line">Line Chart</option>
          <option value="Bar">Bar Chart</option> 
        </select>

        {apiTested && availableFields.length > 0 && displayMode !== "Card" && (
                      <div className="space-y-3 mb-4">
                        {(displayMode === "Line" || displayMode === "Bar" || displayMode === "Scatter" || displayMode === "Histogram") && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">X Axis:</label>
                  <select
                    value={xField}
                    onChange={e => setXField(e.target.value)}
                    className="w-full border rounded p-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">-- Select Field --</option>
                    {availableFields.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                  
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Y Axis:</label>
                  <select
                    value={yField}
                    onChange={e => setYField(e.target.value)}
                    className="w-full border rounded p-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">-- Select Field --</option>
                    {availableFields.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            {displayMode === "Pie" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Value Field:</label>
                <select
                  value={valueField}
                  onChange={e => setValueField(e.target.value)}
                  className="w-full border rounded p-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">-- Select Field --</option>
                  {availableFields.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}
            

            {displayMode === "Table" && (
              <div>
                <label className="block text-sm font-medium mb-1">Select Columns:</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded">
                  {availableFields.map(f => (
                    <label key={f} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(f)}
                        onChange={() => toggleField(f)}
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
          >
            Cancel
          </button>

          {apiTested && (
            <button
              onClick={()=>{  handleAdd(); }}
               disabled={!canAdd()}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  canAdd()
                    ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
