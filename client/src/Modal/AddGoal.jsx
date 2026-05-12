import React, { useState } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GoalModal({ isOpen, onClose, newGoal, setNewGoal }) {
  const [milestones, setMilestones] = useState([""]);

  if (!isOpen) return null;

  const addMilestone = () => {
    setMilestones([...milestones, ""]);
  };

  const updateMilestone = (index, value) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = value;
    setMilestones(updatedMilestones);
  };

  const deleteMilestone = (index) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(updatedMilestones);
  };

  const addTask = async () => {
    const token = localStorage.getItem("token");

    const milestonesObject = {};
    milestones.forEach((milestone, index) => {
      milestonesObject[`milestone-${index + 1}`] = milestone;
    });

    const data = {
      task_name: newGoal.title,
      completion_date: newGoal.date,
      description: newGoal.description,
      milestones: milestonesObject,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/staff/add-goal",
        data,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Goal added successfully:", response.data);
      
      toast.success("Goal added successfully!");
   setNewGoal({ title: "", date: "", description: "", milestone: "Milestone #01", file: null });
    } catch (error) {
      toast.error("Failed to add goal. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex justify-center items-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[89vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Goal</h3>
          <button onClick={onClose} className="text-gray-500 text-lg">
            ✖
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="w-1/2">
              <label className="block text-sm font-bold text-black">
                Task Name
              </label>
              <input
                type="text"
                placeholder="Enter Task Name"
                className="w-full border p-2 rounded-lg"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-bold text-black">
                Completion Date
              </label>
              <input
                type="date"
                className="w-full border p-2 rounded-lg"
                value={newGoal.date}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, date: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black">
              Description
            </label>
            <textarea
              placeholder="Add Description"
              className="w-full border p-2 rounded-lg"
              value={newGoal.description}
              onChange={(e) =>
                setNewGoal({ ...newGoal, description: e.target.value })
              }
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-black">
              Milestones
            </label>
            {milestones.map((milestone, index) => (
              <div key={index} className="relative mt-2">
                <input
                  type="text"
                  className="w-full border p-2 rounded-lg pr-10"
                  value={milestone}
                  onChange={(e) => updateMilestone(index, e.target.value)}
                  placeholder={`Milestone #${index + 1}`}
                />
                <button
                  onClick={() => deleteMilestone(index)}
                  className="absolute right-3 top-2/3 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={addMilestone}
              className="bg-gray-200 px-3 py-2 rounded-lg mt-2 text-gray-700 hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Save Goal
          </button>
        </div>
      </div>
      <ToastContainer autoClose={2000}  position="top-right" />
    </div>
  );
}
