import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function MethodDropdown({ method, setMethod, methodColors }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center justify-between px-4 py-2  cursor-pointer transition-all duration-200 ${methodColors[method]} w-36`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle method dropdown"
        aria-expanded={isOpen}
      >
        <span className="font-semibold">{method}</span>
        {isOpen ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
      </div>

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
  );
}