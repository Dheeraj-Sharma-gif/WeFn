import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateWidgetData } from "../redux/widgetslice"; // we will add this action
import { parseResponse } from "../components/widgets/WidgetModal";

export default function DashboardPolling() {
  const dispatch = useDispatch();
  const widgets = useSelector((state) => state.widgets.widgets);

  useEffect(() => {
    const intervals = widgets.map((widget) => {
      if (!widget.apiUrl || !widget.refreshSec) return null;

      const intervalId = setInterval(async () => {
        try {
          const res = await fetch(widget.apiUrl);
          const data = await res.json();
          const parsed = parseResponse(data); // reuse your parseResponse
          if (parsed && parsed.length > 0) {
            dispatch(updateWidgetData({ id: widget.id, parsedData: parsed, rawData: data }));
          }
        } catch (err) {
          console.error("Polling error for widget", widget.name, err);
        }
      }, widget.refreshSec * 1000);

      return intervalId;
    });

    return () => intervals.forEach((id) => id && clearInterval(id));
  }, [widgets, dispatch]);

  return null; // This hook doesn't render anything
}