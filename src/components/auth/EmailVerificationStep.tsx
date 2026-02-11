import { FC, FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonSpinner } from "@/components/ui/loader";

interface EmailVerificationStepProps {
  email: string;
  otp: string;
  setOtp: (value: string) => void;
  loading: boolean;
  onVerify: () => Promise<void>;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
}

const EmailVerificationStep: FC<EmailVerificationStepProps> = ({
  email,
  otp,
  setOtp,
  loading,
  onVerify,
  onResend,
  onChangeEmail,
}) => {
  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setOtp(cleaned);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || loading) return;
    await onVerify();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-1">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Verify your email</h3>
          <p className="text-xs text-muted-foreground mt-1">
            We&apos;ve sent a 6-digit verification code to:
          </p>
          <p className="text-sm font-medium mt-1 break-all">{email}</p>
          <button
            type="button"
            className="mt-1 text-xs text-primary hover:underline"
            onClick={onChangeEmail}
            disabled={loading}
          >
            Use a different email
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp-input" className="text-xs">
          Verification code
        </Label>
        <Input
          id="otp-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          placeholder="123456"
          className="tracking-[0.4em] text-center text-lg font-semibold placeholder:text-muted-foreground/60"
          value={otp}
          onChange={(e) => handleOtpChange(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          This code will expire in <span className="font-medium">15 minutes</span>.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || otp.length !== 6}
      >
        {loading ? (
          <>
            <ButtonSpinner className="mr-2" />
            Verifying...
          </>
        ) : (
          "Verify & Create Account"
        )}
      </Button>

      <div className="space-y-2 text-center">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t get the code? Check your spam folder or
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full text-xs"
          onClick={onResend}
          disabled={loading}
        >
          {loading ? (
            <>
              <ButtonSpinner className="mr-2" />
              Resending...
            </>
          ) : (
            "Resend Code"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EmailVerificationStep;
