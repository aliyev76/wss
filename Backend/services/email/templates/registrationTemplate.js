const registrationTemplate = (username, email, password) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; font-size: 16px; color: #444; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #4CAF50; font-size: 24px; margin-bottom: 10px;">🎉 Welcome to Our App, ${username}! 🎉</h1>
      <p style="color: #666; font-size: 14px;">We're excited to have you on board. Here are your account details:</p>
    </div>
    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <p style="margin: 0; font-size: 16px;"><strong style="color: #333;">Email:</strong> ${email}</p>
      <p style="margin: 0; font-size: 16px; margin-top: 10px;"><strong style="color: #333;">Password:</strong> ${password}</p>
    </div>
    <div style="margin-top: 20px; text-align: center;">
      <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 10px;">Log In to Your Account</a>
    </div>
    <div style="margin-top: 20px; text-align: center; color: #aaa; font-size: 14px;">
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The App Team</p>
    </div>
  </div>
`;
export default registrationTemplate;

