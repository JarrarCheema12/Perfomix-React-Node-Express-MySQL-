import { useState } from "react";
import { IoFilterSharp } from "react-icons/io5";

const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        className="w-full flex items-center justify-between pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center space-x-2">
          <IoFilterSharp className="text-gray-500" size={20} />
          <span>{value || "All Departments"}</span>
        </div>
        <span className="text-gray-500">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className={`p-2 hover:bg-blue-100 cursor-pointer ${
                value === option ? "bg-blue-200" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option || "All Departments"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function StaffFeedbackFilter() {
  const [filterDepartment, setFilterDepartment] = useState("");

  const handleFilterDepartment = (department) => {
    setFilterDepartment(department);
    console.log("Selected department:", department);
  };

  const departments = [
    "",
    "Sales",
    "Marketing",
    "IT",
    "Finance",
    "Operations",
  ];

  return (
    <div className="p-4">
      <CustomDropdown
        value={filterDepartment}
        onChange={handleFilterDepartment}
        options={departments}
      />
    </div>
  );
}
