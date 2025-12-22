"use client";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your account settings and preferences</p>

      {/* Profile Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-blue-500 text-white border-none rounded-md px-5 py-2.5 text-sm font-medium cursor-pointer self-start hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <div className="flex flex-col gap-4">
          {[
            { label: "Email notifications", description: "Receive email updates about your account" },
            { label: "Push notifications", description: "Receive push notifications on your devices" },
            { label: "Weekly reports", description: "Get weekly reports about your activity" }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-[13px] text-gray-500 mt-1">{item.description}</div>
              </div>
              <label className="relative inline-block w-11 h-6">
                <input type="checkbox" defaultChecked={i === 0} className="opacity-0 w-0 h-0" />
                <span className={`absolute cursor-pointer inset-0 ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'} rounded-full transition-all duration-400`} />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white p-6 rounded-lg border border-red-200">
        <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Irreversible and destructive actions
        </p>
        <button className="bg-white text-red-600 border border-red-600 rounded-md px-5 py-2.5 text-sm font-medium cursor-pointer hover:bg-red-50">
          Delete Account
        </button>
      </div>
    </div>
  );
}
