import { Send, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const methodColors = {
  GET: "bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-500",
  POST: "bg-green-100 text-green-800 border-green-200 focus:ring-green-500",
  PUT: "bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-500",
  PATCH: "bg-purple-100 text-purple-800 border-purple-200 focus:ring-purple-500",
  DELETE: "bg-red-100 text-red-800 border-red-200 focus:ring-red-500",
};

function Input({ url, setUrl, method, setMethod, body, setBody, sendRequest, loading }) {
  const [isBodyValid, setIsBodyValid] = useState(true);

  useEffect(() => {
    if (method === "GET") return;
    try {
      JSON.parse(body);
      setIsBodyValid(true);
    } catch (e) {
      setIsBodyValid(false);
    }
  }, [body, method]);

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md">
      <div className="flex gap-4 items-center">
        {/* Method Select */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          aria-label="Select HTTP method"
          className={`px-4 py-2 rounded border focus:outline-none focus:none transition-colors duration-200 font-medium ${methodColors[method]}`}
        >
          {Object.keys(methodColors).map((method) => (
            <option key={method} value={method} className="bg-white">
              {method}
            </option>
          ))}
        </select>

        {/* URL Input */}
        <input
          type="url"
          placeholder="https://api.example.com/resource"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Enter request URL"
          className="px-4 py-3 border rounded focus:outline-none focus:none font-mono transition-colors duration-200 w-full"
        />

        {/* Send Button */}
        <button
          onClick={sendRequest}
          disabled={loading || !isBodyValid}
          aria-label={loading ? "Sending request" : "Send request"}
          className={`px-4 py-3 border rounded flex items-center justify-center transition-colors duration-200 ${
            loading || !isBodyValid
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Request Body Input */}
      {method !== "GET" && (
        <div className="flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Enter JSON body (${method} request)`}
            aria-label="Enter request body"
            className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 font-mono transition-colors duration-200 min-h-[120px] ${
              isBodyValid
                ? "focus:ring-blue-500"
                : "border-red-500 focus:ring-red-500"
            }`}
          />
          {!isBodyValid && (
            <span className="text-red-600 text-sm">
              Invalid JSON format
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Input;