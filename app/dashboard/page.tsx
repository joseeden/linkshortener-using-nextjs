import { auth } from '@clerk/nextjs/server';
import { getLinksByUser } from '@/data/links';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, ExternalLink } from 'lucide-react';
import { CreateLinkModal } from '@/components/CreateLinkModal';
import { EditLinkModal } from '@/components/EditLinkModal';
import { DeleteLinkDialog } from '@/components/DeleteLinkDialog';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const links = await getLinksByUser(userId);

  return (
    <main className="mx-auto w-[60%] px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Links</h1>
        <CreateLinkModal />
      </div>
      {links.length === 0 ? (
        <p className="text-muted-foreground">You have no shortened links yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {links.map((link) => (
            <li key={link.id}>
              <Card>
                <CardContent className="flex items-start gap-3 py-4">
                  <Link2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      /{link.slug}
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="truncate">{link.url}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created at {link.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <EditLinkModal link={link} />
                    <DeleteLinkDialog id={link.id} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

