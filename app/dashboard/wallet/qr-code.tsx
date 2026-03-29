import Image from "next/image"

export function QRCode({ network, imagePath }: { network: string, imagePath: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm relative w-48 h-48 mb-4">
         <Image 
            src={imagePath} 
            alt={`QR Code for ${network}`}
            fill
            className="object-contain p-2"
         />
      </div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Scan to Pay with</div>
      <div className="text-lg font-bold text-gray-900">{network}</div>
    </div>
  )
}
