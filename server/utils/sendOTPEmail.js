import transporter from "../config/mail.js";

export async function sendOTPEmail(email, otp) {
    await transporter.sendMail({
        from: `"Gaming Matchmaking Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verification OTP",
        html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>Email Verification</h2>

            <p>Your verification code is:</p>

            <h1
                style="
                    letter-spacing:6px;
                    color:#2563eb;
                "
            >
                ${otp}
            </h1>

            <p>
                This OTP expires in
                <strong>5 minutes</strong>.
            </p>

            <hr>

            <small>
                If you didn't request this email,
                you can safely ignore it.
            </small>
        </div>
        `,
    });
}