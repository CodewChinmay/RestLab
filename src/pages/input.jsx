import { useEffect, useState } from "react";
import {
  Send,
  Loader2,
  Plus,
  Trash,
  Globe,
  CheckCircle2,
  XCircle,
  X,
  Save,
} from "lucide-react";
import MethodDropdown from "./methoddropdown.jsx";

import "../App.css";

const methodColors = {
  GET: "border-3 border-blue-500 bg-blue-50 text-blue-700",
  POST: "border-3 border-green-500 bg-green-50 text-green-700",
  PUT: "border-3 border-yellow-500 bg-yellow-50 text-yellow-700",
  PATCH: "border-3 border-purple-500 bg-purple-50 text-purple-700",
  DELETE: "border-3 border-red-500 bg-red-50 text-red-700",
};

function Input({
  url,
  setUrl,
  method,
  setMethod,
  body,
  setBody,
  sendRequest,
  loading,
  mode,
  setMode,
  formData,
  setFormData,
  fileData,
  setFileData,
  authToken,
  setAuthToken,
}) {
  const [isBodyValid, setIsBodyValid] = useState(true);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  // New state to decide if user wants to include the bearer token
  const [includeBearer, setIncludeBearer] = useState(false);

  // Custom Alert (Toast) state & helper.
  const [customAlert, setCustomAlert] = useState(null);
  const showCustomAlert = (message, type = "info") => {
    setCustomAlert({ message, type });
    setTimeout(() => {
      setCustomAlert(null);
    }, 3000);
  };

  // Validate raw JSON body.
  useEffect(() => {
    if (method === "GET" || mode === "form" || mode === "urlencoded") return;
    try {
      JSON.parse(body);
      setIsBodyValid(true);
    } catch (e) {
      setIsBodyValid(false);
    }
  }, [body, method, mode]);

  // Check if current page data is already saved.
  useEffect(() => {
    const checkIfSaved = () => {
      const saved = localStorage.getItem("savedOptionsGroups");
      if (saved) {
        try {
          const groups = JSON.parse(saved);
          const allSaved = [];
          for (const key in groups) {
            allSaved.push(...groups[key]);
          }
          const currentData = { url, method, body, mode, formData };
          const found = allSaved.some(
            (item) => JSON.stringify(item) === JSON.stringify(currentData)
          );
          setIsAlreadySaved(found);
        } catch (error) {
          console.error("Error checking saved data:", error);
          setIsAlreadySaved(false);
        }
      } else {
        setIsAlreadySaved(false);
      }
    };

    checkIfSaved();
  }, [url, method, body, mode, formData]);

  const handleFormChange = (id, field, value) => {
    const updatedFormData = formData.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormData(updatedFormData);
  };

  const handleFileChange = (id, event) => {
    const file = event.target.files[0];
    if (file) setFileData({ ...fileData, [id]: file });
  };

  const addFormField = () => {
    setFormData([
      ...formData,
      {
        id: Date.now(), // Unique ID
        name: "",
        value: "",
        type: "text",
      },
    ]);
  };

  const removeFormField = (id) => {
    setFormData(formData.filter((item) => item.id !== id));
    const updatedFileData = { ...fileData };
    delete updatedFileData[id];
    setFileData(updatedFileData);
  };

  const isFormValid = formData.every((field) => {
    // In URL Encoded mode, file inputs are not supported.
    if (mode === "urlencoded" && field.type === "file") return false;
    if (field.type === "file") {
      return fileData[field.id] !== undefined;
    }
    return field.name.trim() && field.value.trim();
  });

  // Handle the custom modal save confirmation.
  const handleConfirmSave = () => {
    const finalGroup =
      selectedGroup === "new"
        ? newGroupName.trim() || "default"
        : selectedGroup || "default";
    const dataToSave = { url, method, body, mode, formData };
    let groups = {};
    const existing = localStorage.getItem("savedOptionsGroups");
    if (existing) {
      groups = JSON.parse(existing);
    }
    if (!groups[finalGroup]) {
      groups[finalGroup] = [];
    }
    // Check if data already exists in the group.
    const already = groups[finalGroup].some(
      (item) => JSON.stringify(item) === JSON.stringify(dataToSave)
    );
    if (already) {
      showCustomAlert(
        "This page is already saved in group: " + finalGroup,
        "error"
      );
      setIsAlreadySaved(true);
      setShowSaveModal(false);
      return;
    }
    groups[finalGroup].push(dataToSave);
    localStorage.setItem("savedOptionsGroups", JSON.stringify(groups));
    showCustomAlert(
      "Page data saved successfully in group: " + finalGroup,
      "success"
    );
    setIsAlreadySaved(true);
    setShowSaveModal(false);
  };

  // Open the custom save modal and load available groups.
  const openSaveModal = () => {
    const existing = localStorage.getItem("savedOptionsGroups");
    let groups = existing ? Object.keys(JSON.parse(existing)) : [];
    setAvailableGroups(groups);
    setSelectedGroup("");
    setNewGroupName("");
    setShowSaveModal(true);
  };

  return (
    <div className="relative">
      {/* Custom Toast Alert - Updated to top-center */}
      {customAlert && (
        <div
          style={{ animation: "slideDown 0.3s ease-out" }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
            customAlert.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {customAlert.type === "error" ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          <span>{customAlert.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-6 bg-white  dark:bg-gray-600 dark:text-white p-6 border-b-3 border-t-3 border-gray-300 dark:border-gray-300">
        <div className="flex gap-3 items-start relative">
          <MethodDropdown
            method={method}
            setMethod={setMethod}
            methodColors={methodColors}
          />
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Globe size={20} />
            </div>
            <input
              type="url"
              placeholder="Enter request URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4  py-2 border-3 border-gray-300  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 font-medium transition-all"
            />
          </div>
          <button
            onClick={sendRequest}
            disabled={
              loading ||
              (!isBodyValid && mode === "raw") ||
              ((mode === "form" || mode === "urlencoded") && !isFormValid)
            }
            className={`px-4 py-3  flex items-center gap-2 transition-all ${
              loading ||
              (!isBodyValid && mode === "raw") ||
              ((mode === "form" || mode === "urlencoded") && !isFormValid)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "border-3 border-blue-600  text-blue-600 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {/* <span className="font-semibold">Send</span> */}
              </>
            )}
          </button>
          {/* Save Button */}
          <button
            onClick={openSaveModal}
            disabled={loading || isAlreadySaved}
            className={`px-4 py-3  flex items-center gap-2 transition-all ${
              loading || isAlreadySaved
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "border-3 border-green-600  text-green-600 shadow-md hover:shadow-lg"
            }`}
          >
            <Save className="w-4 h-4" />
            {/* <span className="font-semibold">
              {isAlreadySaved ? "Saved" : "Save"}
            </span> */}
          </button>
        </div>

        {/* New Markup for Bearer Token */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeBearer"
              checked={includeBearer}
              onChange={(e) => {
                setIncludeBearer(e.target.checked);
                if (!e.target.checked) setAuthToken("");
              }}
              className="h-4 w-4"
            />
            <label htmlFor="includeBearer" className="text-sm text-gray-600">
              Include Bearer Token
            </label>
          </div>
          {includeBearer && (
            <input
              type="text"
              placeholder="Enter your token here"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 font-medium transition-all"
            />
          )}
        </div>

        {(method === "POST" ||
          method === "PATCH" ||
          method === "PUT") && (
          <div className="flex flex-col gap-4">
            <div className="inline-flex  ">
              <button
                className={`px-6 py-2 transition-all ${
                  mode === "raw"
                    ? "border-3 border-blue-600 shadow-sm text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setMode("raw")}
              >
                Raw JSON
              </button>
              <button
                className={`px-6 py-2 transition-all ${
                  mode === "form"
                    ? "border-3 border-blue-600 shadow-sm text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setMode("form")}
              >
                Form Data
              </button>
              <button
                className={`px-6 py-2 transition-all ${
                  mode === "urlencoded"
                    ? "border-3 border-blue-600 shadow-sm text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setMode("urlencoded")}
              >
                URL Encoded
              </button>
            </div>
            {mode === "raw" ? (
              <div className="relative">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{ "key": "value" }'
                  className={`w-full px-4 py-3 border-3  focus:outline-none font-mono transition-all min-h-[200px] ${
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
            ) : mode === "form" ? (
              <div className="flex flex-col gap-3">
                {formData.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-3 items-center"
                  >
                    {/* Key Input */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Key"
                        value={field.name}
                        onChange={(e) =>
                          handleFormChange(field.id, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Type Dropdown */}
                    <div className="col-span-3">
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleFormChange(field.id, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="text">Text</option>
                        <option value="file">File</option>
                      </select>
                    </div>
                    {/* Value or File Input */}
                    <div className="col-span-4">
                      {field.type === "file" ? (
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(field.id, e)}
                          className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="Value"
                          value={field.value}
                          onChange={(e) =>
                            handleFormChange(field.id, "value", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                    {/* Remove Button */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => removeFormField(field.id)}
                        className="text-red-400  border px-3 py-2 flex"
                      >
                        <Trash />
                      </button>
                    </div>
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
            ) : mode === "urlencoded" ? (
              <div className="flex flex-col gap-3">
                {formData.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-3 items-center"
                  >
                    {/* Key Input */}
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Key"
                        value={field.name}
                        onChange={(e) =>
                          handleFormChange(field.id, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Value Input */}
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) =>
                          handleFormChange(field.id, "value", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Remove Button */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => removeFormField(field.id)}
                        className="text-red-500"
                      >
                        <Trash />
                      </button>
                    </div>
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
            ) : null}
          </div>
        )}

        {/* Save Modal - Updated to top-center */}
        {showSaveModal && (
          <div className="fixed inset-0 z-50 backdrop-blur-sm">
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 animate-slideInFromTop">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Save Request
                  </h2>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Group
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose existing group</option>
                      {availableGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                      <option value="new">Create New Group</option>
                    </select>
                  </div>

                  {selectedGroup === "new" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Group Name
                      </label>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter group name"
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowSaveModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Input;
