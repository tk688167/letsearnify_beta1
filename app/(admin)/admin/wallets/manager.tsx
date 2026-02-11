"use client"

import { useState } from "react"
import { updatePlatformWallet } from "@/lib/actions"
import { QrCodeIcon } from "@heroicons/react/24/outline"

export default function AdminWalletManager({ wallets }: { wallets: any[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Local state for form management
  const [trcAddress, setTrcAddress] = useState(wallets.find(w => w.network === "TRC20")?.address || "")
  const [trcQr, setTrcQr] = useState(wallets.find(w => w.network === "TRC20")?.qrCodePath || "/qr-trc20.png")

  const handleSave = async (network: string) => {
      setLoading(true)
      setMessage("")
      try {
          const address = trcAddress
          const qrPath = trcQr
          
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
                      <label className="block text-sm font-bold text-gray-500 mb-1">QR Code Image</label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-full sm:w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                <img src={trcQr} alt="QR" className="w-full h-full object-contain mx-auto" />
                          </div>
                          <div className="flex-1 w-full">
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    
                                    setLoading(true)
                                    setMessage("Uploading...")
                                    
                                    const formData = new FormData()
                                    formData.append("file", file)
                                    
                                    try {
                                        // Dynamic Import to avoid server action issues if any
                                        const { uploadQRCode } = await import("@/app/actions/admin/upload")
                                        const res = await uploadQRCode(formData)
                                        if (res.success && res.path) {
                                            setTrcQr(res.path)
                                            setMessage("Image uploaded! Don't forget to click Save.")
                                        } else {
                                            setMessage(res.error || "Upload failed")
                                        }
                                    } catch (err) {
                                        setMessage("Upload error")
                                    }
                                    setLoading(false)
                                }}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100
                                  mb-2
                                "
                             />
                             <p className="text-xs text-gray-400">Current Path: <span className="font-mono break-all">{trcQr}</span></p>
                          </div>
                      </div>
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
      </div>
  )
}
