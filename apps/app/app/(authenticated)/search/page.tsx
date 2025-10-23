import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { notFound, redirect } from 'next/navigation';
import { Header } from '../components/header';

type SearchPageProperties = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    title: `${q} - Search results`,
    description: `Search results for ${q}`,
  };
};

const SearchPage = async ({ searchParams }: SearchPageProperties) => {
  const { q } = await searchParams;
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  if (!q) {
    redirect('/');
  }

  const documents = await database.document.findMany({
    where: {
      fileName: {
        contains: q,
        mode: 'insensitive',
      },
    },
    include: {
      client: true,
    },
    take: 20,
  });

  return (
    <>
      <Header pages={['Search']} page="Search Results" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Search Results for "{q}"</h1>
          <p className="text-sm text-muted-foreground">
            Found {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="font-medium truncate">{doc.fileName}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Client: {doc.client?.name || 'Unknown'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        {documents.length === 0 && (
          <div className="flex items-center justify-center min-h-[200px] rounded-xl bg-muted/50">
            <p className="text-muted-foreground">No documents found matching "{q}"</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
