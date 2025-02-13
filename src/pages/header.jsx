import { useState, useEffect, useRef } from "react";
import { BookMarked, X, Trash } from "lucide-react";

function Header({ onSelectSavedOption }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedOptionsGroups, setSavedOptionsGroups] = useState({});
  const sidebarRef = useRef(null);

  // Load saved options groups from local storage when sidebar opens.
  useEffect(() => {
    if (sidebarOpen) {
      const saved = localStorage.getItem("savedOptionsGroups");
      if (saved) {
        try {
          setSavedOptionsGroups(JSON.parse(saved));
        } catch (error) {
          console.error("Error parsing savedOptionsGroups:", error);
          setSavedOptionsGroups({});
        }
      } else {
        setSavedOptionsGroups({});
      }
    }
  }, [sidebarOpen]);

  // Close sidebar when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener on unmount or when sidebarOpen changes.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Remove a saved option from a specific group and update local storage.
  const removeSavedOption = (groupName, index) => {
    const updatedGroup = savedOptionsGroups[groupName].filter((_, idx) => idx !== index);
    const updatedGroups = { ...savedOptionsGroups, [groupName]: updatedGroup };
    // Optionally remove the group if it's empty.
    if (updatedGroup.length === 0) {
      delete updatedGroups[groupName];
    }
    setSavedOptionsGroups(updatedGroups);
    localStorage.setItem("savedOptionsGroups", JSON.stringify(updatedGroups));
  };

  return (
    <>
      {/* Header Bar */}
      <div className="flex space-x-12 items-center p-4">
        <BookMarked
          className="text-white cursor-pointer hover:text-blue-900 hover:bg-gray-200 h-12 w-12 p-2 rounded transition-colors ease-in transition-2s"
          onClick={() => setSidebarOpen(true)}
        />
        <h1 className="text-2xl font-bold text-white">
          🚀 RESTLAB ~ Test your APIs
        </h1>
      </div>

      {/* Sidebar with glassmorphism */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-[500px] bg-blue-950/20 backdrop-blur-lg text-white p-4 transition-transform transform z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4 p-4">
          <h1 className="text-2xl font-bold text-white">
            🚀 RESTLAB ~ Test your APIs
          </h1>
          <X
            className="cursor-pointer hover:text-gray-300 transition-colors"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Saved APIs</h2>
          <div className="flex flex-col gap-4">
  {Object.keys(savedOptionsGroups).length > 0 ? (
    Object.keys(savedOptionsGroups).map((groupName) => (
      <div key={groupName} className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-2xl font-semibold mb-2 text-blue-500">{groupName}</h3>
        <ul>
          {savedOptionsGroups[groupName].map((option, index) => (
            <li
              key={index}
              onClick={() => {
                if (onSelectSavedOption) {
                  onSelectSavedOption(option);
                }
                setSidebarOpen(false);
              }}
              className="mb-2 flex items-center justify-between p-3 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer text-black"
            >
              <div>
                <span className="font-bold text-blue-500">{option.method}</span> - {option.url}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSavedOption(groupName, index);
                }}
              >
                <Trash className="w-4 h-4 text-red-400 hover:text-red-500 transition-colors" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    ))
  ) : (
    <p className="text-white">No saved options.</p>
  )}
</div>


        </div>
      </div>
    </>
  );
}

export default Header;
