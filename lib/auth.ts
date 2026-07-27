import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import * as schema from '../db/schema';
import { sendEmail, getVerificationEmailTemplate } from './email';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: schema
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { text, html } = getVerificationEmailTemplate(url);
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Aura Account',
        text,
        html
      });
    }
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user'
      },
      shippingAddress: {
        type: 'string',
        defaultValue: ''
      }
    }
  }
});
