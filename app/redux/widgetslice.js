import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  widgets: [],  
  layout: [],  
};

const widgetsSlice = createSlice({
  name: "widgets",
  initialState,
  reducers: {
    setWidgets: (state, action) => {
      state.widgets = action.payload;
    },
    addWidget: (state, action) => {
      state.widgets.push(action.payload);
      state.layout.push({
        i: action.payload.id,
        x: 0,
        y: Infinity,   
        w: 3,          
        h: 2,          
      });
    },

    updateLayout: (state, action) => {
      state.layout = action.payload;
    },
    removeWidget: (state, action) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
      state.layout = state.layout.filter(l => l.i !== action.payload);
    },
    updateWidgetData: (state, action) => {
      const { id, parsedData, rawData } = action.payload;
       const widget = state.widgets.find((w) => w.id === id);
      if (widget) {
        widget.parsedData = parsedData;
        widget.rawData = rawData;
      }
    },
  },
});

export const { setWidgets, addWidget, updateLayout, removeWidget, updateWidgetData } = widgetsSlice.actions;
export default widgetsSlice.reducer;
