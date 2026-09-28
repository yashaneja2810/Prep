import { AuthLayout } from "@/components/design/auth/auth-layout";
import { LoginForm } from "@/components/design/auth/login-form";

export default function LoginPage() {
  const visualProps = {
    title: "Welcome to GamutX",
    subtitle: "Your gateway to VFX and Digital Media education",
    features: [
      { icon: '🎬', label: 'Learn from experts' },
      { icon: '💻', label: 'Build your portfolio' },
      { icon: '🚀', label: 'Launch your career' }
    ]
  };

  const alternateAction = {
    text: "Don't have an account?",
    buttonText: "Sign Up",
    href: "/register"
  };

  return (
    <AuthLayout visualProps={visualProps} alternateAction={alternateAction}>
      <LoginForm />
    </AuthLayout>
  );
} 