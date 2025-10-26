import { useState, useEffect, useRef } from "react";
import { Grip, Sun, Moon } from "lucide-react";
import Sidebar from "./Sidebar";

function Header({ onSelectSavedOption }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedOptionsGroups, setSavedOptionsGroups] = useState({});
  const [theme, setTheme] = useState("light");
  const sidebarRef = useRef(null);

  // --- Load theme on mount ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // --- Toggle theme ---
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // --- Load saved options groups when sidebar opens ---
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

  // --- Close sidebar when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // --- Remove saved option ---
  const removeSavedOption = (groupName, index) => {
    const updatedGroup = savedOptionsGroups[groupName].filter(
      (_, idx) => idx !== index
    );
    const updatedGroups = { ...savedOptionsGroups, [groupName]: updatedGroup };

    if (updatedGroup.length === 0) {
      delete updatedGroups[groupName];
    }

    setSavedOptionsGroups(updatedGroups);
    localStorage.setItem("savedOptionsGroups", JSON.stringify(updatedGroups));
  };

  // --- Method colors ---
  const methodColors = {
    GET: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200",
    POST: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
    PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
    PATCH:
      "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200",
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-600 transition-colors duration-300">
        <div className="container p-2 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Grip className="w-7 h-7 text-gray-500 dark:text-gray-300" />
            </button>

            <h1 className="ml-4 text-xl font-bold text-gray-700 dark:text-gray-100 font-sans tracking-tight">
              🚀 RESTLAB ~ Test your APIs
            </h1>
          </div>

          {/* Right (Theme Toggle) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-6 h-6 text-gray-600" />
            ) : (
              <Sun className="w-6 h-6 text-yellow-400" />
            )}
          </button>
        </div>

        <div className="absolute h-0.5 w-full bg-gray-300 dark:bg-gray-300"></div>
      </header>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        savedOptionsGroups={savedOptionsGroups}
        onSelectSavedOption={onSelectSavedOption}
        removeSavedOption={removeSavedOption}
        methodColors={methodColors}
      />
    </>
  );
}

export default Header;
