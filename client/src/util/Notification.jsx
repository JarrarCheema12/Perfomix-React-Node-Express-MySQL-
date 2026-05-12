import React, { useState } from "react";

function NotificationItem({ user, action, time, highlight, link }) {
  return (
    <div className="p-4 border rounded-lg bg-gray-100 border-gray-200 shadow-lg m-4 flex items-start">
      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">{user[0]}</div>
      <div className="ml-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{user}</span> {action}{" "}
          {highlight && <span className="font-semibold text-blue-500">{highlight}</span>}
          {link && <a href="#" className="text-blue-500"> {link}</a>}
        </p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}

function Notification() {
  const [activeTab, setActiveTab] = useState("Participating");

  const notifications = {
    Participating: [
      { user: "Jese Leos", action: "sent you a message:", highlight: '"Hey, what\'s up? All set for the presentation?"', time: "today" },
      { user: "Joseph Mcfall", action: "and 5 others started following you", time: "today" },
      { user: "Lana Byrd", action: "tagged you in a", link: "photo", time: "yesterday" },
      { user: "Bonnie Green", action: "and 14.1k others love your avatar.", time: "yesterday" },
      { user: "Lana Byrd", action: "tagged you in a", link: "photo", time: "yesterday" },
      { user: "Bonnie Green", action: "and 14.1k others love your avatar.", time: "yesterday" }
    ],
    Mentions: [
      { user: "Bonnie Green", action: "and 141 others love your story.", time: "today" },
      { user: "Roberta Casas", action: "liked your comment", highlight: '"Welcome to Flowbite community"', time: "yesterday" },
      { user: "Lana Byrd", action: "tagged you in a", link: "photo", time: "yesterday" },
      { user: "Bonnie Green", action: "and 14.1k others love your avatar.", time: "yesterday" },
      { user: "Lana Byrd", action: "tagged you in a", link: "photo", time: "yesterday" },
      { user: "Bonnie Green", action: "and 14.1k others love your avatar.", time: "yesterday" }
    ],
    "Review requests": [
      { user: "Lana Byrd", action: "tagged you in a", link: "photo", time: "yesterday" },
      { user: "Bonnie Green", action: "and 14.1k others love your avatar.", time: "yesterday" },
      { user: "Jese Leos", action: "sent you a message:", highlight: '"Hey, what\'s up? All set for the presentation?"', time: "today" },
      { user: "Joseph Mcfall", action: "and 5 others started following you", time: "today" },
      { user: "Jese Leos", action: "sent you a message:", highlight: '"Hey, what\'s up? All set for the presentation?"', time: "today" },
      { user: "Joseph Mcfall", action: "and 5 others started following you", time: "today" },
    ]
  };

  return (
    <div className="m-2 bg-gray-200 h-full shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Notifications</h3>
      <div className="border-b border-gray-300 mb-3 flex space-x-4 text-sm">
        {Object.keys(notifications).map((tab) => (
          <button
            key={tab}
            className={`pb-2 ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600 text-md font-semibold ms-4" : "ms-4 text-gray-500 hover:text-gray-500 text-md font-semibold"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>
        <h4 className="text-md font-semibold mt-4 text-gray-500">Today</h4>
        {notifications[activeTab].filter(notif => notif.time === "today").map((notif, index) => (
          <NotificationItem key={index} {...notif} />
        ))}
        <h4 className="text-md font-semibold mt-4 text-gray-500">Yesterday</h4>
        {notifications[activeTab].filter(notif => notif.time === "yesterday").map((notif, index) => (
          <NotificationItem key={index} {...notif} />
        ))}
      </div>
    </div>
  );
}

export default Notification;
