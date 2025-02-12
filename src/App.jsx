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
      setResponse(data);
    } catch (error) {
      setResponse({ error: "Failed to fetch data." });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col space-y-4">
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
      <div className="border p-2 rounded bg-gray-50 min-h-[100px]">
        <h2 className="text-lg font-semibold">Response:</h2>
        <pre className="text-sm whitespace-pre-wrap">
          {response ? JSON.stringify(response, null, 2) : "No response yet"}
        </pre>
      </div>
    </div>
  );
}

export default App;
