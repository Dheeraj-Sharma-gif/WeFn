"use client";

import { FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { setWidgets, addWidget, updateLayout, updateWidgetData } from "../redux/widgetslice";
import Widget from "../components/widgets/Widget";
import WidgetModal from "../components/widgets/WidgetModal";
import { parseResponse } from "../components/widgets/WidgetModal";
import DashboardPolling from "./polling";
export default function Dashboard() {
  const dispatch = useDispatch();
  const widgets = useSelector((state) => state.widgets.widgets);
  const layout = useSelector((state) => state.widgets.layout);

  const [screenWidth, setScreenWidth] = useState(1200);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState(null);
  const [apiWarning, setApiWarning] = useState(""); 
  
   useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      setToken(t);
    }
  }, []);

   const fetchWidgetsAPI = async (token) => {
    const res = await fetch("/api/widgets/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();   
     return data;          
  };

  const createWidgetAPI = async (widgetWithLayout, token) => {
  const res = await fetch("/api/widgets/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, widget: widgetWithLayout }),
  });
  return res.json();
};


  const deleteWidgetAPI = async (widgetId, token) => {
    const res = await fetch("/api/widgets/delete", {
      method: "POST",
      body: JSON.stringify({ widgetId, token }),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  };

  const updateLayoutAPI = async (newLayout, token) => {
    const res = await fetch("/api/widgets/layout", {
      method: "POST",
      body: JSON.stringify({ newLayout, token }),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  };
  const getResponsiveLayout = (widgetId) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let vw, vh;
  if (screenWidth >= 768) { // md breakpoint
    vw = Math.round(screenWidth * 0.33);
    vh = Math.round(screenHeight * 0.33);
  } else {
    vw = Math.round(screenWidth * 0.6);
    vh = Math.round(screenHeight * 0.6);
  }

  const cols = 12;
  const colWidth = screenWidth / cols;
  const w = Math.max(1, Math.round(vw / colWidth));
  const h = Math.max(1, Math.round(vh / 100));

  return {
    i: widgetId,
    x: 0,
    y: Infinity,
    w,
    h,
    minW: w,
    minH: h,
    maxW: w,
    maxH: h,
  };
};

  useEffect(() => {
    const fetchWidgets = async () => {
      if (!token) return;
      try {
        const widgetsFromDB = await fetchWidgetsAPI(token);
        dispatch(setWidgets(widgetsFromDB));

        const savedLayout = widgetsFromDB.map((w) => getResponsiveLayout(w.id));
        dispatch(updateLayout(savedLayout));
      } catch (err) {
        console.error("Failed to fetch widgets:", err);
      }
    };
    fetchWidgets();
  }, [token, dispatch]);

   useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  useEffect(() => {
  if (widgets.length === 0) return;

  console.log("Starting polling...");

  const intervals = widgets.map((widget) => {
    if (!widget.apiUrl || !widget.refreshSec) return null;

    const intervalId = setInterval(async () => {
      try {
        console.log("Polling widget:", widget.name);

        const res = await fetch(widget.apiUrl);
        const data = await res.json();

         if (data?.Information) {
          console.warn(`Skipping update for widget ${widget.name}:`, data.Information);
          setApiWarning(data.Information); 
          return; 
        }

        const parsed = parseResponse(data);

        if (parsed && parsed.length > 0) {
          dispatch(updateWidgetData({
            id: widget.id,
            parsedData: parsed,
            rawData: data,
          }));
        } else {
           console.log(`No valid parsed data for widget ${widget.name}, keeping existing data`);
        }
      } catch (err) {
        console.error("Polling error for widget", widget.name, err);
       }
    }, widget.refreshSec * 1000);

    return intervalId;
  });

  return () => intervals.forEach((id) => id && clearInterval(id));
}, [widgets, dispatch]);


  
  const handleAddWidget = async (widget) => {
  if (!widget.id) widget.id = crypto.randomUUID();
 
  const defaultLayout = getResponsiveLayout(widget.id); 
   
  dispatch(addWidget(widget));
  dispatch(updateLayout([...layout, defaultLayout]));
  setShowModal(false);

  if (token) {
    try {
      const { id, ...widgetWithoutId } = widget;   
       await createWidgetAPI(widgetWithoutId, token);
 
       await updateLayoutAPI([...layout, defaultLayout], token);
    } catch (err) {
      console.error("Failed to save widget:", err);
    }
  }
};



   const handleDeleteWidget = async (id) => {
    dispatch(setWidgets(widgets.filter((w) => w.id !== id)));
    dispatch(updateLayout(layout.filter((l) => l.i !== id)));

    if (token) {
      try {
        await deleteWidgetAPI(id, token);
      } catch (err) {
        console.error("Failed to delete widget:", err);
      }
    }
  };

   const handleLayoutChange = async (newLayout) => {
    dispatch(updateLayout(newLayout));
    if (token) {
      try {
        await updateLayoutAPI(newLayout, token);
      } catch (err) {
        console.error("Failed to update layout:", err);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Widget
        </button>
      </div>
      {apiWarning && (
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-300 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4"
      >
        <span className="font-semibold">⚠️ {apiWarning}</span>
        <button
          onClick={() => setApiWarning("")}
          className="ml-auto text-white font-bold hover:text-gray-100"
        >
          ×
        </button>
      </div>
    )}



      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={screenWidth}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
      >
        {widgets.map((widget) => (
          <div key={widget.id} data-grid={layout.find((l) => l.i === widget.id)}>
            <div className="relative border rounded-lg p-2 bg-white dark:bg-neutral-900 shadow overflow-auto">
              <Widget widget={widget} />
              <button
                onClick={() => handleDeleteWidget(widget.id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1"
              >
                <FaTrash size={16} />
              </button>
            </div>
          </div>
        ))}
      </GridLayout>
<DashboardPolling />

      {showModal && (
        <WidgetModal onClose={() => setShowModal(false)} onAdd={handleAddWidget} />
      )}
    </div>
  );
}
