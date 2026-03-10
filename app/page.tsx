"use client"

import { useEffect, useState } from "react"
import ApplicantTable from "@/components/applicant/table"
import { LoginForm } from "@/components/auth/login-form"

const Page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const auth = sessionStorage.getItem("isAuth")
    setIsAuthenticated(auth === "true")
  }, [])

  if (isAuthenticated === null) {
    return null // or a loading spinner
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />
  }

  return <ApplicantTable />
}

export default Page;

