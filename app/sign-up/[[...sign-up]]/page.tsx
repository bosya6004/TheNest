"use client";
import Navbar from "@/app/components/Navbar";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <>
    <Navbar />
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </div>
    </>
  );
}
