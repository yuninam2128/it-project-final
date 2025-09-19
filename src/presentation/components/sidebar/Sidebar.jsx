import React, { useState } from 'react';

// Sidebar 컴포넌트
const Sidebar = ({ onPageChange, currentPage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const menuItems = [
    { id: 'project', label: 'Projects', icon: '📁' },
    { id: 'subtask', label: 'Subtasks', icon: '📝' }
  ];

  return (
    <aside 
      className={`bg-gray-800 text-white min-h-screen transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4">
        {/* 토글 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-700 transition-colors mb-4"
        >
          <span className="text-xl">
            {isExpanded ? '◀' : '▶'}
          </span>
        </button>

        {/* 네비게이션 메뉴 */}
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                    currentPage === item.id 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-700'
                  }`}
                  title={!isExpanded ? item.label : ''}
                >
                  <span className="text-lg flex-shrink-0">
                    {item.icon}
                  </span>
                  <span 
                    className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                      isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;