import { AuthLayout } from "@/components/design/auth/auth-layout";
import { RegisterForm } from "@/components/design/auth/register-form";

export default function RegisterPage() {
  const visualProps = {
    title: "Join GamutX Today",
    subtitle: "Start your journey in VFX and Digital Media",
    features: [
      { icon: '🎓', label: 'Expert training', color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20' },
      { icon: '🛠️', label: 'Practical skills', color: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20' },
      { icon: '🌐', label: 'Industry network', color: 'bg-gradient-to-br from-green-500/20 to-green-600/20' }
    ]
  };

  const alternateAction = {
    text: "Already have an account?",
    buttonText: "Login",
    href: "/login"
  };

  return (
    <AuthLayout visualProps={visualProps} alternateAction={alternateAction}>
      <RegisterForm />
    </AuthLayout>
  );
} 