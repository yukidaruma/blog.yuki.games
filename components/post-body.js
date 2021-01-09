import markdownStyles from './markdown-styles.module.css';

export default function PostBody({ content }) {
  return (
    <div className="post-body max-w-2xl">
      <div
        className={markdownStyles['markdown-body']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
