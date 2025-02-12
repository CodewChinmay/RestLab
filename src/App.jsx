import { useState } from "react";
import Header from "./pages/header.jsx";
import Input from "./pages/input.jsx";

function App() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("{}");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (method === "POST") {
        options.body = body;
      }
      const res = await fetch(url, options);
      const data = await res.json();
      setResponse({ status: res.status, data }); // Include status in the response
    } catch (error) {
      setResponse({ status: "error", data: { error: "Failed to fetch data." } });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen flex flex-col space-y-4">
      <Header />
      <Input 
        url={url} 
        setUrl={setUrl} 
        method={method} 
        setMethod={setMethod} 
        body={body} 
        setBody={setBody} 
        sendRequest={sendRequest} 
        loading={loading}
      />
      <div className="border-2 border-gray-200 rounded-xl bg-gray-50 p-4 shadow-sm min-h-[150px] relative">
        {/* Status Badge */}
        {response?.status && (
          <div
            className={`absolute top-4 right-4 text-sm font-medium px-3 py-1 rounded-full ${
              response.status === 200
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {response.status === 200 ? "OK" : "Error"}
          </div>
        )}

        {/* Response Header */}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Response</h2>

        {/* Response Body */}
        <pre className="text-sm font-mono text-gray-600 whitespace-pre-wrap break-words">
          {response ? (
            typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data
          ) : (
            <span className="text-gray-400">No response yet</span>
          )}
        </pre>
      </div>
    </div>
  );
}

export default App;