import { renderMarkdown } from '../utils/markdown';

export default function ArticleDetail({ content }: { content: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
}
