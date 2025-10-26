import { useState, useEffect } from "react";
import Header from "./pages/header.jsx";
import Input from "./pages/input.jsx";
import { Plus, X } from "lucide-react";

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
  // Initialize forms from localStorage, if available.
  const [forms, setForms] = useState(() => {
    const savedForms = localStorage.getItem("forms");
    return savedForms ? JSON.parse(savedForms) : [createEmptyForm()];
  });

  // Initialize activeIndex from localStorage, or default to 0.
  const [activeIndex, setActiveIndex] = useState(() => {
    const savedIndex = localStorage.getItem("activeIndex");
    return savedIndex ? JSON.parse(savedIndex) : 0;
  });

  // Persist forms state in localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem("forms", JSON.stringify(forms));
  }, [forms]);

  // Persist activeIndex in localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem("activeIndex", JSON.stringify(activeIndex));
  }, [activeIndex]);

  // Add a new empty form page and set it as active.
  const addForm = () => {
    const newForm = createEmptyForm();
    setForms((prevForms) => {
      const newForms = [...prevForms, newForm];
      setActiveIndex(newForms.length - 1);
      return newForms;
    });
  };

  // Remove a form page by its index.
  const removeForm = (index) => {
    if (forms.length === 1) return; // Always have at least one page.
    setForms((prevForms) => {
      const newForms = prevForms.filter((_, idx) => idx !== index);
      if (activeIndex >= newForms.length) {
        setActiveIndex(newForms.length - 1);
      }
      return newForms;
    });
  };

  // Update a specific field of a form at a given index.
  const updateForm = (index, field, value) => {
    setForms((prevForms) =>
      prevForms.map((form, idx) =>
        idx === index ? { ...form, [field]: value } : form
      )
    );
  };

  // Send a request for the active form.
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

      // If the authToken is provided, attach it to the headers.
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
          // For form-data (multipart)
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
          // Convert formData to URLSearchParams.
          const params = new URLSearchParams();
          form.formData.forEach((field) => {
            if (field.name.trim()) {
              params.append(field.name, field.value);
            }
          });
          options.headers["Content-Type"] = "application/x-www-form-urlencoded";
          options.body = params.toString();
        }
      }
      const res = await fetch(form.url, options);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        } else {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
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

  // When a saved API is selected from the sidebar,
  // create a new form page with the saved data.
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

  return (
    <div className=" min-h-screen flex flex-col">
      {/* Pass the saved option selection callback to Header */}
      <Header onSelectSavedOption={handleSelectSavedOption} />

      {/* Tab Navigation */}
      <div className="flex items-center  ">
        {forms.map((form, idx) => (
          <div
            key={form.id}
            onClick={() => setActiveIndex(idx)}
            className={`flex items-center px-3 py-1 pt-3 pb-3 cursor-pointer ${
              idx === activeIndex
                ? "bg-white text-black  border-b-3 border-blue-300"
                : "bg-gray-100 text-gray-700 "
            }`}
          >
            <span className="flex  items-center gap-2">
              {form.url ? (
                <>
                  <span>{form.method}</span>
                  <div className="bg-gray-400 h-6 w-0.5 rounded"></div>
                  <span>
                    {(() => {
                      try {
                        return new URL(form.url).hostname;
                      } catch (error) {
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
              className="pointer-cursor"
            >
              <X className="w-4 h-4 ml-2" />
            </button>
          </div>
        ))}
        <button
          onClick={addForm}
          className="flex items-center justify-center h-10 w-10 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded"
        >
          <Plus className="w-4 h-4 " />
          {/* <span>Add Page</span> */}
        </button>
      </div>

      {/* Active Form Content */}
      {forms[activeIndex] && (
        <div className="flex flex-col space-y-4  ">
          <div className="">
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
              setFormData={(value) =>
                updateForm(activeIndex, "formData", value)
              }
              fileData={forms[activeIndex].fileData}
              setFileData={(value) =>
                updateForm(activeIndex, "fileData", value)
              }
              authToken={forms[activeIndex].authToken} // <-- Pass token value
              setAuthToken={(value) =>
                updateForm(activeIndex, "authToken", value)
              } // <-- Setter
            />
          </div>
          <div className="border-2 border-gray-200  bg-gray-50 p-4 shadow-sm min-h-[150px] relative">
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
