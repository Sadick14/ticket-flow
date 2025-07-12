
export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Your privacy is important to us.
        </p>
      </div>
      <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed">
        <p>
          This is a placeholder for the TicketFlow Privacy Policy. In a real application, this page would detail the types of personal information we collect, how we use it, and the steps we take to protect it.
        </p>
        <p>
          Topics covered would typically include:
        </p>
        <ul>
            <li>Information Collection and Use</li>
            <li>Log Data</li>
            <li>Cookies</li>
            <li>Service Providers</li>
            <li>Security</li>
            <li>Links to Other Sites</li>
            <li>Children&apos;s Privacy</li>
            <li>Changes to This Privacy Policy</li>
        </ul>
        <p>
            We are committed to being transparent about our data practices. For any immediate questions, please <a href="/contact">contact us</a>.
        </p>
      </div>
    </div>
  );
}
