import React from "react";

export default function UserBadge({ username }) {
  if (!username) return null; 

  return (
    <div className="flex items-center space-x-4 px-2 font-semibold" style={{ color: "#1976d2" }}>
      <span>{username}</span>
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-gray-600"
        >
          <path
            fillRule="evenodd"
            d="M12 2a5 5 0 015 5v1a5 5 0 11-10 0V7a5 5 0 015-5zm-7 18a7 7 0 0114 0H5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
