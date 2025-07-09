import { CreateEventForm } from '@/components/create-event-form';

export default function CreateEventPage() {
  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
            Create and manage your events
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Our powerful tools make event management simple and effective.
          </p>
        </div>
        <CreateEventForm />
      </div>
    </div>
  );
}
