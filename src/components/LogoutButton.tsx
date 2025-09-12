'use client'


export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/auth/signout', {
      method: 'POST',
    })
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
    >
      Sign Out
    </button>
  )
} 