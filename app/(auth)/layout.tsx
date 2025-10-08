export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-7xl mx-auto py-4 sm:px-4 sm:py-8">
      {children}
    </div>
  )
}