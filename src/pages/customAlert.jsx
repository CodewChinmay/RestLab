import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const CustomAlert = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-white flex items-center gap-2 transition-all ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}>
      {type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      <span>{message}</span>
    </div>
  );
};

export default CustomAlert;
