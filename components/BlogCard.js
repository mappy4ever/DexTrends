import Link from "next/link";

export default function BlogCard({ post }) {
  return (
    <div className="card hover:shadow-lg hover:scale-105 transition-all duration-300">
      <h3 className="blogheading-styling">{post.title}</h3>
      <p className="blogexcerpt-styling">{post.excerpt}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="text-sm bg-gray-200 px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <Link href={`/blog/${post.slug}`} className="transition-colors duration-300">
        Read More
      </Link>
    </div>
  );
}
