import React, { useState, useEffect } from "react";
import { buildCoreTestSuite, runTestSuite } from "../sen";

export default function TestRunner({ config }) {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [filterTag, setFilterTag] = useState("all");
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const suite = buildCoreTestSuite(config);
    const tags = new Set();
    suite.forEach((test) => {
      if (test.tags) {
        test.tags.forEach((tag) => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
  }, [config]);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const suite = buildCoreTestSuite(config);
      const results = runTestSuite(suite, config);
      setTestResults(results);
    } catch (error) {
      console.error("Test execution error:", error);
      alert("❌ Error running tests: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults = testResults
    ? testResults.filter((test) => {
        if (filterTag === "all") return true;
        return test.tags && test.tags.includes(filterTag);
      })
    : [];

  const passCount = filteredResults.filter((t) => t.passed).length;
  const failCount = filteredResults.length - passCount;

  const exportAsJSON = () => {
    const content = JSON.stringify(testResults, null, 2);
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", `test-results-${Date.now()}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportAsCSV = () => {
    const headers = ["Name", "Operation", "Passed", "Error"];
    const rows = testResults.map((t) => [
      t.name,
      t.operation,
      t.passed ? "YES" : "NO",
      t.error || "",
    ]);

    const csv =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n";

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    );
    element.setAttribute("download", `test-results-${Date.now()}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
          <span className="text-3xl">🧪</span> Test Suite
        </h2>

        <button
          onClick={runTests}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-500 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 disabled:scale-100 text-lg shadow-lg mb-6"
        >
          {isRunning ? "⏳ Running Tests..." : "▶️ Run Full Test Suite"}
        </button>

        {testResults && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-center border-2 border-slate-600 shadow-lg">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {testResults.length}
                </div>
                <div className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
                  Total Tests
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-lg p-6 text-center border-2 border-green-600 shadow-lg">
                <div className="text-4xl font-bold text-green-200 mb-2">
                  {passCount}
                </div>
                <div className="text-green-200 text-sm font-semibold uppercase tracking-wide">
                  ✓ Passed
                </div>
              </div>
              <div
                className={`rounded-lg p-6 text-center border-2 shadow-lg ${
                  failCount > 0
                    ? "bg-gradient-to-br from-red-700 to-red-800 border-red-600"
                    : "bg-gradient-to-br from-green-700 to-green-800 border-green-600"
                }`}
              >
                <div
                  className={`text-4xl font-bold mb-2 ${
                    failCount > 0 ? "text-red-200" : "text-green-200"
                  }`}
                >
                  {failCount}
                </div>
                <div
                  className={`text-sm font-semibold uppercase tracking-wide ${
                    failCount > 0 ? "text-red-200" : "text-green-200"
                  }`}
                >
                  {failCount > 0 ? "✗ Failed" : "All Pass"}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportAsJSON}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-lg font-bold text-sm transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>📄</span> Export JSON
              </button>
              <button
                onClick={exportAsCSV}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white py-3 rounded-lg font-bold text-sm transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>📊</span> Export CSV
              </button>
            </div>
          </>
        )}
      </div>

      {testResults && (
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
          <h3 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">📋</span> Results
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
              Filter by Tag
            </label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border-2 border-cyan-500 focus:border-cyan-400 focus:outline-none hover:border-cyan-400 transition font-medium"
            >
              <option value="all">🏷️ All Tests ({testResults.length})</option>
              {allTags.map((tag) => {
                const count = testResults.filter(
                  (t) => t.tags && t.tags.includes(tag)
                ).length;
                return (
                  <option key={tag} value={tag}>
                    {tag} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredResults.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No tests match this filter
              </div>
            ) : (
              filteredResults.map((test, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 transition transform hover:scale-[1.01] ${
                    test.passed
                      ? "bg-slate-800 border-green-500 hover:bg-slate-700"
                      : "bg-slate-800 border-red-500 hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm flex items-center gap-2">
                        {test.passed ? "✅" : "❌"}
                        <span className="truncate">{test.name}</span>
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        <span className="bg-slate-700 px-2 py-1 rounded inline-block mr-2">
                          {test.operation}
                        </span>
                        {test.tags && test.tags.length > 0 && (
                          <span className="text-slate-500">
                            {test.tags.join(", ")}
                          </span>
                        )}
                      </div>
                      {test.error && (
                        <div className="text-red-300 text-xs mt-2 bg-red-900 bg-opacity-30 p-2 rounded">
                          <strong>Error:</strong> {test.error}
                        </div>
                      )}
                    </div>
                    <div
                      className={`font-bold text-lg flex-shrink-0 ${
                        test.passed ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {test.passed ? "✓" : "✗"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
