"use client"

import { useState } from "react"
import { updatePlatformWallet } from "@/lib/actions"
import { QrCodeIcon } from "@heroicons/react/24/outline"

export default function AdminWalletManager({ wallets }: { wallets: any[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Local state for form management
  const [trcAddress, setTrcAddress] = useState(wallets.find(w => w.network === "TRC20")?.address || "")
  const [bepAddress, setBepAddress] = useState(wallets.find(w => w.network === "BEP20")?.address || "")
  const [trcQr, setTrcQr] = useState(wallets.find(w => w.network === "TRC20")?.qrCodePath || "/qr-trc20.png")
  const [bepQr, setBepQr] = useState(wallets.find(w => w.network === "BEP20")?.qrCodePath || "/qr-bep20.png")

  const handleSave = async (network: string) => {
      setLoading(true)
      setMessage("")
      try {
          const address = network === "TRC20" ? trcAddress : bepAddress
          const qrPath = network === "TRC20" ? trcQr : bepQr
          
          await updatePlatformWallet(network, address, qrPath)
          setMessage(`${network} Wallet updated successfully!`)
      } catch (error) {
          setMessage("Failed to update.")
      } finally {
          setLoading(false)
      }
  }

  return (
      <div className="space-y-8">
          {message && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200">
                  {message}
              </div>
          )}

          {/* TRC20 EDITOR */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><QrCodeIcon className="w-5 h-5"/></span>
                  USDT (TRC20) Settings
              </h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-1">Wallet Address</label>
                      <input 
                          type="text" 
                          value={trcAddress}
                          onChange={(e) => setTrcAddress(e.target.value)}
                          className="w-full p-3 border rounded-xl font-mono text-sm bg-gray-50"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-1">QR Code Image Path (in /public)</label>
                      <input 
                          type="text" 
                          value={trcQr}
                          onChange={(e) => setTrcQr(e.target.value)}
                          className="w-full p-3 border rounded-xl font-mono text-sm bg-gray-50"
                      />
                  </div>
                  <button 
                      onClick={() => handleSave("TRC20")}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                      {loading ? "Saving..." : "Save TRC20 Settings"}
                  </button>
              </div>
          </div>

          {/* BEP20 EDITOR */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg"><QrCodeIcon className="w-5 h-5"/></span>
                  BNB (BEP20) Settings
              </h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-1">Wallet Address</label>
                      <input 
                          type="text" 
                          value={bepAddress}
                          onChange={(e) => setBepAddress(e.target.value)}
                          className="w-full p-3 border rounded-xl font-mono text-sm bg-gray-50"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-1">QR Code Image Path (in /public)</label>
                      <input 
                          type="text" 
                          value={bepQr}
                          onChange={(e) => setBepQr(e.target.value)}
                          className="w-full p-3 border rounded-xl font-mono text-sm bg-gray-50"
                      />
                  </div>
                  <button 
                      onClick={() => handleSave("BEP20")}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                      {loading ? "Saving..." : "Save BEP20 Settings"}
                  </button>
              </div>
          </div>
      </div>
  )
}
