export default function SupportPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Support Center</h1>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
           <h2 className="font-bold mb-4">Contact Us</h2>
           <form className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1">Subject</label>
               <input type="text" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent" />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Message</label>
               <textarea className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent h-32"></textarea>
             </div>
             <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Send Ticket</button>
           </form>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
           <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl text-center">
              <h3 className="font-bold mb-2">Telegram</h3>
              <p className="text-zinc-500 text-sm">Join our community channel for instant updates.</p>
           </div>
           <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl text-center">
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-zinc-500 text-sm">support@letsearnify.com</p>
           </div>
        </div>
      </div>
    </div>
  )
}
