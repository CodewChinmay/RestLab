import { Send, Loader2, Plus, Trash, ChevronDown, ChevronUp, Globe, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

const methodColors = {
  GET: "border-l-4 border-blue-500 bg-blue-50 text-blue-700",
  POST: "border-l-4 border-green-500 bg-green-50 text-green-700",
  PUT: "border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700",
  PATCH: "border-l-4 border-purple-500 bg-purple-50 text-purple-700",
  DELETE: "border-l-4 border-red-500 bg-red-50 text-red-700",
};

function Input({ url, setUrl, method, setMethod, body, setBody, sendRequest, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [isBodyValid, setIsBodyValid] = useState(true);
  const [mode, setMode] = useState("raw");
  const [formData, setFormData] = useState([{ name: "", value: "", type: "text" }]);
  const [fileData, setFileData] = useState({});

  // Validate JSON body when body or mode changes
  useEffect(() => {
    if (method === "GET" || mode === "form") return;
    try {
      JSON.parse(body);
      setIsBodyValid(true);
    } catch (e) {
      setIsBodyValid(false);
    }
  }, [body, method, mode]);

  // Handle form field changes
  const handleFormChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index][field] = value;
    setFormData(updatedFormData);
  };

  // Handle file input changes
  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      setFileData({ ...fileData, [index]: file });
    }
  };

  // Add a new form field
  const addFormField = () => {
    setFormData([...formData, { name: "", value: "", type: "text" }]);
  };

  // Remove a form field
  const removeFormField = (index) => {
    const updatedFormData = formData.filter((_, i) => i !== index);
    setFormData(updatedFormData);

    // Remove associated file data if it exists
    const updatedFileData = { ...fileData };
    delete updatedFileData[index];
    setFileData(updatedFileData);
  };

  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {/* Method, URL, and Send Button */}
      <div className="flex gap-3 items-start relative">
        {/* Method Dropdown */}
        <div className="flex flex-col gap-1">
          <div
            className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${methodColors[method]} w-36`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="font-semibold">{method}</span>
            {isOpen ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
          </div>

          {/* Dropdown Options */}
          {isOpen && (
            <div className="absolute top-14 left-0 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden w-36 z-10 animate-fade-in">
              {Object.keys(methodColors).map((m) => (
                <div
                  key={m}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${method === m ? "bg-gray-50" : ""}`}
                  onClick={() => {
                    setMethod(m);
                    setIsOpen(false);
                  }}
                >
                  <span className="font-medium">{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Globe size={20} />
          </div>
          <input
            type="url"
            placeholder="Enter request URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 font-medium transition-all"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={sendRequest}
          disabled={loading || (!isBodyValid && mode === "raw")}
          className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
            loading || (!isBodyValid && mode === "raw")
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span className="font-semibold">Send</span>
            </>
          )}
        </button>
      </div>

      {/* Request Body Section */}
      {(method === "POST" || method === "PATCH" || method === "PUT") && (
        <div className="flex flex-col gap-4">
          {/* Mode Toggle */}
          <div className="inline-flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              className={`px-6 py-2 rounded-md transition-all ${
                mode === "raw" ? "bg-blue-600 shadow-sm text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setMode("raw")}
            >
              Raw JSON
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-all ${
                mode === "form" ? "bg-blue-600 shadow-sm text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setMode("form")}
            >
              Form Data
            </button>
          </div>

          {/* Content Area */}
          {mode === "raw" ? (
            <div className="relative">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{ "key": "value" }'
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none font-mono transition-all min-h-[200px] ${
                  isBodyValid
                    ? "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    : "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                }`}
              />
              <div className="absolute top-4 right-4">
                {isBodyValid ? (
                  <CheckCircle2 className="text-green-500 w-6 h-6" />
                ) : (
                  <XCircle className="text-red-500 w-6 h-6" />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {formData.map((field, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Key"
                    value={field.name}
                    onChange={(e) => handleFormChange(index, "name", e.target.value)}
                    className="col-span-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {field.type === "file" ? (
                    <label className="col-span-8 flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(index, e)}
                        className="hidden"
                      />
                      <span className="text-gray-500 truncate">
                        {fileData[index]?.name || "Choose file"}
                      </span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => handleFormChange(index, "value", e.target.value)}
                      className="col-span-8 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  )}
                  <select
                    value={field.type}
                    onChange={(e) => handleFormChange(index, "type", e.target.value)}
                    className="col-span-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </select>
                  <button
                    onClick={() => removeFormField(index)}
                    className="col-span-1 flex justify-center text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addFormField}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 w-fit px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Row</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Input;