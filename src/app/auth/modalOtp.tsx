<<<<<<< Updated upstream
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import styled from 'styled-components';
=======
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
>>>>>>> Stashed changes

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  outline: "none",
};

const ModalOTP = ({
  open,
  handleClose,
<<<<<<< Updated upstream
}: {
  open: boolean;
  handleClose: () => void;
}) => {
=======
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

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        <StyledWrapper>
          <form className="otp-Form">
            <span className="mainHeading">Enter OTP</span>

            <p className="otpSubheading">
              We have sent a verification code to your mobile number
            </p>

            <div className="inputContainer">
              <input required maxLength={1} type="text" className="otp-input" />
              <input required maxLength={1} type="text" className="otp-input" />
              <input required maxLength={1} type="text" className="otp-input" />
              <input required maxLength={1} type="text" className="otp-input" />
            </div>

            <button className="verifyButton" type="submit">
              Verify
            </button>
=======
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
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

            <p className="resendNote">
              Didn't receive the code?
              <button className="resendBtn" type="button">
                Resend Code
              </button>
            </p>
          </form>
        </StyledWrapper>
=======
          </p>
        </form>
>>>>>>> Stashed changes
      </Box>
    </Modal>
  );
};

<<<<<<< Updated upstream
const StyledWrapper = styled.div`
  .otp-Form {
    width: 230px;
    height: 300px;
    background-color: rgb(255, 255, 255);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 30px;
    gap: 20px;
    position: relative;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.082);
    border-radius: 15px;
  }

  .mainHeading {
    font-size: 1.1em;
    color: rgb(15, 15, 15);
    font-weight: 700;
  }

  .otpSubheading {
    font-size: 0.7em;
    color: black;
    line-height: 17px;
    text-align: center;
  }

  .inputContainer {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .otp-input {
    background-color: rgb(228, 228, 228);
    width: 30px;
    height: 30px;
    text-align: center;
    border: none;
    border-radius: 7px;
    caret-color: rgb(127, 129, 255);
    color: rgb(44, 44, 44);
    outline: none;
    font-weight: 600;
  }

  .otp-input:focus,
  .otp-input:valid {
    background-color: rgba(127, 129, 255, 0.199);
    transition-duration: 0.3s;
  }

  .verifyButton {
    width: 100%;
    height: 30px;
    border: none;
    background-color: rgb(127, 129, 255);
    color: white;
    font-weight: 600;
    cursor: pointer;
    border-radius: 10px;
    transition-duration: 0.2s;
  }

  .verifyButton:hover {
    background-color: rgb(144, 145, 255);
    transition-duration: 0.2s;
  }

  .exitBtn {
    position: absolute;
    top: 5px;
    right: 5px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.171);
    background-color: rgb(255, 255, 255);
    border-radius: 50%;
    width: 25px;
    height: 25px;
    border: none;
    color: black;
    font-size: 1.1em;
    cursor: pointer;
  }

  .resendNote {
    font-size: 0.7em;
    color: black;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .resendBtn {
    background-color: transparent;
    border: none;
    color: rgb(127, 129, 255);
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 700;
  }
`;

export default ModalOTP;
=======
export default ModalOTP;
>>>>>>> Stashed changes
