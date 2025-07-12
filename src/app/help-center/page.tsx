
export default function HelpCenterPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">
          Help Center
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          How can we help you?
        </p>
      </div>
      <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed">
        <h2>Frequently Asked Questions</h2>
        <p>
          Welcome to the TicketFlow Help Center. This page is currently under construction, but soon you will find answers to common questions about creating events, purchasing tickets, and managing your account.
        </p>
        <h3>For Attendees</h3>
        <ul>
            <li>How do I find my tickets?</li>
            <li>Can I get a refund?</li>
            <li>Is my personal information secure?</li>
        </ul>
        <h3>For Organizers</h3>
        <ul>
            <li>How do I create an event?</li>
            <li>What are the fees for selling tickets?</li>
            <li>How do I scan tickets at my event?</li>
        </ul>
        <p>
            In the meantime, if you need assistance, please visit our <a href="/contact">Contact Us</a> page.
        </p>
      </div>
    </div>
  );
}
