"use client";
import { useRef } from "react";
import { X, Trash, BookMarked } from "lucide-react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  savedOptionsGroups = {},
  onSelectSavedOption,
  removeSavedOption,
  methodColors = {},
}) {
  const sidebarRef = useRef(null);

  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 w-full max-w-md bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 shadow-xl transform transition-all duration-300 ease-in-out z-50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Saved Endpoints
              </h2>
              <p className="text-sm text-gray-100 mt-1">
                Your collection of API configurations
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {Object.keys(savedOptionsGroups).length > 0 ? (
            <div className="space-y-6">
              {Object.keys(savedOptionsGroups).map((groupName) => (
                <section key={groupName} className="group">
                  <h3 className="text-xs font-semibold text-indigo-600 mb-3 uppercase tracking-wider">
                    {groupName}
                  </h3>
                  <div className="space-y-2">
                    {savedOptionsGroups[groupName].map((option, index) => (
                      <article
                        key={index}
                        onClick={() => {
                          onSelectSavedOption?.(option);
                          setSidebarOpen(false);
                        }}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                methodColors[option.method] ||
                                methodColors.default
                              }`}
                            >
                              {option.method}
                            </span>
                            <span className="text-sm text-gray-600 truncate">
                              {option.url}
                            </span>
                          </div>
                          {option.name && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {option.name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedOption(groupName, index);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-2"
                          aria-label={`Delete ${option.method} ${option.url}`}
                        >
                          <Trash className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BookMarked className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">
                No saved endpoints
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Save your API configurations to see them appear here
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="px-6 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            RESTLAB v1.0 · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
