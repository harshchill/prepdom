import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, Mail, ShieldCheck, UserCircle2, Coins, Camera, ArrowLeft, Save } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/user/login?callbackUrl=/user/profile");
  }

  const initials = session.user.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto w-full max-w-5xl">
        <Link href="/user/dashboard" className="mb-6 inline-flex items-center text-sm font-semibold text-zinc-500 transition-colors hover:text-[#25671E]">
           <ArrowLeft className="mr-1 h-4 w-4" />
           Back to Dashboard
        </Link>
        
        <div className="rounded-3xl border border-zinc-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
           <div className="grid md:grid-cols-3">
              {/* Sidebar/Profile Card */}
              <div className="bg-zinc-50 p-8 border-b md:border-b-0 md:border-r border-zinc-200/80 flex flex-col items-center text-center">
                 <div className="relative group cursor-pointer mb-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#25671E]/10 text-3xl font-black text-[#25671E] shadow-inner transition-all group-hover:bg-[#25671E]/20">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       {session.user.image ? (
                          <img src={session.user.image} alt="Profile" className="h-full w-full rounded-full object-cover" />
                       ) : (
                          initials
                       )}
                    </div>
                    <div className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-zinc-900 p-1.5 text-white shadow-sm transition-transform group-hover:scale-110">
                       <Camera className="h-3 w-3" />
                    </div>
                 </div>
                 
                 <h2 className="text-xl font-bold text-zinc-900">{session.user.name || "Student"}</h2>
                 <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-500">
                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                    <span className="capitalize">{session.user.role || "student"} Account</span>
                 </p>

                 <div className="mt-8 w-full space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-zinc-100">
                       <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                          <Coins className="h-4 w-4 text-[#F2B50B]" />
                          Coins Balance
                       </div>
                       <span className="font-bold text-zinc-900">{session.user.coins ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-zinc-100">
                       <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                          <Crown className="h-4 w-4 text-purple-500" />
                          Membership
                       </div>
                       <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 capitalize">
                          {session.user.isPremium ? "Premium" : "Free"}
                       </span>
                    </div>
                 </div>
              </div>

              {/* Main Form Area */}
              <div className="md:col-span-2 p-8 sm:p-10">
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Personal Information</h1>
                    <p className="mt-1 text-sm text-zinc-500">Update your account details and preferences.</p>
                 </div>

                 <form className="mt-8 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                       {/* Full Name */}
                       <div className="space-y-2 sm:col-span-2">
                          <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                             <UserCircle2 className="h-4 w-4 text-zinc-400" />
                             Full Name
                          </label>
                          <input 
                             type="text" 
                             id="name" 
                             defaultValue={session.user.name || ""} 
                             className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-all focus:border-[#25671E] focus:outline-none focus:ring-2 focus:ring-[#25671E]/20"
                             placeholder="Enter your full name"
                          />
                       </div>

                       {/* Email Address */}
                       <div className="space-y-2 sm:col-span-2">
                          <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                             <Mail className="h-4 w-4 text-zinc-400" />
                             Email Address
                          </label>
                          <div className="relative">
                             <input 
                                type="email" 
                                id="email" 
                                defaultValue={session.user.email || ""} 
                                disabled
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-500 cursor-not-allowed"
                             />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Google Auth</span>
                             </div>
                          </div>
                          <p className="text-xs text-zinc-500">Your email is managed by your Google account.</p>
                       </div>

                       {/* Referral Code */}
                       <div className="space-y-2">
                          <label htmlFor="referral" className="text-sm font-semibold text-zinc-900">Your Referral Code</label>
                          <input 
                             type="text" 
                             id="referral" 
                             defaultValue={session.user.referralCode || "PENDING"} 
                             disabled
                             className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-bold text-zinc-500 cursor-not-allowed uppercase tracking-widest"
                          />
                       </div>

                       {/* Role */}
                       <div className="space-y-2">
                          <label htmlFor="role" className="text-sm font-semibold text-zinc-900">Primary Role</label>
                          <select 
                             id="role" 
                             defaultValue={session.user.role || "student"} 
                             className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-all focus:border-[#25671E] focus:outline-none focus:ring-2 focus:ring-[#25671E]/20"
                          >
                             <option value="student">Student</option>
                             <option value="teacher">Teacher</option>
                             <option value="admin" disabled>Admin</option>
                          </select>
                       </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-zinc-100 pt-6">
                       <button type="button" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100">
                          Cancel
                       </button>
                       <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#25671E] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#1e5618] hover:shadow-md active:scale-95">
                          <Save className="h-4 w-4" />
                          Save Changes
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
