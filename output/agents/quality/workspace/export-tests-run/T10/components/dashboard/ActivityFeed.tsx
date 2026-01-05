import { ReactNode } from "react";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  icon?: ReactNode;
  iconColor?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

// Simple inline SVG icons
const DefaultActivityIcon = () => (
  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export function ActivityFeed({ 
  activities, 
  title = "Recent Activity",
  showViewAll = true,
  onViewAll 
}: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {showViewAll && (
          <button 
            onClick={onViewAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={`flex gap-3 pb-4 ${
                index < activities.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {activity.user.avatar ? (
                  <img 
                    src={activity.user.avatar} 
                    alt={activity.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {activity.user.name[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">{activity.user.name}</span>
                  {" "}
                  <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                  {activity.target && (
                    <>
                      {" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.target}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {activity.timestamp}
                </p>
              </div>

              {/* Icon */}
              <div className={`flex-shrink-0 p-1.5 rounded-full ${activity.iconColor || "bg-gray-100 dark:bg-gray-700"}`}>
                {activity.icon || <DefaultActivityIcon />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
