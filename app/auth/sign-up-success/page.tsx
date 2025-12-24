import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#16162a] border-[#4A90D9]/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
          <CardDescription className="text-white/60">We sent you a confirmation link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70">
            Please check your email and click the confirmation link to activate your admin account.
          </p>
          <div className="text-center">
            <Link href="/auth/login" className="text-[#4A90D9] hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
