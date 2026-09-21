import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/user/auth/google/callback',
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        const email = profile.emails?.[0]?.value;
                        if (!email) {
                            return done(new Error('No email found in Google profile'), undefined);
                        }

                        // Check if user exists with this email
                        user = await User.findOne({ email });
                        if (user) {
                            user.googleId = profile.id;
                            user.isVerified = true;
                            await user.save();
                        } else {
                            user = new User({
                                googleId: profile.id,
                                firstName: profile.displayName || profile.name?.givenName || 'User',
                                lastName: profile.name?.familyName || null,
                                email,
                                isVerified: true,
                            });
                            await user.save();
                        }
                    }

                    return done(null, user);
                } catch (error: any) {
                    return done(error, undefined);
                }
            }
        )
    );
} else {
    console.warn('Google OAuth credentials not provided. Google auth is disabled.');
}

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
