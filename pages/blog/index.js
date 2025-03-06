import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "../../components/HeroSection";

const blogPosts = [
  {
    slug: "launching-our-business",
    title: "Launching Our Business: Transforming Data into Business Success",
    date: "February 1, 2025",
    excerpt: "Discover the motivation behind our BI solutions, our commitment to innovation, and how real-time analytics is changing the industry.",
    image: "/blog-1.jpg",
    tags: ["Consulting", "Real-time Analytics", "Strategy", "Business", "Enterprise"],
  },
];

export default function Blog() {
  const [selectedTags, setSelectedTags] = useState([]);

  const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags)));

  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const filteredPosts = selectedTags.length
    ? blogPosts.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
    : blogPosts;

  return (
    <div>
      <HeroSection
        title="News & Resources"
        subtitle="Stay in the Know."
        description="Keep up-to-date with our latest insights in business intelligence."
        backgroundImage="/blog-hero.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-20 flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Tag Filter Section */}
        <div className="md:w-1/4">
          <h3 className="subheading-styling mb-4">Filter by Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`btn-secondary hover:scale-100 text-sm ${
                  selectedTags.includes(tag)
                    ? "bg-button-hover"
                    : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Section */}
        <div className="md:w-3/4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card">
                <div className="relative h-52">
                  <Image
                    src={post.image}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-card"
                  />
                </div>
                <div className="p-6">
                  <h2 className="blogheading-styling">{post.title}</h2>
                  <p className="faq-styling text-base ml-4">{post.date}</p>
                  <p className="blogexcerpt-styling">{post.excerpt}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-sm bg-background px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-xl col-span-2">No blog posts found for selected tags.</p>
          )}
        </div>
      </div>
    </div>
  );
}
