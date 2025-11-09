/**
 * Skill Detail Page
 * Marketplace placeholder - redirects to specific skill pages
 */

interface SkillDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { slug } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Skill: {slug}</h1>
        <p className="text-muted-foreground">
          This is a placeholder marketplace page. Visit{' '}
          <a href="/skills/error-recovery-orchestrator" className="text-primary hover:underline">
            /skills/error-recovery-orchestrator
          </a>{' '}
          for the full skill detail page.
        </p>
      </div>
    </div>
  );
}
