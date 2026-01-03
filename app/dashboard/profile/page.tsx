import { auth } from "@/auth"
import { UserCircleIcon, CheckBadgeIcon, ShieldCheckIcon } from "@heroicons/react/24/solid"

export default async function ProfilePage() {
  const session = await auth()
  
  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto">
       <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
             <div className="absolute top-4 right-4 flex gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20 flex items-center gap-1">
                  <ShieldCheckIcon className="w-3 h-3" /> Verified Member
                </span>
             </div>
          </div>
          
          <div className="px-10 pb-10">
             <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center text-gray-300">
                   {session?.user?.image ? (
                     <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <UserCircleIcon className="w-full h-full" />
                   )}
                </div>
                <a href="/dashboard/profile/edit" className="mb-2 px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 text-sm inline-block">
                   Edit Profile
                </a>
             </div>
             
             <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">{session?.user?.name}</h1>
                <p className="text-gray-500">{session?.user?.email}</p>
             </div>

             <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Status</h3>
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                         <ShieldCheckIcon className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-bold text-gray-900">Standard Tier</div>
                         <div className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Upgrade to Premium</div>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Activity Log</h3>
                   <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                         <CheckBadgeIcon className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-bold text-gray-900">Last Login</div>
                         <div className="text-xs text-gray-500">Just now from Chrome/Windows</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}
