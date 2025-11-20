
import User from './models/User';
import Faq from './models/Faq';
import SuccessStory from './models/SuccessStory';
import BlogPost from './models/BlogPost';
import Offer from './models/Offer';
import Plan from './models/Plan'; // Import Plan model
import { AdminRole, Gender, MaritalStatus, MembershipTier, Religion, UserStatus, OccupationCategory } from '../types';

export const seedDatabase = async () => {
    try {
        // Seed Plans if not present (Essential for app function)
        if (await Plan.countDocuments() === 0) {
            console.log('Seeding membership plans...');
            await Plan.create([
                { 
                    name: MembershipTier.FREE, priceMonthly: '₹0 / month', cta: 'Current Plan',
                    features: [ { text: '5 Profile Views / day', included: true }, { text: 'Send 10 Interests', included: true }, { text: 'Basic Search Filters', included: true }, { text: 'Limited Chat (Mutual only)', included: true }, { text: 'View Contact Numbers', included: false }, { text: 'Priority Profile Boost', included: false } ]
                },
                { 
                    name: MembershipTier.SILVER, priceMonthly: '₹499 / month', priceYearly: '₹4999 / year (Save 15%)', cta: 'Upgrade to Silver',
                    features: [ { text: '50 Profile Views / day', included: true }, { text: 'Send 50 Interests', included: true }, { text: 'Advanced Search Filters', included: true }, { text: 'Unlimited Chat', included: true }, { text: 'View 10 Contact Numbers', included: true }, { text: 'Weekly Profile Boost', included: false } ]
                },
                { 
                    name: MembershipTier.GOLD, priceMonthly: '₹999 / month', priceYearly: '₹9999 / year (Save 20%)', highlight: true, cta: 'Upgrade to Gold',
                    features: [ { text: 'Unlimited Profile Views', included: true }, { text: 'Send Unlimited Interests', included: true }, { text: 'All Search Filters', included: true }, { text: 'Unlimited Chat + Video Call option', included: true }, { text: 'View 25 Contact Numbers', included: true }, { text: 'Daily Profile Boost', included: true }, { text: 'Priority Customer Support', included: true } ]
                },
                { 
                    name: MembershipTier.DIAMOND, priceMonthly: '₹1999 / month', priceYearly: '₹19999 / year (Save 25%)', cta: 'Upgrade to Diamond',
                    features: [ { text: 'All Gold Plan Features', included: true }, { text: 'Dedicated Relationship Manager', included: true }, { text: 'Profile Highlighted in Search', included: true }, { text: 'Exclusive Event Access', included: true }, { text: 'View 50 Contact Numbers', included: true } ]
                },
            ]);
        }

        // Seed Admin User if no users exist (Essential for administration)
        if (await User.countDocuments() === 0) {
            console.log('Seeding database with initial admin user...');
            await User.create([
                {
                    fullName: 'Super Admin',
                    email: 'admin@example.com',
                    password: 'password123',
                    gender: Gender.OTHER,
                    dateOfBirth: '1990-01-01',
                    mobileNumber: '9999999999',
                    isEmailVerified: true,
                    isMobileVerified: true,
                    role: AdminRole.SUPER_ADMIN,
                    status: UserStatus.ACTIVE,
                }
            ]);
        }

        // Seed FAQs if not present (Essential content)
        if (await Faq.countDocuments() === 0) {
            console.log('Seeding FAQs...');
            await Faq.create([
                { question: 'How do I create a profile?', answer: 'Simply click the "Join Now" button and follow the multi-step registration process. It\'s easy and takes only a few minutes!' },
                { question: 'Is my data safe?', answer: 'Yes, we prioritize your privacy and security. We use industry-standard encryption and you have full control over your privacy settings.' },
                { question: 'How can I contact a member?', answer: 'You can express interest in a member. If they accept, you can start a conversation through our secure chat platform.' },
            ]);
        }

        // --- REAL DATA MODE ACTIVE ---
        // All demo/mock data generation (users, stories, blogs, offers) has been disabled.
        // The application will now rely solely on data entered via the UI or API.
        
        console.log('Database check complete. Running in Real Data mode (No demo data seeded).');

    } catch (error) {
        console.error('Error during database seeding:', error);
    }
};
