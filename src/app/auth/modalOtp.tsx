"use client";

import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import styled from 'styled-components';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  outline: 'none',
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onVerify(otpValues.join(""));
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <StyledWrapper>
          <form className="otp-Form" onSubmit={handleSubmit}>
            <span className="mainHeading">Enter OTP</span>

            <p className="otpSubheading">
              We have sent a verification code to {email || "your email"}
            </p>

            <div className="inputContainer">
              {otpValues.map((value, index) => (
                <input
                  key={`otp-${index}`}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  required
                  maxLength={1}
                  inputMode="numeric"
                  type="text"
                  className="otp-input"
                  value={value}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                />
              ))}
            </div>

            {error ? <p className="errorText">{error}</p> : null}

            <button className="verifyButton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>

            <button
              className="exitBtn"
              type="button"
              onClick={handleClose}
            >
              ×
            </button>

            <p className="resendNote">
              Didn&apos;t receive the code?
              <button className="resendBtn" type="button" onClick={onResend} disabled={isSubmitting}>
                Resend Code
              </button>
            </p>
          </form>
        </StyledWrapper>
      </Box>
    </Modal>
  );
};

const StyledWrapper = styled.div`
  .otp-Form {
    width: 320px;
    min-height: 320px;
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

  .errorText {
    margin: -8px 0 0;
    color: rgb(239, 68, 68);
    font-size: 0.72em;
    font-weight: 600;
    text-align: center;
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

  .verifyButton:disabled,
  .resendBtn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
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
