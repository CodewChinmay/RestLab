import { useState, useEffect, useRef } from "react";
import Header from "./pages/header.jsx";
import Input from "./pages/input.jsx";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

// Helper to create a new (empty) form with default values.
const createEmptyForm = () => ({
  id: Date.now() + Math.random(),
  url: "",
  method: "GET",
  body: "{}",
  response: null,
  loading: false,
  mode: "raw",
  authToken: "", // <-- Added for Bearer token
  formData: [
    { id: Date.now() + Math.random(), name: "", value: "", type: "text" },
  ],
  fileData: {},
});

function App() {
  const [forms, setForms] = useState(() => {
    const savedForms = localStorage.getItem("forms");
    return savedForms ? JSON.parse(savedForms) : [createEmptyForm()];
  });

  const [activeIndex, setActiveIndex] = useState(() => {
    const savedIndex = localStorage.getItem("activeIndex");
    return savedIndex ? JSON.parse(savedIndex) : 0;
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem("forms", JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem("activeIndex", JSON.stringify(activeIndex));
  }, [activeIndex]);

  const addForm = () => {
    const newForm = createEmptyForm();
    setForms((prevForms) => {
      const newForms = [...prevForms, newForm];
      setActiveIndex(newForms.length - 1);
      return newForms;
    });
  };

  const removeForm = (index) => {
    if (forms.length === 1) return;
    setForms((prevForms) => {
      const newForms = prevForms.filter((_, idx) => idx !== index);
      if (activeIndex >= newForms.length) {
        setActiveIndex(newForms.length - 1);
      }
      return newForms;
    });
  };

  const updateForm = (index, field, value) => {
    setForms((prevForms) =>
      prevForms.map((form, idx) =>
        idx === index ? { ...form, [field]: value } : form
      )
    );
  };

  const sendRequest = async (index) => {
    const form = forms[index];
    if (!form.url.trim()) {
      updateForm(index, "response", {
        status: "error",
        data: { error: "URL is required." },
      });
      return;
    }
    updateForm(index, "loading", true);
    try {
      let options = { method: form.method, headers: {} };

      if (form.authToken && form.authToken.trim()) {
        options.headers["Authorization"] = `Bearer ${form.authToken.trim()}`;
      }

      if (form.method !== "GET") {
        if (form.mode === "raw") {
          try {
            JSON.parse(form.body);
            options.headers["Content-Type"] = "application/json";
            options.body = form.body;
          } catch (e) {
            throw new Error("Invalid JSON body");
          }
        } else if (form.mode === "form") {
          const formDataObj = new FormData();
          form.formData.forEach((field) => {
            if (field.type === "file" && form.fileData[field.id]) {
              formDataObj.append(field.name, form.fileData[field.id]);
            } else {
              formDataObj.append(field.name, field.value);
            }
          });
          options.body = formDataObj;
        } else if (form.mode === "urlencoded") {
          const params = new URLSearchParams();
          form.formData.forEach((field) => {
            if (field.name.trim()) params.append(field.name, field.value);
          });
          options.headers["Content-Type"] =
            "application/x-www-form-urlencoded";
          options.body = params.toString();
        }
      }

      const res = await fetch(form.url, options);
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        else throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      updateForm(index, "response", { status: res.status, data });
    } catch (error) {
      updateForm(index, "response", {
        status: "error",
        data: { error: error.message || "Failed to fetch data." },
      });
    }
    updateForm(index, "loading", false);
  };

  const handleSelectSavedOption = (savedData) => {
    const newForm = {
      id: Date.now() + Math.random(),
      url: savedData.url || "",
      method: savedData.method || "GET",
      body: savedData.body || "{}",
      response: null,
      loading: false,
      mode: savedData.mode || "raw",
      authToken: savedData.authToken || "",
      formData: savedData.formData || [
        { id: Date.now() + Math.random(), name: "", value: "", type: "text" },
      ],
      fileData: {},
    };
    setForms((prevForms) => {
      const newForms = [...prevForms, newForm];
      setActiveIndex(newForms.length - 1);
      return newForms;
    });
  };

  // ===== Scroll Logic =====
  const scrollRef = useRef(null);
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -150, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 150, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSelectSavedOption={handleSelectSavedOption} />

      {/* ==== Scrollable Tab Bar ==== */}
      <div className="relative flex items-center dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className=" left-0 z-10 h-full px-2 bg-gradient-to-r from-gray-100 via-gray-50/70 to-transparent dark:from-gray-900 dark:via-gray-800/70 dark:to-transparent"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Scrollable Tabs */}
        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto scrollbar-hide  px-8"
        >
          {forms.map((form, idx) => (
            <div
              key={form.id}
              onClick={() => setActiveIndex(idx)}
              className={`flex items-center px-3 py-2 border-r border-gray-300 dark:border-gray-700 cursor-pointer  transition ${
                idx === activeIndex
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white"
              }`}
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                {form.url ? (
                  <>
                    <span>{form.method}</span>
                    <div className="bg-gray-400 h-6 w-0.5 rounded"></div>
                    <span>
                      {(() => {
                        try {
                          return new URL(form.url).hostname;
                        } catch {
                          return form.url;
                        }
                      })()}
                    </span>
                  </>
                ) : (
                  "New Request"
                )}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeForm(idx);
                }}
              >
                <X className="w-4 h-4 ml-2" />
              </button>
            </div>
          ))}

          {/* Add Button */}
          <button
            onClick={addForm}
            className="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className=" right-0 z-10 h-full px-2 bg-gradient-to-l from-gray-100 via-gray-50/70 to-transparent dark:from-gray-900 dark:via-gray-800/70 dark:to-transparent"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* ==== Active Form Content ==== */}
      {forms[activeIndex] && (
        <div className="flex flex-col">
          <Input
            url={forms[activeIndex].url}
            setUrl={(value) => updateForm(activeIndex, "url", value)}
            method={forms[activeIndex].method}
            setMethod={(value) => updateForm(activeIndex, "method", value)}
            body={forms[activeIndex].body}
            setBody={(value) => updateForm(activeIndex, "body", value)}
            sendRequest={() => sendRequest(activeIndex)}
            loading={forms[activeIndex].loading}
            mode={forms[activeIndex].mode}
            setMode={(value) => updateForm(activeIndex, "mode", value)}
            formData={forms[activeIndex].formData}
            setFormData={(value) => updateForm(activeIndex, "formData", value)}
            fileData={forms[activeIndex].fileData}
            setFileData={(value) => updateForm(activeIndex, "fileData", value)}
            authToken={forms[activeIndex].authToken}
            setAuthToken={(value) =>
              updateForm(activeIndex, "authToken", value)
            }
          />

          <div className="border-b border-gray-300 dark:bg-gray-900 dark:border-gray-700 p-4 min-h-[350px] relative">
            {forms[activeIndex].response?.status && (
              <div
                className={`absolute top-4 right-4 text-sm font-medium px-3 py-1 rounded-full ${
                  forms[activeIndex].response.status === 200
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {forms[activeIndex].response.status === 200 ? "OK" : "Error"}
              </div>
            )}
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Response
            </h2>
            <pre className="text-sm font-mono text-gray-600 whitespace-pre-wrap break-words">
              {forms[activeIndex].response ? (
                typeof forms[activeIndex].response.data === "object" ? (
                  JSON.stringify(forms[activeIndex].response.data, null, 2)
                ) : (
                  forms[activeIndex].response.data
                )
              ) : (
                <span className="text-gray-400">No response yet</span>
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
