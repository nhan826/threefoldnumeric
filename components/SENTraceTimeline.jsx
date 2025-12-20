import React, { useState } from "react";

const PHASE_ORDER = [
  "SPECIAL",
  "ALIGN",
  "ADD_RAW",
  "MUL_RAW",
  "CARRY",
  "NORMALIZE",
  "ROUND",
  "FINALIZE",
];

const PHASE_COLORS = {
  SPECIAL: "from-red-600 to-red-700",
  ALIGN: "from-blue-600 to-blue-700",
  ADD_RAW: "from-cyan-600 to-cyan-700",
  MUL_RAW: "from-purple-600 to-purple-700",
  CARRY: "from-orange-600 to-orange-700",
  NORMALIZE: "from-green-600 to-green-700",
  ROUND: "from-yellow-600 to-yellow-700",
  FINALIZE: "from-indigo-600 to-indigo-700",
};

export default function TraceTimeline({ events }) {
  const [expandedPhases, setExpandedPhases] = useState(new Set(["ALIGN", "ADD_RAW"]));

  if (!events || events.length === 0) {
    return (
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl text-center">
        <p className="text-slate-400 text-lg">🔇 No trace events captured. Run a calculation.</p>
      </div>
    );
  }

  const groupedByPhase = {};
  PHASE_ORDER.forEach((phase) => {
    groupedByPhase[phase] = [];
  });

  events.forEach((event) => {
    const phase = event.phase || "UNKNOWN";
    if (!groupedByPhase[phase]) {
      groupedByPhase[phase] = [];
    }
    groupedByPhase[phase].push(event);
  });

  const togglePhase = (phase) => {
    const newSet = new Set(expandedPhases);
    if (newSet.has(phase)) {
      newSet.delete(phase);
    } else {
      newSet.add(phase);
    }
    setExpandedPhases(newSet);
  };

  const renderEventDetails = (event) => {
    const lines = [];
    Object.entries(event).forEach(([key, value]) => {
      if (key !== "phase" && key !== "timestamp") {
        if (typeof value === "object") {
          lines.push(
            <div key={key} className="text-slate-300 text-xs mb-2">
              <span className="text-slate-400 font-semibold">{key}:</span>
              <pre className="font-mono text-slate-200 bg-slate-800 rounded p-2 mt-1 overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          );
        } else {
          lines.push(
            <div key={key} className="text-slate-300 text-xs mb-1">
              <span className="text-slate-400 font-semibold">{key}:</span>{" "}
              <span className="font-mono text-slate-100">{String(value)}</span>
            </div>
          );
        }
      }
    });
    return lines;
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center gap-2">
        <span className="text-3xl">📍</span> Execution Trace
      </h2>

      <div className="space-y-3">
        {PHASE_ORDER.map((phase) => {
          const phaseEvents = groupedByPhase[phase];
          if (phaseEvents.length === 0) return null;

          const isExpanded = expandedPhases.has(phase);
          const bgGradient = PHASE_COLORS[phase] || "from-slate-600 to-slate-700";

          return (
            <div
              key={phase}
              className="border-2 border-slate-600 rounded-lg overflow-hidden shadow-lg"
            >
              <button
                onClick={() => togglePhase(phase)}
                className={`w-full bg-gradient-to-r ${bgGradient} px-6 py-4 text-left font-bold text-white flex items-center justify-between transition hover:shadow-lg transform hover:scale-[1.01]`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">
                    {phase === "SPECIAL" && "⚠️"}
                    {phase === "ALIGN" && "🔀"}
                    {phase === "ADD_RAW" && "➕"}
                    {phase === "MUL_RAW" && "✖️"}
                    {phase === "CARRY" && "📦"}
                    {phase === "NORMALIZE" && "⚖️"}
                    {phase === "ROUND" && "🎯"}
                    {phase === "FINALIZE" && "✅"}
                  </span>
                  <span>
                    {phase}{" "}
                    <span className="text-slate-200 text-sm font-normal ml-2">
                      ({phaseEvents.length} event{phaseEvents.length !== 1 ? "s" : ""})
                    </span>
                  </span>
                </span>
                <span className="text-white text-xl transition transform">
                  {isExpanded ? "▼" : "▶"}
                </span>
              </button>

              {isExpanded && (
                <div className="bg-slate-800 p-6 space-y-4 border-t-2 border-slate-600">
                  {phaseEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 p-4 rounded-lg border-l-4 border-blue-400 shadow-md"
                    >
                      <div className="text-xs text-slate-400 mb-3 flex justify-between">
                        <span className="font-bold">Event {idx + 1}</span>
                        {event.timestamp && (
                          <span className="text-slate-500">
                            @ {event.timestamp.toFixed(3)}ms
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">{renderEventDetails(event)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-slate-700 flex gap-3">
        <button
          onClick={() => setExpandedPhases(new Set(PHASE_ORDER))}
          className="flex-1 text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg font-bold transition transform hover:scale-105"
        >
          📖 Expand All
        </button>
        <button
          onClick={() => setExpandedPhases(new Set())}
          className="flex-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold border border-slate-600 transition transform hover:scale-105"
        >
          📕 Collapse All
        </button>
      </div>
    </div>
  );
}
