import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  slug: 'privacy',
  title: 'Privacy Policy - How TicketFlow Protects Your Data',
  description: 'Learn how TicketFlow collects, uses, and protects your personal information. Our comprehensive privacy policy explains your rights and our data practices.',
  image: '/og-privacy.jpg',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: July 12, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <h2>Introduction</h2>
            <p>
              TicketFlow ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our event management platform and services.
            </p>

            <h2>Information We Collect</h2>
            
            <h3>Personal Information</h3>
            <p>We may collect the following types of personal information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Bio, profile picture, organization details, and preferences</li>
              <li><strong>Event Information:</strong> Event details, descriptions, images, and related content you create</li>
              <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely through third-party providers)</li>
              <li><strong>Communication Data:</strong> Messages, support tickets, and feedback you send to us</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li><strong>Usage Data:</strong> How you interact with our platform, pages visited, and features used</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
              <li><strong>Cookies and Tracking:</strong> Information collected through cookies and similar technologies</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul>
              <li>Providing and maintaining our services</li>
              <li>Processing payments and managing subscriptions</li>
              <li>Communicating with you about your account and our services</li>
              <li>Sending notifications about events and platform updates</li>
              <li>Improving our platform and developing new features</li>
              <li>Ensuring security and preventing fraud</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2>Information Sharing and Disclosure</h2>
            
            <h3>We may share your information with:</h3>
            <ul>
              <li><strong>Event Attendees:</strong> When you create public events, certain information may be visible to attendees</li>
              <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (payment processors, email services, etc.)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>

            <h3>We do not:</h3>
            <ul>
              <li>Sell your personal information to third parties</li>
              <li>Share your information for marketing purposes without your consent</li>
              <li>Use your data for purposes other than those described in this policy</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2>Your Rights and Choices</h2>
            
            <h3>You have the right to:</h3>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correct:</strong> Update or correct inaccurate information</li>
              <li><strong>Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Export:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict:</strong> Limit how we process your information</li>
            </ul>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@ticketflow.com</li>
              <li><strong>Phone:</strong> +1 (555) 123-FLOW</li>
              <li><strong>Address:</strong> 123 Event St, San Francisco, CA 94102</li>
            </ul>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Questions or Concerns?</h3>
              <p className="text-blue-800">
                We're committed to protecting your privacy and being transparent about our data practices. 
                If you have any questions or concerns about this Privacy Policy, please don't hesitate to contact our privacy team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
