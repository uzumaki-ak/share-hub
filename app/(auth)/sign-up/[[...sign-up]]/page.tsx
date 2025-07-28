import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">ShareSpace</h1>
          <p className="text-slate-400">Join our sharing community</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-slate-900 border border-slate-800",
              headerTitle: "text-slate-100",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700",
              formFieldInput: "bg-slate-800 border-slate-700 text-slate-100",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
