import { cn } from "@/lib/utils";

interface PasswordStrengthBarProps {
  password: string;
}

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length contribution
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Character variety contribution
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  // Cap at 5 for max strength
  return Math.min(5, strength);
}

function getStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "Very weak";
    case 2:
      return "Weak";
    case 3:
      return "Medium";
    case 4:
      return "Strong";
    case 5:
      return "Very strong";
    default:
      return "";
  }
}

function getStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-orange-500";
    case 3:
      return "bg-yellow-500";
    case 4:
      return "bg-lime-500";
    case 5:
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = calculatePasswordStrength(password);
  const segments = 5;

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index < strength
                ? getStrengthColor(strength)
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn(
        "text-xs font-medium",
        strength <= 1 && "text-red-600 dark:text-red-400",
        strength === 2 && "text-orange-600 dark:text-orange-400",
        strength === 3 && "text-yellow-600 dark:text-yellow-500",
        strength === 4 && "text-lime-600 dark:text-lime-400",
        strength === 5 && "text-green-600 dark:text-green-400"
      )}>
        Password strength: {getStrengthLabel(strength)}
      </p>
    </div>
  );
}

export { calculatePasswordStrength };
