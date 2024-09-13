import nodemailer from 'nodemailer';
import { EmailRepository } from "../../domain/repositories/emailRepository";
import dotenv from 'dotenv';

dotenv.config();

export class EmailService implements EmailRepository {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    async sendApprovalEmail(email: string): Promise<void> {
        const mailOptions = {
            from: '"Edu-Nexus The E-learning Platform" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'Congratulations! You have been approved as an instructor',
            text: 'Dear Instructor,\n\nWe are thrilled to inform you that you have been approved as an instructor on Edu-Nexus. We are excited to see the impact you will make by sharing your knowledge and expertise with our learners.\n\nBest regards,\nThe Edu-Nexus Team',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #4CAF50;">Congratulations!</h1>
                        <h2>You have been approved as an instructor</h2>
                        <p>Dear Instructor,</p>
                        <p>We are thrilled to inform you that you have been approved as an instructor on <strong>Edu-Nexus</strong>.</p>
                        <p>We believe that your expertise and passion for teaching will greatly benefit our learners. Your courses will soon be available for thousands of students eager to learn from you.</p>
                        <p>Here are a few things you can do next:</p>
                        <ul>
                            <li><strong>Start Creating Courses:</strong> Log in to your instructor dashboard and begin creating engaging and informative courses.</li>
                            <li><strong>Engage with Students:</strong> Respond to student queries and participate in discussions to enhance the learning experience.</li>
                            <li><strong>Update Your Profile:</strong> Ensure your instructor profile is up-to-date with your latest information and a professional photo.</li>
                        </ul>
                        <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                        <p>We are excited to see the impact you will make by sharing your knowledge and expertise with our learners.</p>
                        <p>Best regards,</p>
                        <p><strong>The Edu-Nexus Team</strong></p>
                    </div>
                </div>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendRejectionEmail(email: string): Promise<void> {
        const mailOptions = {
            from: '"Edu-Nexus The E-learning Platform" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'Application Update: Your instructor application status',
            text: 'Dear Applicant,\n\nWe regret to inform you that your application to become an instructor on Edu-Nexus has been rejected at this time.\n\nIf you have any questions or would like further feedback, please feel free to contact our support team at support@edu-nexus.com.\n\nBest regards,\nThe Edu-Nexus Team',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #f44336;">Application Update</h1>
                        <h2>Your instructor application status</h2>
                        <p>Dear Applicant,</p>
                        <p>We regret to inform you that your application to become an instructor on <strong>Edu-Nexus</strong> has been rejected at this time.</p>
                        <p>If you have any questions or would like further feedback, please feel free to contact our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                        <p>Best regards,</p>
                        <p><strong>The Edu-Nexus Team</strong></p>
                    </div>
                </div>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }
    async sendCourseApprovalEmail(email: string, courseName: string): Promise<void> {
        const mailOptions = {
            from: `"Edu-Nexus The E-learning Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Course Has Been Approved!',
            text: `Dear Instructor,\n\nWe are pleased to inform you that your course "${courseName}" has been approved and is now live on Edu-Nexus.\n\nBest regards,\nThe Edu-Nexus Team`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #4CAF50;">Course Approved!</h1>
                        <h2>Your course "${courseName}" is now live</h2>
                        <p>Dear Instructor,</p>
                        <p>We are pleased to inform you that your course <strong>"${courseName}"</strong> has been approved and is now live on <strong>Edu-Nexus</strong>.</p>
                        <p>Thank you for your contribution and we are excited to see the impact your course will make on our learners.</p>
                        <p>If you have any questions or need further assistance, feel free to reach out to our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                        <p>Best regards,</p>
                        <p><strong>The Edu-Nexus Team</strong></p>
                    </div>
                </div>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendCourseRejectionEmail(email: string, courseName: string): Promise<void> {
        const mailOptions = {
            from: `"Edu-Nexus The E-learning Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Course Submission Update: Your course has not been approved',
            text: `Dear Instructor,\n\nWe regret to inform you that your course "${courseName}" has not been approved. Please review our guidelines and resubmit after making the necessary changes.\n\nBest regards,\nThe Edu-Nexus Team`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #f44336;">Course Not Approved</h1>
                        <h2>Your course "${courseName}" was not approved</h2>
                        <p>Dear Instructor,</p>
                        <p>We regret to inform you that your course <strong>"${courseName}"</strong> has not been approved.</p>
                        <p>Please review our guidelines and make the necessary changes before resubmitting.</p>
                        <p>If you have any questions or need further assistance, feel free to reach out to our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                        <p>Best regards,</p>
                        <p><strong>The Edu-Nexus Team</strong></p>
                    </div>
                </div>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }
    async sendPaymentFailureEmail(email: string, courseName: string, amount: number, currency: string): Promise<void> {
        const mailOptions = {
            from: `"Edu-Nexus The E-learning Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Payment Failure Notification',
            text: `Dear User,\n\nWe regret to inform you that your payment for the course "${courseName}" has failed. The amount was ${amount} ${currency}. Please try again or contact our support team if you need assistance.\n\nBest regards,\nThe Edu-Nexus Team`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #f44336;">Payment Failure Notification</h1>
                        <p>Dear User,</p>
                        <p>We regret to inform you that your payment for the course <strong>"${courseName}"</strong> has failed.</p>
                        <p>Payment details:</p>
                        <ul>
                            <li>Amount: ${amount} ${currency}</li>
                        </ul>
                        <p>Please try again or contact our support team if you need assistance.</p>
                        <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                        <p>Best regards,</p>
                        <p><strong>The Edu-Nexus Team</strong></p>
                    </div>
                </div>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }

     async  sendVerificationNotification(email: string, currently_due: string[]): Promise<void> {
        const mailOptions = {
          from: `"Edu-Nexus The E-learning Platform" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Action Required: Complete Your Stripe Verification',
          text: `
            Dear User,
      
            We are reaching out to inform you that there are pending verification requirements related to your Stripe account for the course payment process.
      
            Here is the list of requirements that need your attention:
            ${currently_due.join('\n')}
      
            Please complete these requirements to ensure that your account is fully verified and you can continue to receive payments without interruptions.
      
            If you have any questions or need assistance, please contact our support team at support@edu-nexus.com.
      
            Best regards,
            The Edu-Nexus Team
          `,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px;">
                <h1 style="color: #4CAF50;">Action Required: Complete Your Stripe Verification</h1>
                <p>Dear User,</p>
                <p>We are reaching out to inform you that there are pending verification requirements related to your Stripe account for the course payment process.</p>
                <p>Here is the list of requirements that need your attention:</p>
                <ul>
                  ${currently_due.map(req => `<li>${req}</li>`).join('')}
                </ul>
                <p>Please complete these requirements to ensure that your account is fully verified and you can continue to receive payments without interruptions.</p>
                <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                <p>Best regards,</p>
                <p><strong>The Edu-Nexus Team</strong></p>
              </div>
            </div>
          `,
        };
      
        try {
          await this.transporter.sendMail(mailOptions);
          console.log('Verification email sent successfully.');
        } catch (error) {
          console.error('Error sending verification email:', error);
        }
      }
      async sendKycVerificationCompletedEmail(email: string): Promise<void> {
        const mailOptions = {
            from: `"Edu-Nexus The E-learning Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'KYC Verification Completed Successfully!',
            text: `
                Dear User,

                We are pleased to inform you that your KYC verification has been successfully completed.

                Your account is now fully verified, and you can continue to enjoy all the features of our platform without any interruptions.

                If you have any questions or need further assistance, please feel free to contact our support team at support@edu-nexus.com.

                Best regards,
                The Edu-Nexus Team
            `,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #00796b;">KYC Verification Completed Successfully!</h1>
                        <p>Dear User,</p>
                        <p>We are pleased to inform you that your KYC verification has been successfully completed.</p>
                        <p>Your account is now fully verified, and you can continue to enjoy all the features of our platform without any interruptions.</p>
                        <p>If you have any questions or need further assistance, please feel free to contact our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                        <p>Best regards,</p>
                        <p><strong>The Edu-Nexus Team</strong></p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('KYC verification completed email sent successfully.');
        } catch (error) {
            console.error('Error sending KYC verification completed email:', error);
        }
    }

    async sendKycVerificationFailedEmail(email: string, currently_due: string[]): Promise<void> {
        const mailOptions = {
            from: `"Edu-Nexus The E-learning Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Action Required: KYC Verification Failed',
            text: `
                Dear User,

                We regret to inform you that your KYC verification has failed due to the following reasons:

                ${currently_due.join('\n')}

                Please address these issues to complete your KYC verification and ensure that your account is fully verified.

                If you need assistance or have any questions, please contact our support team at support@edu-nexus.com.

                Best regards,
                The Edu-Nexus Team
            `,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #ffebee; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #d32f2f;">Action Required: KYC Verification Failed</h1>
                        <p>Dear User,</p>
                        <p>We regret to inform you that your KYC verification has failed due to the following reasons:</p>
                        <ul>
                            ${currently_due.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                        <p>Please address these issues to complete your KYC verification and ensure that your account is fully verified.</p>
                        <p>If you need assistance or have any questions, please contact our support team at <a href="mailto:support@edu-nexus.com">support@edu-nexus.com</a>.</p>
                        <p>Best regards,</p>
                        <p><strong>The Edu-Nexus Team</strong></p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('KYC verification failed email sent successfully.');
        } catch (error) {
            console.error('Error sending KYC verification failed email:', error);
        }
    }
}
