"use client";
import Navbar from "@/app/components/Navbar";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <>
    <Navbar/>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </div>
    </>
  );
}
