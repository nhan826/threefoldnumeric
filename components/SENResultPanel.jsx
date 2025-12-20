import React, { useState } from "react";
import { exportAll } from "../sen";

export default function ResultPanel({ result, config }) {
  const [activeFormat, setActiveFormat] = useState("JSON");
  const [copySuccess, setCopySuccess] = useState(false);

  if (!result) {
    return (
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl text-center">
        <p className="text-slate-400 text-lg">📭 No result yet. Configure operands and click Calculate.</p>
      </div>
    );
  }

  const exports = exportAll(result, config);

  const formatDisplay = {
    JSON: exports.sen_json,
    "Pole String": exports.pole_string,
    "Axis-Pole": exports.axis_pole_string,
    Decimal: exports.scalar_decimal,
    Rational: `${exports.scalar_num} / ${exports.scalar_den}`,
  };

  const handleDownload = (filename, content) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatDisplay[activeFormat]);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const renderFlags = () => {
    const { flags } = result;
    const activeFlags = Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return (
      <div className="flex flex-wrap gap-2">
        {activeFlags.length === 0 ? (
          <span className="text-slate-400 text-sm">✓ No flags</span>
        ) : (
          activeFlags.map((flag) => (
            <span
              key={flag}
              className="bg-yellow-600 text-yellow-100 px-3 py-1 rounded-full text-xs font-bold"
            >
              ⚠️ {flag}
            </span>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 space-y-6 border border-slate-700 shadow-2xl">
      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
          <span className="text-3xl">✨</span> Result
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-blue-500">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wide block mb-2">
              Type
            </span>
            <div className="text-white font-bold text-lg font-mono">
              {result.special === 0
                ? "NORMAL"
                : result.special === 1
                  ? "INF"
                  : "NAN"}
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-cyan-500">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide block mb-2">
              Sign
            </span>
            <div className="text-white font-bold text-lg font-mono">
              {result.sign === 1 ? "+" : "−"}
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-purple-500">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wide block mb-2">
              Scale (E)
            </span>
            <div className="text-white font-bold text-lg font-mono">
              {result.scale}
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-orange-500">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wide block mb-2">
              Mantissa Len
            </span>
            <div className="text-white font-bold text-lg font-mono">
              {result.mant.digits.length}
            </div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-3">
            Status Flags
          </span>
          {renderFlags()}
        </div>
      </div>

      <div className="border-t-2 border-slate-700 pt-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
          <span className="text-3xl">📤</span> Export
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(formatDisplay).map((format) => (
            <button
              key={format}
              onClick={() => setActiveFormat(format)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition transform ${
                activeFormat === format
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white scale-105 shadow-lg"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
              }`}
            >
              {format}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border-2 border-slate-700 mb-4 max-h-48 overflow-auto">
          <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap break-words leading-relaxed">
            {formatDisplay[activeFormat]}
          </pre>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              handleDownload(
                `result-${Date.now()}.${activeFormat === "JSON" ? "json" : "txt"}`,
                formatDisplay[activeFormat]
              )
            }
            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3 rounded-lg font-bold text-sm transition transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>⬇️</span> Download
          </button>
          <button
            onClick={handleCopy}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition transform hover:scale-105 flex items-center justify-center gap-2 ${
              copySuccess
                ? "bg-green-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600"
            }`}
          >
            <span>{copySuccess ? "✓" : "📋"}</span> {copySuccess ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
