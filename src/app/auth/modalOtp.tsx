"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  outline: "none",
};

type ModalOTPProps = {
  email?: string;
  error?: string;
  handleClose: () => void;
  isSubmitting?: boolean;
  onResend?: () => void;
  onVerify: (otp: string) => void;
  open: boolean;
};

const ModalOTP = ({
  email,
  error,
  open,
  handleClose,
  isSubmitting = false,
  onResend,
  onVerify,
}: ModalOTPProps) => {
  const [otpValues, setOtpValues] = React.useState(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (open) {
      setOtpValues(["", "", "", "", "", ""]);
      window.setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }
  }, [open]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextValues = [...otpValues];

    nextValues[index] = digit;
    setOtpValues(nextValues);

    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...otpValues];
    for (let i = 0; i < pasted.length && index + i < next.length; i += 1) {
      next[index + i] = pasted[i] ?? "";
    }
    setOtpValues(next);
    const focusAt = Math.min(index + pasted.length, next.length - 1);
    inputRefs.current[focusAt]?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onVerify(otpValues.join(""));
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.72)" },
        },
      }}
    >
      <Box sx={style}>
        <form
          className="relative flex w-[min(100vw-2rem,380px)] flex-col items-center gap-5 rounded-2xl border border-gray-700 bg-gray-900 p-8 shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
          noValidate
          onSubmit={handleSubmit}
        >
          <button
            type="button"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 bg-gray-800/80 text-lg leading-none text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-700 hover:text-white"
            onClick={handleClose}
            aria-label="Đóng"
          >
            ×
          </button>

          <h2 className="mt-2 text-center text-lg font-bold tracking-tight text-white">Nhập mã OTP</h2>

          <p className="text-center text-sm leading-relaxed text-gray-400">
            Chúng tôi đã gửi mã xác minh đến{" "}
            <span className="font-semibold text-yellow-400">{email || "email của bạn"}</span>
          </p>

          <div className="flex w-full justify-center gap-2.5 sm:gap-3">
            {otpValues.map((value, index) => (
              <input
                key={`otp-${index}`}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                maxLength={1}
                inputMode="numeric"
                autoComplete="one-time-code"
                type="text"
                className="h-11 w-10 rounded-xl border border-gray-600 bg-gray-800/80 text-center text-base font-semibold text-white caret-yellow-400 outline-none transition-all focus:border-yellow-500 focus:bg-gray-800 focus:ring-1 focus:ring-yellow-500 sm:h-12 sm:w-11"
                style={{ colorScheme: "dark" }}
                value={value}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                onPaste={(event) => handleOtpPaste(index, event)}
              />
            ))}
          </div>

          {error ? <p className="text-center text-xs font-medium text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-xl bg-linear-to-r from-yellow-500 to-amber-500 py-3 text-sm font-bold text-black transition-all hover:from-yellow-400 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? "Đang xác minh…" : "Xác minh"}
          </button>

          <p className="flex flex-col items-center gap-1.5 text-center text-xs text-gray-400">
            <span>Bạn không nhận được mã?</span>
            <button
              type="button"
              className="font-bold text-yellow-500 transition-colors hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onResend}
              disabled={isSubmitting}
            >
              Gửi lại mã
            </button>
          </p>
        </form>
      </Box>
    </Modal>
  );
};

export default ModalOTP;

