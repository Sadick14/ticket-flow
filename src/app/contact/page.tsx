
export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">
          Contact Us
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          We&apos;d love to hear from you.
        </p>
      </div>
      <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed text-center">
        <p>
          If you have any questions, feedback, or need assistance, please don&apos;t hesitate to reach out.
        </p>
        <p>
          You can email us at: <a href="mailto:support@ticketflow.com">support@ticketflow.com</a>
        </p>
        <p>
            Our support team is available Monday to Friday, 9am to 5pm.
        </p>
      </div>
    </div>
  );
}
