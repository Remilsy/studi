export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#C8D8C8]" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#3D553D] animate-spin" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5C7A5C]" />
          <span className="text-sm font-semibold text-[#3D553D] tracking-tight">Studi</span>
        </div>
      </div>
    </div>
  )
}
