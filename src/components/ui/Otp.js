import React, { useState, useEffect, useContext } from 'react';
import './css/otp.css';
import axios from 'axios';
import Api from '../WebApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';
const OTPForm = ({ setShowOtp, handleSendOtp, username, email, password, contact }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [resendTimer, setResendTimer] = useState(30);
    const [otpError, setotpError] = useState("");
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);
    const handleChange = (index, value) => {
        // Validate input as a single digit (0-9)
        // if (/^\d$/.test(value)) {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setotpError("")
        // }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const otpn = otp.join('');
            if (otp.length < 4) {
                setotpError("Invalid Otp")
            }
            const response = await axios.post(Api.registrationApi, { username, email, password, contact, otp: otpn });
            toast.success("OTP verified successfully");

            sessionStorage.setItem("current-user", JSON.stringify(response.data.user))
            sessionStorage.setItem("user-token", JSON.stringify(response.data.token))
            console.log(response.data);
            setUser(response.data.user);
            navigate("/");


        } catch (error) {
            if (error.response.status == 401) {
                toast.error("Inavlid Otp");
                setotpError("Inavlid otp");
            }
            else {
                toast.error("Internal server Error");
            }
        }

    };

    const handleResend = async () => {
        console.log('Resending OTP...');
        await handleSendOtp();
        setResendTimer(30);
    };

    useEffect(() => {
        let intervalId;
        if (resendTimer > 0) {
            intervalId = setInterval(() => {
                setResendTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }

        return () => clearInterval(intervalId); // Cleanup interval on component unmount or timer completion
    }, [resendTimer]);

    return (
        <div className='flex justify-center items-center w-full h-full'>
            <form className="otp-Form" onSubmit={handleSubmit}>
                <span className="mainHeading">Enter OTP</span>
                <p className="otpSubheading">We have sent a verification code to your Email Address</p>
                <div className="inputContainer">
                    {otp.map((value, index) => (
                        <input
                            key={index}
                            maxLength="1"
                            type="text"
                            className="otp-input"
                            id={`otp-input${index + 1}`}
                            value={value}
                            onChange={(e) => handleChange(index, e.target.value.trim())}
                        />
                    ))}
                </div>
                <button className="w-4/5 bg-[#272727] font-oswald font-medium hover:opacity-90 transition ease-in-out duration-100 mb-5 text-white p-1 rounded-lg" type="submit">Verify</button>
                <small style={{ color: "red", position: "abslute" }}>{otpError}</small>
                <p className="resendNote font-oswald">
                    Didn't receive the code?{' '}
                    {resendTimer === 0 ? (
                        <button className="resendBtn" type='btn' onClick={handleResend}>Resend Code</button>
                    ) : (
                        <span>Resend in {resendTimer} seconds</span>
                    )}
                </p>
                <button onClick={() => setShowOtp(false)} className='w-4/5 bg-[#272727] font-oswald font-medium hover:opacity-90 transition ease-in-out duration-100 mb-5 text-white p-1 rounded-lg'>Back</button>
            </form>
        </div>
    );
};

export default OTPForm;
